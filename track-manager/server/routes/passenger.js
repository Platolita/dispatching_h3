var express = require('express');
var router = express.Router();
var passengerDao = require('../dao/passengerDao');

/**
 * @swagger
 * /passenger/getpassengercount:
 *   get:
 *     tags: [Passenger]
 *     summary: 获取乘客总数
 *     responses:
 *       200:
 *         description: 成功返回乘客总数
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: integer
 *                     description: 乘客总数
 *                     example: 500
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/getpassengercount', function(req, res, next) {
     passengerDao.getPassengerCount(req,res,next);
});

/**
 * @swagger
 * /passenger/getallpassenger:
 *   get:
 *     tags: [Passenger]
 *     summary: 获取所有乘客信息
 *     responses:
 *       200:
 *         description: 成功返回所有乘客信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   passengerid:
 *                     type: integer
 *                     description: 乘客ID
 *                   passengername:
 *                     type: string
 *                     description: 乘客姓名
 *                   phone:
 *                     type: string
 *                     description: 乘客电话
 *                   status:
 *                     type: string
 *                     description: 乘客状态
 *                   current_lat:
 *                     type: number
 *                     format: double
 *                     description: 当前纬度
 *                   current_long:
 *                     type: number
 *                     format: double
 *                     description: 当前经度
 *                   current_h3:
 *                     type: string
 *                     description: 当前H3索引
 *                 example:
 *                   passengerid: 1001
 *                   passengername: "李四"
 *                   phone: "13900139000"
 *                   status: "available"
 *                   current_lat: 39.985
 *                   current_long: 116.481
 *                   current_h3: "89110ccc53fffff"
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getallpassenger', function(req, res, next){
    passengerDao.getAllPassenger(req, res, next);
});

/**
 * @swagger
 * /passenger/getpassengerbyid:
 *   get:
 *     tags: [Passenger]
 *     summary: 根据ID获取乘客信息
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 乘客ID
 *     responses:
 *       200:
 *         description: 成功返回乘客信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   passengerid:
 *                     type: integer
 *                   passengername:
 *                     type: string
 *                   phone:
 *                     type: string
 *                 example:
 *                   passengerid: 1001
 *                   passengername: "李四"
 *                   phone: "13900139000"
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getpassengerbyid', function(req, res, next){
    passengerDao.getPassengerByID(req, res, next);
});

/**
 * @swagger
 * /passenger/addpassenger:
 *   post:
 *     tags: [Passenger]
 *     summary: 添加新乘客
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passengerid:
 *                 type: integer
 *                 description: 乘客ID
 *               passengername:
 *                 type: string
 *                 description: 乘客姓名
 *               phone:
 *                 type: string
 *                 description: 乘客电话
 *             required:
 *               - passengerid
 *               - passengername
 *               - phone
 *           example:
 *             passengerid: 1005
 *             passengername: "王五"
 *             phone: "13700137000"
 *     responses:
 *       200:
 *         description: 添加成功，返回MySQL操作结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: 
 *                 fieldCount: 0
 *                 affectedRows: 1
 *                 insertId: 0
 *                 serverStatus: 2
 *                 warningCount: 0
 *                 message: ""
 *                 protocol41: true
 *                 changedRows: 0
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/addpassenger', function(req, res, next){
    passengerDao.addPassenger(req, res, next);
});

/**
 * @swagger
 * /passenger/deletepassenger:
 *   post:
 *     tags: [Passenger]
 *     summary: 删除乘客
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 乘客ID
 *             required:
 *               - id
 *           example:
 *             id: 1005
 *     responses:
 *       200:
 *         description: 删除成功，返回MySQL操作结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: 
 *                 fieldCount: 0
 *                 affectedRows: 1
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/deletepassenger', function(req, res, next){
    passengerDao.deletePassenger(req, res, next);
});

/**
 * @swagger
 * /passenger/updatelocation:
 *   post:
 *     tags: [Passenger]
 *     summary: 更新乘客位置和H3编码
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passengerId:
 *                 type: integer
 *                 description: 乘客ID
 *               lat:
 *                 type: number
 *                 format: double
 *                 description: 纬度
 *               lng:
 *                 type: number
 *                 format: double
 *                 description: 经度
 *             required:
 *               - passengerId
 *               - lat
 *               - lng
 *           example:
 *             passengerId: 1001
 *             lat: 39.985
 *             lng: 116.481
 *     responses:
 *       200:
 *         description: 更新成功，返回H3编码
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "0"
 *                 msg:
 *                   type: string
 *                   example: "更新成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     h3Index:
 *                       type: string
 *                       example: "89110ccc53fffff"
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/updatelocation', function(req, res, next){
    passengerDao.updatePassengerLocation(req, res, next);
});

module.exports = router;
