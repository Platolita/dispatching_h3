const { createPool } = require('mysql');
const _mysql = require('../conf/db').mysql;
var pool  = createPool(_mysql);
const h3 = require('h3-js'); // 引入H3库

var jsonWrite = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({
            code:'1',
            msg: '操作失败'
        });
    } else if(ret.length == 0) {
        res.json({
            code:'1',
            msg:'not found'
        });
    } else {
            res.json(ret)
    }
};


module.exports.getPassengerCount = function(req, res, next) {
    pool.getConnection(function (err, connection) {
        var param = req.query || req.params;
        connection.query('SELECT count(*) as count from passenger', function (err, result) {
            if (err) {
                console.log(err);
            }
            if (result) {
                console.log(result);
                console.log('query success');
            }
            jsonWrite(res, result);
            connection.release();
        });
    });
}
module.exports.getAllPassenger= function(req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log('Error getting connection:', err);
            return res.status(500).send('Database connection error');
        }
        connection.query('SELECT * from passenger', function (err, result) {
            if (err) {
                console.log('Query error:', err);
                return res.status(500).send('Query execution failed');
            }
            
            if (result) {
                console.log('Query success');
            }
            
            jsonWrite(res, result);
            connection.release();
        });
    });
}

module.exports.getPassengerByID= function(req, res, next) {
    pool.getConnection(function (err, connection) {
        var param = req.query || req.params;
        console.log('param is');
        console.log(param);
        connection.query('SELECT * from passenger where passengerid=' + param.id, function (err, result) {
            if (err) {
                console.log(err);
            }
            if (result) {
                console.log('query success');
            }
            jsonWrite(res, result);
            connection.release();
        });
    });
}
module.exports.addPassenger= function(req, res, next) {
    pool.getConnection(function (err, connection) {
        console.log(req.body);
        connection.query('insert into passenger values ( ' + req.body.passengerid + ' , \'' + req.body.passengername + '\' , \'' + req.body.phone + '\' )', function (err, result) {
            if (err) {
                console.log(err);
            }
            if (result) {
                console.log(result);
                console.log('query success');
            }
            jsonWrite(res, result);
            connection.release();
        });
    });
}
module.exports.deletePassenger= function(req, res, next) {
    pool.getConnection(function (err, connection) {
        console.log(req.body);
        connection.query('delete from passenger where passengerid=' + req.body.id, function (err, result) {
            if (err) {
                console.log(err);
            }
            if (result) {
                console.log(result);
                console.log('delete success');
            }
            jsonWrite(res, result);
            connection.release();
        });
    });
}

// 新增：更新乘客的H3编码
module.exports.updatePassengerH3 = function(passengerId, lat, lng, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('获取数据库连接失败:', err);
            if (callback) callback(err);
            return;
        }
        
        // 计算H3编码 (分辨率为9)
        const h3Index_8 = h3.latLngToCell(lat, lng, 8);
        const h3Index_9 = h3.latLngToCell(lat, lng, 9);
        const h3Index_10 = h3.latLngToCell(lat, lng, 10);
        const h3Index_11 = h3.latLngToCell(lat, lng, 11);
        const h3Index_12 = h3.latLngToCell(lat, lng, 12);
        
        // 更新乘客的H3编码
        connection.query(
            'UPDATE passenger SET h3_9 = ? WHERE passengerid = ?',
            [h3Index_9, passengerId],
            function (err, result) {
                connection.release();
                if (err) {
                    console.error('更新乘客H3编码失败:', err);
                } else {
                    console.log(`乘客(ID=${passengerId})的H3编码已更新为: ${h3Index_9}`);
                }
                if (callback) callback(err, result);
            }
        );
    });
}

// 更新乘客位置和H3编码
module.exports.updatePassengerLocation = function(req, res, next) {
    const { passengerId, lat, lng } = req.body;
    
    if (!passengerId || !lat || !lng) {
        return res.json({
            code: '1',
            msg: '缺少必要参数'
        });
    }
    
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('获取数据库连接失败:', err);
            return res.json({
                code: '1',
                msg: '数据库连接失败'
            });
        }
        
        // 计算H3编码 (分辨率为9)
        const h3Index_9 = h3.latLngToCell(parseFloat(lat), parseFloat(lng), 9);
        
        // 更新乘客位置和H3编码
        connection.query(
            'UPDATE passenger SET current_lat = ?, current_long = ?, h3_9 = ? WHERE passengerid = ?',
            [lat, lng, h3Index_9, passengerId],
            function (err, result) {
                if (err) {
                    console.error('更新乘客位置和H3编码失败:', err);
                    connection.release();
                    return res.json({
                        code: '1',
                        msg: '更新失败'
                    });
                }
                
                connection.release();
                res.json({
                    code: '0',
                    msg: '更新成功',
                    data: { h3Index_9 }
                });
            }
        );
    });
}
