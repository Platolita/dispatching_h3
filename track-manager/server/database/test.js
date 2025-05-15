const fs = require('fs');
const path = require('path');
const h3 = require('h3-js');
const mysql = require('mysql');

// 数据库配置
const dbConfig = require('../conf/db').mysql;
const pool = mysql.createPool(dbConfig);



// 连接pro1数据库，执行"select * from driver where driverID > 2;"
function main() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('数据库连接出错: ', err);
            return;
        }
        const sql = "select * from driver where driverID > 2;";
        connection.query(sql, (error, results, fields) => {
            // 释放连接
            connection.release();
            if (error) {
                console.error('执行查询出错: ', error);
                return;
            }
            // 输出查询结果
            console.log('查询结果: ', results);
        });
    });
}

main();