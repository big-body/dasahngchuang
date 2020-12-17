// 引入模块
const { requestQuery, connection } = require("../database/db")
const stringRandom = require('string-random');
const moment = require("moment") // 格式化时间的模块
const bcrypt = require('bcryptjs'); // 加密模块
const salt = bcrypt.genSaltSync(8);
const JWT = require("./token")
const { iHuyi } = require("./IHuyi")
const SvgCaptcha = require('svg-captcha');
//定义一个变量来临时存储手机号
var tempPhone = null

//定义一个变量来存储临时手机验证码
var tempCode = null

//定义一个变量来存储随机验证码
var tempCaptcha = null



// 用户列表
exports.UserList = async(req, res) => {
    const userSql = "SELECT * FROM users WHERE is_show=1"
    const userList = await requestQuery(userSql)
    res.json({
        data: userList
    })
}

// 用户注册
exports.UserRegister = (req, res) => {
    // 要用post发送数据
    let user_name = req.body.user_name
    let login_password = req.body.login_password
    let phone = req.body.phone

    let sql_name = "SELECT user_name from users WHERE user_name=? AND is_show=1"
        // 获取当前的时间  2020-12-07 20:41:36
    let nowDate = moment().format('YYYY-MM-DD HH:mm:ss');
    connection.query(sql_name, user_name, (err, result_name) => {
        if (err) {
            return res.json({
                msg: "用户注册失败",
                status: 1615,
                data: err
            })
        }

        if (result_name == "") {

            let sql_phone = "SELECT phone from users WHERE phone=? AND is_show=1"
            connection.query(sql_phone, phone, (err, result_phone) => {

                if (err) {
                    return res.json({
                        msg: "用户注册失败",
                        status: 1616,
                        data: err
                    })
                }
                if (result_phone == "") {
                    let sql_register = 'INSERT INTO users SET user_name=?,login_password=?,phone=?,is_show=1,create_time="${nowDate}"'
                        // 给密码加密
                    const hPassword = bcrypt.hashSync(login_password, salt)
                    connection.query(sql_register, [user_name, hPassword, phone], (err, result) => {
                        if (err) {
                            return res.json({
                                msg: "用户注册失败",
                                status: 1635,
                                data: err
                            })
                        }
                        if (result.affectedRows == 1) {
                            return res.json({
                                msg: "恭喜您成功注册,可以去登陆了",
                                status: 200,
                                data: result
                            })
                        } else {
                            return res.json({
                                msg: "用户注册失败",
                                status: 1663,
                                data: err
                            })
                        }
                    })
                } else {
                    return res.json({
                        msg: "该手机号已经存在了，请换个手机号注册",
                        status: 500
                    })
                }
            })

        } else {
            return res.json({
                msg: "该用户名已经存在，请更换用户名注册",
                status: 500
            })
        }
    })
}


// 用户登录
exports.UserLogin = async(req, res) => {
        // 要post发送数据
        const user_name = req.body.user_name
        const captcha = req.body.captcha;
        console.log(1111111);
        console.log(captcha)
        console.log(user_name)
        console.log(11111111);

        if (captcha != tempCaptcha) {
            return res.json({
                status: 4111,
                msg: "验证码不正确"
            })
        }
        const sql = `SELECT user_name,login_password from users WHERE user_name=? AND is_show=1`

        connection.query(sql, [user_name], (err, result) => {
            if (err) {
                return res.json({
                    msg: "数据库查询失败",
                    status: 500
                })
            }
            if (result == "") {
                return res.json({
                    msg: "该用户不存在,等您注册呢",
                    status: 1617
                })
            } else {
                const login_password = bcrypt.compareSync(req.body.login_password, result[0].login_password)
                if (login_password != true) {
                    return res.status(500).json({
                        msg: "密码错误，请重新输入",
                    })
                } else {
                    let token = JWT.createToken({
                        login: true,
                        user_name: user_name
                    })
                    return res.json({
                        status: 200,
                        mag: "登录成功",
                        data: result,
                        token: token
                    })
                }
            }
        })

    }
    // 获取验证码的接口
exports.GetIdentCode = async(req, res) => {
    console.log(req.body, "fdskjlafjlads;fjklds;jfkl;asd")
    for (var phoneattr in req.body) {
        var phone = phoneattr
        tempPhone = phoneattr // 临时手机号变量赋值
    }

    var indentCode = ("000000" + Math.floor(Math.random() * 999999)).slice(-6)
    tempCode = indentCode
    console.log(tempCode);
    let MessContent = "您的验证码是：" + indentCode + "。请不要把验证码泄露给其他人。"
    iHuyi.send(phone, MessContent, (err, smsId) => {
        if (err) {
            console.log(err.message)
        } else {
            res.json({
                msg: "发送成功",
                status: 200,
                data: indentCode
            })
            console.log("SMS sent, and smsId is " + smsId);
        }
    })
}

// 短信登录
exports.PhoneLogin = async(req, res) => {
    console.log(req.body.phone); // 手机号
    console.log(req.body.code); // 验证码
    var phone = req.body.phone
    var code = req.body.code
    var captcha = req.body.captcha.toLowerCase();
    if (code != tempCode) {
        return res.json({
            status: 4101,
            msg: "短信验证码"
        })
    } else if (phone != tempPhone) {
        return res.json({
            status: 4102,
            msg: "手机号不正确"
        })
    } else if (captcha != tempCaptcha) {
        return res.json({
            status: 4103,
            msg: "验证码不正确"
        })
    } else {
        // 判断手机号是否存在

        // console.log(sql_phone);
        console.log(phone);
        const sql_phone = "SELECT * from users WHERE phone=? AND is_show=1"
        const phone_result = await requestQuery(sql_phone, phone)
        if (phone_result.length == 0) {

            const user_name = "qqz_" + stringRandom(8)

            let nowDate = moment().format('YYYY-MM-DD HH-mm-ss');
            let sql_register = `INSERT INTO users (user_name,phone,is_show,create_time) VALUES ("${user_name}","${phone}","1","${nowDate}")`
                // 注册
            let phoneRegister = await requestQuery(sql_register)
            let result = await requestQuery(sql_phone, phone)

            console.log(phoneRegister);
            console.log(result);

            if (phoneRegister.affectedRows == 1) {
                let token = JWT.createToken({
                    login: true,
                    phone: result[0].phone
                })
                return res.json({
                    status: 200,
                    msg: "登录成功",
                    data: result,
                    token: token
                })
            } else {
                return res.json({
                    status: 500,
                    mag: "服务器错误"
                })
            }
        } else {
            let token = JWT.createToken({
                login: true,
                phone: phone_result[0].phone
            })
            return res.json({
                status: 200,
                msg: "登录成功",
                data: phone_result,
                token: token
            })
        }
    }

}

// 生成验证码
exports.SvgCaptcha = async(req, res) => {
    var captcha = SvgCaptcha.create({
        size: 4, // 字符串的长度
        ignoreChars: '0o1i', // 排除的字符
        noise: 2, // 线条
        color: 'green', // 文字颜色
        background: '#cccccc', // 背景颜色
    });
    tempCaptcha = captcha.text;
    console.log(tempCaptcha);
    res.type('svg');
    res.status(200).send(captcha.data);
    console.log(captcha.text);
}