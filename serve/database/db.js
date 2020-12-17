const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost', // 域名或者IP地址
    user: 'root', // mysql数据库的用户名
    password: '', // mysql数据库的密码
    database: 'host' // 要链接数据库的名字
});

// 封装查询方法，给不同的sql查询对相应的数据
function requestQuery(sql, Arr) {
    return new Promise((resolve, reject) => {
        connection.query(sql, [Arr], (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}


// 暴露
module.exports = {
    connection,
    requestQuery // requestQuery : requestQuery
}