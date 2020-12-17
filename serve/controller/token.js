const jwt = require('jsonwebtoken');
const suibian = "ashdalksjdlkahdfkuhl"

// 创建token的方法
function createToken(obj) {
    obj.time = Date.now()
    return jwt.sign(obj, suibian, { expiresIn: 60 * 60 });
}

// 验证token
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, suibian, (err, data) => {
            if (err) {
                reject("token失效")
            }
            resolve(data)
        })
    })
}

module.exports = {
    createToken,
    verifyToken
}