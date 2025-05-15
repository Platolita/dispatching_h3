var mysql = require('mysql');
var $conf = require('../conf/db');
var pool  = mysql.createPool($conf.mysql);
var axios = require('axios');
const util = require('util');
const h3 = require('h3-js'); // 需安装h3-js
const BATCH_SIZE = 100; // 每批次处理的乘客数量
const MAX_RINGS = 3; // 最大扩展层数

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


module.exports = {
    //获取乘客的点信息（姓名，当前坐标，当前h3格网编码）
    //返回值示例：
    // {
    //     "code": 0,
    //     "data": {
    //       "1001": {
    //         "name": "赵六",
    //         "coordinates": {
    //           "longitude": 116.321197,
    //           "latitude": 39.894714
    //         },
    //         "current_position": {
    //           "lat": 39.894714,
    //           "lng": 116.321197
    //         },
    //         "h3_9": null
    //       },
    //       "1002": {
    //         "name": "孙七",
    //         "coordinates": {
    //           "longitude": 116.323432,
    //           "latitude": 39.943822
    //         },
    //         "current_position": {
    //           "lat": 39.943822,
    //           "lng": 116.323432
    //         },
    //         "h3_9": null
    //       }
    //     }
    //   }    
    getpassengerpoints: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            if (err) return next(err);
            
            var param = req.query || req.params;
            console.log('param is', param);
            
            connection.query(
                'SELECT passengerid AS id, passengername AS name, ' +
                'Longtitude AS longitude, Latitude AS latitude, current_lat, current_long, h3_9 ' +
                'FROM passenger',
                function(err, result) {
                    connection.release();
                    
                    if (err) {
                        console.error('Database error:', err);
                        return next(err);
                    }

                    if (result && result.length > 0) {
                        // 将数组转换为以id为键的对象
                        const resData = result.reduce((acc, cur) => {
                            acc[cur.id] = {
                                name: cur.name,
                                coordinates: {
                                    longitude: cur.longitude,
                                    latitude: cur.latitude
                                },
                                current_position: {
                                    lat: cur.current_lat,
                                    lng: cur.current_long
                                },
                                h3_9: cur.h3_9
                            };
                            return acc;
                        }, {});
                        
                        console.log('Query success');
                        res.json({ code: 0, data: resData });
                    } else {
                        res.json({ code: 1, msg: 'No passengers found' });
                    }
                }
            );
        });
    },
    //获取司机的点信息（姓名，当前坐标，当前h3格网编码）
    getdriverpoints: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            if (err) return next(err);
            
            var param = req.query || req.params;
            console.log('param is', param);
            
            connection.query(
                'SELECT driverID AS id, name AS name, ' +
                'Longtitude AS longitude, Latitude AS latitude, current_lat, current_long, h3_9 ' +
                'FROM driver',
                function(err, result) {
                    connection.release();
                    
                    if (err) {
                        console.error('Database error:', err);
                        return next(err);
                    }

                    if (result && result.length > 0) {
                        // 将数组转换为以id为键的对象
                        const resData = result.reduce((acc, cur) => {
                            acc[cur.id] = {
                                name: cur.name,
                                coordinates: {
                                    longitude: cur.longitude,
                                    latitude: cur.latitude
                                },
                                current_position: {
                                    lat: cur.current_lat,
                                    lng: cur.current_long
                                },
                                h3_9: cur.h3_9
                            };
                            return acc;
                        }, {});
                        
                        console.log('Query success');
                        res.json({ code: 0, data: resData });
                    } else {
                        res.json({ code: 1, msg: 'No passengers found' });
                    }
                }
            );
        });
    },
    getdistancebyorder: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            var param = req.query || req.params;
            console.log('param is');
            console.log(param);
            connection.query('select distance from pro1.order where Orderid='+param.id , function(err, result) {
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

    // taxiIDtoDriver: function (req, res, next) {
    //     pool.getConnection(function(err, connection) {
    //         var param = req.query || req.params;
    //         console.log('param is');
    //         console.log(param);
    //         connection.query('select * from driver where driverID in(select driverID from taxi where Taxiid='+param.id+')', function(err, result) {
    //             if(err){
    //                 console.log(err);
    //             }
    //             if(result) {
    //                 console.log(result);
    //                 console.log('query success');
    //             }
    //             jsonWrite(res, result);
    //             connection.release();
    //         });
    //     });
    // },




    getpricebyorder: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            var param = req.query || req.params;
            console.log('param is');
            console.log(param);
            connection.query('select price from pro1.order where Orderid='+param.id , function(err, result) {
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


    getpointsbyorder: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            var param = req.query || req.params;
            console.log('param is');
            console.log(param);
            connection.query('call getpointsbyorder('+param.id+')', function(err, result) {
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
    gethotpoints: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            var param = req.query || req.params;
            console.log('param is');
            console.log(param);
          //  connection.query('call gethotpoints(\''+param.starttime+'\',\''+param.endtime+'\')', function(err, result) {
            connection.query('select Longtitude,Latitude from minitrack where Recetime < \'2023-01-01 09:00:00\' and Recetime > \'2023-01-01 08:00:00\'', function(err, result) {

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
    //一键全局贪心匹配，
    //返回值示例：
// {
//   "code": 0,
//   "matches": 
//   [
//     {
//       "passengerId": 1002,
//       "driverId": 2,
//       "distance": 2671
//     },
//     {
//       "passengerId": 1001,
//       "driverId": 3,
//       "distance": 13723
//     },
//     {
//       "passengerId": 1003,
//       "driverId": 1,
//       "distance": 16932
//     }
//   ]
// }

    dispatch_matching: function(req, res, next) {
        pool.getConnection(async (err, connection) => {
            if (err) return next(err);
            const query = util.promisify(connection.query).bind(connection);
            try {
                console.debug('=== 1. 查询所有待匹配乘客和可用司机 ===');
                // 1. 查询所有待匹配乘客和可用司机
                const passengers = await query(
                    "SELECT passengerid, current_lat, current_long FROM passenger WHERE status='available'"
                );
                console.debug('查询到的乘客:', JSON.stringify(passengers, null, 2));
                
                const drivers = await query(
                    "SELECT driverID, current_lat, current_long FROM driver WHERE status='available'"
                );
                console.debug('查询到的司机:', JSON.stringify(drivers, null, 2));
                
                if (!passengers.length || !drivers.length) {
                    console.debug('无可用乘客或司机 - 乘客数量:', passengers.length, '司机数量:', drivers.length);
                    connection.release();
                    return res.json({ code: 1, msg: '无可用乘客或司机' });
                }
    
                console.debug('=== 2. 计算所有乘客-司机之间的路网距离 ===');
                // 2. 计算所有乘客-司机之间的路网距离
                let pairs = [];
                for (let i = 0; i < passengers.length; i++) {
                    for (let j = 0; j < drivers.length; j++) {
                        pairs.push({
                            passenger: passengers[i],
                            driver: drivers[j],
                            i, j
                        });
                    }
                }
                console.debug('生成的乘客-司机配对数量:', pairs.length);
                console.debug('前5组配对示例:', JSON.stringify(pairs.slice(0, 5), null, 2));
    
                console.debug('=== 3. 批量调用百度API获取距离 ===');
                // 3. 批量调用百度API获取距离
                const distanceResults = await Promise.all(pairs.map(pair =>
                    axios.get('https://api.map.baidu.com/direction/v2/driving', {
                        params: {
                            origin: `${pair.driver.current_lat},${pair.driver.current_long}`,
                            destination: `${pair.passenger.current_lat},${pair.passenger.current_long}`,
                            ak: process.env.BAIDU_AK
                        }
                    }).then(r => {
                        const distance = (r.data.status === 0) ? r.data.result.routes[0].distance : Infinity;
                        console.debug(`司机[${pair.j}]到乘客[${pair.i}]距离:`, distance);
                        return {
                            ...pair,
                            distance: distance
                        };
                    }).catch((error) => {
                        console.debug(`百度API调用失败: 司机[${pair.j}]到乘客[${pair.i}]`, error.message);
                        return {
                            ...pair,
                            distance: Infinity
                        };
                    })
                ));
                console.debug('API调用完成，有效结果数量:', distanceResults.filter(r => r.distance < Infinity).length);
    
                console.debug('=== 4. 贪心全局最近点匹配 ===');
                // 4. 贪心全局最近点匹配
                let matchResults = [];
                let usedPassengers = new Set();
                let usedDrivers = new Set();
    
                // 先按距离升序排序
                distanceResults.sort((a, b) => a.distance - b.distance);
                console.debug('排序后的前5组距离结果:', JSON.stringify(distanceResults.slice(0, 5), null, 2))
    
                for (const result of distanceResults) {
                    const pid = result.passenger.passengerid;
                    const did = result.driver.driverID;
                    if (!usedPassengers.has(pid) && !usedDrivers.has(did) && result.distance < Infinity) {
                        console.debug(`匹配成功: 乘客[${pid}]与司机[${did}]，距离: ${result.distance}`);
                        matchResults.push({
                            passengerId: pid,
                            driverId: did,
                            distance: result.distance
                        });
                        usedPassengers.add(pid);
                        usedDrivers.add(did);
                    } else {
                        console.debug(`跳过: 乘客[${pid}]或司机[${did}]已被匹配，或距离无效`);
                    }
                }
                console.debug('最终匹配对数:', matchResults.length);
                console.debug('匹配结果:', JSON.stringify(matchResults, null, 2));
    
                console.debug('=== 5. 生成订单 ===');
                // 5. 生成订单
                for (const match of matchResults) {
                    console.debug(`正在为乘客[${match.passengerId}]和司机[${match.driverId}]创建订单...`);
                    await query(
                        'INSERT INTO `order` (driverID, Passengerid, status, create_time) VALUES (?, ?, "matching", NOW())',
                        [match.driverId, match.passengerId]
                    );
                    console.debug(`订单创建成功: 乘客[${match.passengerId}]和司机[${match.driverId}]`);
                }
    
                connection.release();
                console.debug('=== 派单流程完成 ===');
                res.json({ code: 0, matches: matchResults });
            } catch (error) {
                console.error('全局贪心派单失败:', error);
                connection.release();
                res.status(500).json({ code: 500, msg: '全局贪心派单失败' });
            }
        });
    },

    // 新增：仅处理1003~1004乘客的H3格网匹配方法
    dispatch_matching_h3_dev: async function(req, res, next) {
        const pool = mysql.createPool($conf.mysql);
        const connection = await util.promisify(pool.getConnection).call(pool);
        const query = util.promisify(connection.query).bind(connection);

        try {
            console.debug('=== 1. 获取指定待匹配乘客（1003、1004） ===');
            // 仅查询乘客ID为1003和1004且状态为available的记录
            const passengers = await query(`
                SELECT passengerid, current_lat, current_long, h3_9 
                FROM passenger 
                WHERE passengerid IN (1003, 1004) AND status="available"
            `);
            console.debug('指定待匹配乘客数量:', passengers.length);
            const matchedPairs = [];

            // 无需分批次，直接处理指定乘客
            for (const p of passengers) {
                console.debug(`=== 处理乘客 ${p.passengerid} ===`);
                // 生成扩展格网序列
                const rings = [];
                for (let k = 0; k <= MAX_RINGS; k++) {
                    const ring = h3.gridDisk(p.h3_9, k);
                    rings.push(...ring);
                }
                const uniqueRings = [...new Set(rings)];
                console.debug(`乘客 ${p.passengerid} 的扩展格网数量: ${uniqueRings.length}`);

                const candidateDrivers = await query(`
                    SELECT driverID, current_lat, current_long 
                    FROM driver 
                    WHERE h3_9 IN (?) AND status="available"
                `, [uniqueRings]);
                console.debug(`乘客 ${p.passengerid} 的候选司机数量: ${candidateDrivers.length}`);

                const distancePromises = candidateDrivers.map(async (d) => {
                    try {
                        const { data } = await axios.get('https://api.map.baidu.com/direction/v2/driving', {
                            params: {
                                origin: `${d.current_lat},${d.current_long}`,
                                destination: `${p.current_lat},${p.current_long}`,
                                ak: process.env.BAIDU_AK
                            }
                        });
                        if (data.status === 0) {
                            console.debug(`司机 ${d.driverID} 到乘客 ${p.passengerid} 的距离: ${data.result.routes[0].distance} 米`);
                            return { passenger: p, driver: d, distance: data.result.routes[0].distance };
                        }
                    } catch (err) {
                        console.error(`百度API调用失败: ${err.message}`);
                    }
                    return null;
                });

                const results = await Promise.all(distancePromises);
                const validPairs = results.filter(pair => pair !== null);
                console.debug(`乘客 ${p.passengerid} 的有效匹配对数: ${validPairs.length}`);
                matchedPairs.push(...validPairs);
            }

            console.debug('=== 4. 贪心匹配 ===');
            const finalMatches = [];
            const usedDrivers = new Set();
            const usedPassengers = new Set();

            matchedPairs.sort((a, b) => a.distance - b.distance);
            console.debug('排序后的前5组匹配对:', JSON.stringify(matchedPairs.slice(0, 5), null, 2));

            for (const pair of matchedPairs) {
                if (!usedDrivers.has(pair.driver.driverID) && 
                    !usedPassengers.has(pair.passenger.passengerid)) {
                    console.debug(`匹配成功: 乘客 ${pair.passenger.passengerid} 与司机 ${pair.driver.driverID}，距离: ${pair.distance} 米`);
                    finalMatches.push(pair);
                    usedDrivers.add(pair.driver.driverID);
                    usedPassengers.add(pair.passenger.passengerid);
                } else {
                    console.debug(`跳过: 乘客 ${pair.passenger.passengerid} 或司机 ${pair.driver.driverID} 已被匹配`);
                }
            }

            // ... existing code ... (保持原订单创建逻辑不变)
            console.debug('=== 5. 生成订单 ===');
            for (const pair of finalMatches) {
                console.debug(`正在为乘客[${pair.passenger.passengerid}]和司机[${pair.driver.driverID}]创建订单...`);
                await query(
                    'INSERT INTO `order` (driverID, Passengerid, status, create_time) VALUES (?, ?, "matching", NOW())',
                    [pair.driver.driverID, pair.passenger.passengerid]
                );
                console.debug(`订单创建成功: 乘客[${pair.passenger.passengerid}]和司机[${pair.driver.driverID}]`);
            }

            connection.release();
            console.debug('=== 派单流程完成（dev版） ===');
            res.json({ code: 0, matches: finalMatches.map(p => ({
                passengerId: p.passenger.passengerid,
                driverId: p.driver.driverID,
                distance: p.distance
            })) });
        } catch (error) {
            console.error('H3格网派单（dev版）失败:', error);
            connection.release();
            res.status(500).json({ code: 500, msg: 'H3格网派单（dev版）失败' });
        }
    },
    // 原方法保持不变
    dispatch_matching_h3: async function(req, res, next) {
        const pool = mysql.createPool($conf.mysql);
        const connection = await util.promisify(pool.getConnection).call(pool);
        const query = util.promisify(connection.query).bind(connection);

        try {
            console.debug('=== 1. 获取所有待匹配乘客（分批次） ===');
            const totalPassengers = await query('SELECT COUNT(*) AS count FROM passenger WHERE status="available"');
            console.debug('待匹配乘客总数:', totalPassengers[0].count);
            const totalBatches = Math.ceil(totalPassengers[0].count / BATCH_SIZE);
            console.debug('总批次数:', totalBatches);
            const matchedPairs = [];

            for (let batch = 0; batch < totalBatches; batch++) {
                console.debug(`=== 处理第 ${batch + 1} 批乘客 ===`);
                const passengers = await query(`
                    SELECT passengerid, current_lat, current_long, h3_9 
                    FROM passenger 
                    WHERE status="available"
                    LIMIT ${BATCH_SIZE} OFFSET ${batch * BATCH_SIZE}
                `);
                console.debug(`本批乘客数量: ${passengers.length}`);

                // 2. 为每个乘客查找候选司机
                for (const p of passengers) {
                    console.debug(`=== 处理乘客 ${p.passengerid} ===`);
                    // 生成扩展格网序列
                    const rings = [];
                    for (let k = 0; k <= MAX_RINGS; k++) {
                        const ring = h3.gridDisk(p.h3_9, k);  // 扩展k层
                        rings.push(...ring);
                    }
                    const uniqueRings = [...new Set(rings)];
                    console.debug(`乘客 ${p.passengerid} 的扩展格网数量: ${uniqueRings.length}`);

                    // 查询这些格网内的司机
                    const candidateDrivers = await query(`
                        SELECT driverID, current_lat, current_long 
                        FROM driver 
                        WHERE h3_9 IN (?) AND status="available"
                    `, [uniqueRings]);
                    console.debug(`乘客 ${p.passengerid} 的候选司机数量: ${candidateDrivers.length}`);

                    // 3. 计算精确距离（仅对候选司机）
                    const distancePromises = candidateDrivers.map(async (d) => {
                        try {
                            const { data } = await axios.get('https://api.map.baidu.com/direction/v2/driving', {
                                params: {
                                    origin: `${d.current_lat},${d.current_long}`,
                                    destination: `${p.current_lat},${p.current_long}`,
                                    ak: process.env.BAIDU_AK
                                }
                            });
                            if (data.status === 0) {
                                console.debug(`司机 ${d.driverID} 到乘客 ${p.passengerid} 的距离: ${data.result.routes[0].distance} 米`);
                                return { passenger: p, driver: d, distance: data.result.routes[0].distance };
                            }
                        } catch (err) {
                            console.error(`百度API调用失败: ${err.message}`);
                        }
                        return null;
                    });

                    const results = await Promise.all(distancePromises);
                    const validPairs = results.filter(pair => pair !== null);
                    console.debug(`乘客 ${p.passengerid} 的有效匹配对数: ${validPairs.length}`);
                    matchedPairs.push(...validPairs);
                }
            }

            console.debug('=== 4. 贪心匹配 ===');
            const finalMatches = [];
            const usedDrivers = new Set();
            const usedPassengers = new Set();

            matchedPairs.sort((a, b) => a.distance - b.distance);
            console.debug('排序后的前5组匹配对:', JSON.stringify(matchedPairs.slice(0, 5), null, 2));

            for (const pair of matchedPairs) {
                if (!usedDrivers.has(pair.driver.driverID) && 
                    !usedPassengers.has(pair.passenger.passengerid)) {
                    console.debug(`匹配成功: 乘客 ${pair.passenger.passengerid} 与司机 ${pair.driver.driverID}，距离: ${pair.distance} 米`);
                    finalMatches.push(pair);
                    usedDrivers.add(pair.driver.driverID);
                    usedPassengers.add(pair.passenger.passengerid);
                } else {
                    console.debug(`跳过: 乘客 ${pair.passenger.passengerid} 或司机 ${pair.driver.driverID} 已被匹配`);
                }
            }
            console.debug('最终匹配对数:', finalMatches.length);

            // 5. 生成订单
            console.debug('=== 5. 生成订单 ===');
            for (const { passenger, driver } of finalMatches) {
                console.debug(`正在为乘客 ${passenger.passengerid} 和司机 ${driver.driverID} 创建订单...`);
                await query(`
                    INSERT INTO \`order\` (driverID, Passengerid, status, create_time)
                    VALUES (?, ?, 'matching', NOW())
                `, [driver.driverID, passenger.passengerid]);
                
                await query(`
                    UPDATE driver SET status='busy' WHERE driverID=?
                `, [driver.driverID]);
                
                await query(`
                    UPDATE passenger SET status='matched' WHERE passengerid=?
                `, [passenger.passengerid]);
                console.debug(`订单创建成功: 乘客 ${passenger.passengerid} 和司机 ${driver.driverID}`);
            }

            console.debug('=== 派单流程完成 ===');
            res.json({ 
                code: 0, 
                matched: finalMatches.map(p => ({
                    passengerId: p.passenger.passengerid,
                    driverId: p.driver.driverID,
                    distance: p.distance
                }))
            });

        } catch (error) {
            console.error('派单失败:', error);
            res.status(500).json({ code: 500, msg: '派单失败' });
        } finally {
            connection.release();
        }
    },
    calculateRouteDistance: function(req, res, next) {
        pool.getConnection(async (err, connection) => {
            const { origin, destination } = req.body;
            try {
                const response = await axios.get('https://api.map.baidu.com/direction/v2/driving', {
                    params: {
                        origin: `${origin.lat},${origin.lng}`,
                        destination: `${destination.lat},${destination.lng}`,
                        ak: process.env.BAIDU_AK
                    }
                });
                jsonWrite(res, response.data.result);
            } catch (error) {
                console.error('路线计算失败:', error);
                jsonWrite(res, { code: 500, msg: '路线计算失败' });
            } finally {
                connection.release();
            }
        });
    }
};
