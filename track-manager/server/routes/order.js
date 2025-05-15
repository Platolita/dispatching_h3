var express = require('express');
var router = express.Router();
var orderDao = require('../dao/orderDao');
var path = require('path');

/**
 * @swagger
 * /order/getordercount:
 *   get:
 *     tags: [Order]
 *     summary: 获取订单总数
 *     responses:
 *       200:
 *         description: 成功返回订单总数
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: integer
 *                     example: 1000
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getordercount', function(req, res, next) {
    orderDao.getOrderCount(req, res, next);
});

/**
 * @swagger
 * /order/getallorder:
 *   get:
 *     tags: [Order]
 *     summary: 获取所有订单信息
 *     responses:
 *       200:
 *         description: 成功返回所有订单信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getallorder', function(req, res, next) {
    orderDao.getAllOrder(req, res, next);
});

/**
 * @swagger
 * /order/getorderbyid:
 *   get:
 *     tags: [Order]
 *     summary: 根据ID获取订单信息
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 成功返回订单信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getorderbyid', function(req, res, next) {
    orderDao.getOrderByID(req, res, next);
});

/**
 * @swagger
 * /order/getorderbytaxiid:
 *   get:
 *     tags: [Order]
 *     summary: 根据出租车ID模糊查询订单
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 出租车ID (部分或全部)
 *     responses:
 *       200:
 *         description: 成功返回匹配的订单信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getorderbytaxiid', function(req, res, next) {
    orderDao.getOrdersByTaxiID(req, res, next);
});

/**
 * @swagger
 * /order/getturnover:
 *   get:
 *     tags: [Order]
 *     summary: 获取总营业额
 *     responses:
 *       200:
 *         description: 成功返回总营业额
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   turnover:
 *                     type: number
 *                     format: float
 *                     example: 15000.75
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getturnover', function(req, res, next) {
    orderDao.getturnover(req, res, next);
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         Orderid:
 *           type: integer
 *           description: 订单ID
 *         Taxiid:
 *           type: integer
 *           description: 出租车ID
 *         driverID:
 *           type: integer
 *           description: 司机ID
 *         Passengerid:
 *           type: integer
 *           description: 乘客ID
 *         Starttime:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *         Endtime:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *         Distance:
 *           type: number
 *           description: 距离(米)
 *         Price:
 *           type: number
 *           format: float
 *           description: 价格
 *         status:
 *           type: string
 *           description: 订单状态
 *         create_time:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *       example:
 *         Orderid: 789
 *         Taxiid: 456
 *         driverID: 1
 *         Passengerid: 1001
 *         Starttime: "2023-01-01 08:00:00"
 *         Endtime: "2023-01-01 08:15:00"
 *         Distance: 5000
 *         Price: 25.5
 *         status: "completed"
 *         create_time: "2023-01-01 07:55:00"
 */