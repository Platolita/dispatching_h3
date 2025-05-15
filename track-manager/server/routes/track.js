/**
 * Created by ZeroW on 2017/6/10.
 */
var express = require('express');
var router = express.Router();
var trackDao = require('../dao/trackDao');
var path = require('path');
const axios = require('axios');

/**
 * @swagger
 * /track/getpassengerpoints:
 *   get:
 *     tags: [Track]
 *     summary: 获取所有乘客当前位置信息
 *     responses:
 *       200:
 *         description: 成功返回乘客数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     $ref: '#/components/schemas/PassengerLocation'
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getpassengerpoints', function(req, res, next) {
    trackDao.getpassengerpoints(req,res,next);
});

/**
 * @swagger
 * /track/getdriverpoints:
 *   get:
 *     tags: [Track]
 *     summary: 获取所有司机当前位置信息
 *     responses:
 *       200:
 *         description: 成功返回司机数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     $ref: '#/components/schemas/DriverLocation'
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getdriverpoints', function(req, res, next) {
    trackDao.getdriverpoints(req,res,next);
}); 

// router.get('/getdriverbytaxiID', function(req, res, next) {
//     trackDao.taxiIDtoDriver(req,res,next);
// });

/**
 * @swagger
 * /track/getpointsbyorder:
 *   get:
 *     tags: [Track]
 *     summary: 根据订单ID获取轨迹点
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 成功返回轨迹点数组 (具体结构取决于存储过程)
 *         content:
 *           application/json:
 *             schema:
 *               type: array # DAO层直接jsonWrite(result), 结构未知，暂定为数组
 *               items:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: double
 *                   lng:
 *                     type: number
 *                     format: double
 *               example:
 *                 - code: 0 # 示例，实际结构依赖存储过程
 *                   data:
 *                     - lat: 39.915
 *                       lng: 116.404 
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getpointsbyorder', function(req, res, next) {
    trackDao.getpointsbyorder(req,res,next);
});

/**
 * @swagger
 * /track/getdistancebyorder:
 *   get:
 *     tags: [Track]
 *     summary: 根据订单ID获取订单距离
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 成功返回订单距离
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   distance:
 *                     type: number
 *                     description: 订单距离(米)
 *                     example: 5000
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getdistancebyorder', function(req, res, next) {
    trackDao.getdistancebyorder(req,res,next);
});

/**
 * @swagger
 * /track/getpricebyorder:
 *   get:
 *     tags: [Track]
 *     summary: 根据订单ID获取订单价格
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 成功返回订单价格
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 25.5
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getpricebyorder', function(req, res, next) {
    trackDao.getpricebyorder(req,res,next);
});

/**
 * @swagger
 * /track/gethotpoints:
 *   get:
 *     tags: [Track]
 *     summary: 获取热点区域
 *     parameters:
 *       - in: query
 *         name: starttime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始时间 (格式 'YYYY-MM-DD HH:MM:SS'). 注意：DAO层目前硬编码，此参数无效。
 *       - in: query
 *         name: endtime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束时间 (格式 'YYYY-MM-DD HH:MM:SS'). 注意：DAO层目前硬编码，此参数无效。
 *     responses:
 *       200:
 *         description: 成功返回热点轨迹点数组
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Longtitude:
 *                     type: number
 *                     format: double
 *                   Latitude:
 *                     type: number
 *                     format: double
 *               example:
 *                 - Longtitude: 116.404
 *                   Latitude: 39.915
 *                 - Longtitude: 116.405
 *                   Latitude: 39.916
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/gethotpoints', function(req, res, next) {
    trackDao.gethotpoints(req,res,next);
});

/**
 * @swagger
 * /track/route_distance:
 *   post:
 *     tags: [Track]
 *     summary: 计算两点间路网距离
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: double
 *                   lng:
 *                     type: number
 *                     format: double
 *               destination:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: double
 *                   lng:
 *                     type: number
 *                     format: double
 *             required:
 *               - origin
 *               - destination
 *           example:
 *             origin: { lat: 39.915, lng: 116.404 }
 *             destination: { lat: 40.056, lng: 116.308 }
 *     responses:
 *       200:
 *         description: 成功，返回百度地图API路径规划结果
 *         content:
 *           application/json:
 *             schema: 
 *               type: object # 示例仅为部分，结构参考百度地图API文档
 *               example:
 *                 status: 0
 *                 message: "ok"
 *                 result:
 *                   routes:
 *                     - distance: 12345 
 *                       duration: 1800 
 *       500:
 *         description: 路线计算失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 msg:
 *                   type: string
 *                   example: "路线计算失败"
 */
router.post('/route_distance', function(req, res, next) {
    trackDao.calculateRouteDistance(req, res, next);
});

/**
 * @swagger
 * /track/dispatch_matching:
 *   post:
 *     tags: [Track]
 *     summary: 执行全局贪心派单匹配
 *     description: 查询所有可用乘客和司机，计算所有配对的路网距离（调用百度API），进行全局贪心匹配，并为匹配成功的对生成订单。
 *     responses:
 *       200:
 *         description: 派单成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       passengerId:
 *                         type: integer
 *                       driverId:
 *                         type: integer
 *                       distance:
 *                         type: number
 *                         description: 匹配距离(米)
 *               example:
 *                 code: 0
 *                 matches:
 *                   - passengerId: 1002
 *                     driverId: 2
 *                     distance: 2671
 *                   - passengerId: 1001
 *                     driverId: 3
 *                     distance: 13723
 *       default:
 *         description: 派单失败或无可用乘客/司机
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse' # 对应 code: 1
 *                 - $ref: '#/components/schemas/DispatchErrorResponse' # 对应 code: 500
 */
router.post('/dispatch_matching', function(req, res, next){
    trackDao.dispatch_matching(req, res, next);
});

/**
 * @swagger
 * /track/dispatch_matching_h3:
 *   post:
 *     tags: [Track]
 *     summary: 执行基于H3格网的贪心派单匹配
 *     description: 查询所有可用乘客和司机，基于H3格网查找候选司机（kRing搜索），计算候选对的路网距离（调用百度API），进行贪心匹配，并为匹配成功的对生成订单、更新司机和乘客状态。
 *     responses:
 *       200:
 *         description: 派单成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 matched:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       passengerId:
 *                         type: integer
 *                       driverId:
 *                         type: integer
 *                       distance:
 *                         type: number
 *                         description: 匹配距离(米)
 *               example:
 *                 code: 0
 *                 matched:
 *                   - passengerId: 1002
 *                     driverId: 2
 *                     distance: 2671
 *                   - passengerId: 1001
 *                     driverId: 3
 *                     distance: 13723
 *       default:
 *         description: 派单失败或无待匹配乘客/司机
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse' # 对应 code: 1
 *                 - $ref: '#/components/schemas/DispatchErrorResponse' # 对应 code: 500
 */
router.post('/dispatch_matching_h3', function(req, res, next){
    trackDao.dispatch_matching_h3(req, res, next);
});


router.post('/dispatch_matching_h3_dev', function(req, res, next){
    trackDao.dispatch_matching_h3_dev(req, res, next);
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Coordinates:
 *       type: object
 *       properties:
 *         longitude:
 *           type: number
 *           format: double
 *         latitude:
 *           type: number
 *           format: double
 *     CurrentPosition:
 *       type: object
 *       properties:
 *         lat:
 *           type: number
 *           format: double
 *         lng:
 *           type: number
 *           format: double
 *     PassengerLocation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         coordinates:
 *           $ref: '#/components/schemas/Coordinates'
 *         current_position:
 *           $ref: '#/components/schemas/CurrentPosition'
 *         current_h3:
 *           type: string
 *           nullable: true
 *     DriverLocation:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         coordinates:
 *           $ref: '#/components/schemas/Coordinates'
 *         current_position:
 *           $ref: '#/components/schemas/CurrentPosition'
 *         current_h3:
 *           type: string
 *           nullable: true
 *     DispatchErrorResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 500
 *         msg:
 *           type: string
 *           example: "全局贪心派单失败"
 */
