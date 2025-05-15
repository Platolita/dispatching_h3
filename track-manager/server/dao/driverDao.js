var mysql = require('mysql');//引入MySQL数据库驱动模块，允许与 MySQL 数据库进行交互。
var $conf = require('../conf/db');//引入数据库配置文件
var pool  = mysql.createPool($conf.mysql);//使用引入的 MySQL 模块创建一个连接池。
                                          //↑连接池的作用是管理一组数据库连接，避免频繁地创建和销毁连接，提高性能和资源利用率。配置信息来自前面引入的配置文件中的 $conf.mysql。
const h3 = require('h3-js'); // 引入H3库

var jsonWrite = function (res, ret) {//写JSON函数，用于将查询结果转换为 JSON 格式并返回给客户端。
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


module.exports = {
    getDriverCount: function (req, res, next) {
        pool.getConnection(function(err, connection) {// 获取连接，如果出现错误则返回错误信息
            var param = req.query || req.params;// 获取请求中的查询参数或者路由参数
            connection.query('SELECT count(*) as count from driver', function(err, result) {// 执行 SQL 查询，统计 driver 表中的记录数量
                if(err){
                    console.log(err);
                }
                if(result) {
                    console.log(result);
                    console.log('query success');
                }
                jsonWrite(res, result);
                connection.release();
            });
        });
    },

    getAllDriver: function (req ,res, next) {
      pool.getConnection(function(err, connection) {
          connection.query('SELECT * from driver', function(err, result) {// 执行 SQL 查询，获取 driver 表中的所有记录
              if(err){
                  console.log(err);
              }
              if(result) {
                  console.log('query success');
              }
              jsonWrite(res, result);
              connection.release();
          });
      });
    },

    addDriver: function(req, res, next){
      pool.getConnection(function(err, connection) {
          console.log(req.body);
          connection.query('insert into driver values ( '+ req.body.driverID +' , \''+req.body.name + '\' , \''+ req.body.phone +'\' )', function(err, result) {
              if(err){
                  console.log(err);
              }
              if(result) {
                  console.log(result);
                  console.log('query success');
              }
              jsonWrite(res, result);
              connection.release();
          });
      });
    },

    getDriverByID: function (req, res, next) {
        pool.getConnection(function (err, connection) {
            var param = req.query || req.params;
            console.log('param is');
            console.log(param);
            connection.query('SELECT * from driver where driverID='+ param.id , function (err, result) {
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
    },

    getDriversByName: function (req, res, next) {
        pool.getConnection(function (err, connection) {
            var param = req.query || req.params;
            console.log('param is');
            console.log(param);
            connection.query('SELECT * from driver where name like \'%'+ param.name+'%\'' , function (err, result) {
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
    },
    getPointsByID: function (req, res, next) {
        pool.getConnection(function (err, connection) {
            var param = req.query || req.params;
            console.log('param is');
            console.log(param);
            connection.query('call getpointsbydriver('+param.id+')' , function (err, result) {
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
    },
    
    // 新增：更新司机的H3编码
    updateDriverH3: function (driverId, lat, lng, callback) {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error('获取数据库连接失败:', err);
                if (callback) callback(err);
                return;
            }
            
            // 计算H3编码 (分辨率为9)
            const h3Index = h3.latLngToCell(lat, lng, 9);
            
            // 更新司机的H3编码
            connection.query(
                'UPDATE driver SET h3_9 = ? WHERE driverID = ?',
                [h3Index, driverId],
                function (err, result) {
                    connection.release();
                    if (err) {
                        console.error('更新司机H3编码失败:', err);
                    } else {
                        console.log(`司机(ID=${driverId})的H3编码已更新为: ${h3Index}`);
                    }
                    if (callback) callback(err, result);
                }
            );
        });
    },
    
    // 更新司机位置和H3编码
    updateDriverLocation: function (req, res, next) {
        const { driverId, lat, lng } = req.body;
        
        if (!driverId || !lat || !lng) {
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
            const h3Index = h3.latLngToCell(parseFloat(lat), parseFloat(lng), 9);
            
            // 更新司机位置和H3编码
            connection.query(
                'UPDATE driver SET current_lat = ?, current_long = ?, h3_9 = ? WHERE driverID = ?',
                [lat, lng, h3Index, driverId],
                function (err, result) {
                    if (err) {
                        console.error('更新司机位置和H3编码失败:', err);
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
                        data: { h3Index }
                    });
                }
            );
        });
    }
};
