var express = require('express');
var router = express.Router();
var driverDao = require('../dao/driverDao');


/* GET home page. */
/**
 * @swagger
 * /driver/getdrivercount:
 *   get:
 *     tags: [Driver]
 *     summary: 获取司机总数
 *     responses:
 *       200:
 *         description: 成功返回司机总数
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   count:
 *                     type: integer
 *                     description: 司机总数
 *                     example: 150
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "1"
 *                 msg:
 *                   type: string
 *                   example: "操作失败"
 */
router.get('/getdrivercount', function(req, res, next) {
     driverDao.getDriverCount(req,res,next);
});

/**
 * @swagger
 * /driver/getalldriver:
 *   get:
 *     tags: [Driver]
 *     summary: 获取所有司机信息
 *     responses:
 *       200:
 *         description: 成功返回所有司机信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   driverID:
 *                     type: integer
 *                     description: 司机ID
 *                   name:
 *                     type: string
 *                     description: 司机姓名
 *                   phone:
 *                     type: string
 *                     description: 司机电话
 *                   status:
 *                     type: string
 *                     description: 司机状态
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
 *                   driverID: 1
 *                   name: "张三"
 *                   phone: "13800138000"
 *                   status: "available"
 *                   current_lat: 39.915
 *                   current_long: 116.404
 *                   current_h3: "89110ccc5bfffff"
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getalldriver', function(req, res, next){
    driverDao.getAllDriver(req, res, next);
});

/**
 * @swagger
 * /driver/getdriversbyname:
 *   get:
 *     tags: [Driver]
 *     summary: 根据姓名模糊查询司机
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 司机姓名（部分或全部）
 *     responses:
 *       200:
 *         description: 成功返回匹配的司机信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   driverID:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                 example:
 *                   driverID: 1
 *                   name: "张三"
 *                   phone: "13800138000"
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getdriversbyname', function(req, res, next){
    driverDao.getDriversByName(req, res, next);
});

/**
 * @swagger
 * /driver/getdriverbyid:
 *   get:
 *     tags: [Driver]
 *     summary: 根据ID获取司机信息
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 司机ID
 *     responses:
 *       200:
 *         description: 成功返回司机信息
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   driverID:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                 example:
 *                   driverID: 1
 *                   name: "张三"
 *                   phone: "13800138000"
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getdriverbyid', function(req, res, next){
    driverDao.getDriverByID(req, res, next);
});

/**
 * @swagger
 * /driver/adddriver:
 *   post:
 *     tags: [Driver]
 *     summary: 添加新司机
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverID:
 *                 type: integer
 *                 description: 司机ID
 *               name:
 *                 type: string
 *                 description: 司机姓名
 *               phone:
 *                 type: string
 *                 description: 司机电话
 *             required:
 *               - driverID
 *               - name
 *               - phone
 *           example:
 *             driverID: 101
 *             name: "王五"
 *             phone: "13700137000"
 *     responses:
 *       200:
 *         description: 添加成功，返回MySQL操作结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object # 可能需要更具体的MySQL结果定义
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
router.post('/adddriver', function(req, res, next){
    driverDao.addDriver(req, res, next);
});

/**
 * @swagger
 * /driver/getpointsbyid:
 *   get:
 *     tags: [Driver]
 *     summary: 根据司机ID获取其轨迹点
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 司机ID
 *     responses:
 *       200:
 *         description: 成功返回轨迹点数组 (具体结构取决于存储过程)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     format: double
 *                   lng:
 *                     type: number
 *                     format: double
 *                   time:
 *                     type: string
 *                     format: date-time
 *               example:
 *                 - lat: 39.915
 *                   lng: 116.404
 *                   time: "2023-01-01 08:00:00"
 *                 - lat: 39.916
 *                   lng: 116.405
 *                   time: "2023-01-01 08:00:05"
 *       default:
 *         description: 操作失败或未找到
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 */
router.get('/getpointsbyid', function(req, res, next){
    driverDao.getPointsByID(req, res, next);
});

/**
 * @swagger
 * /driver/updatelocation:
 *   post:
 *     tags: [Driver]
 *     summary: 更新司机位置和H3编码
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverId:
 *                 type: integer
 *                 description: 司机ID
 *               lat:
 *                 type: number
 *                 format: double
 *                 description: 纬度
 *               lng:
 *                 type: number
 *                 format: double
 *                 description: 经度
 *             required:
 *               - driverId
 *               - lat
 *               - lng
 *           example:
 *             driverId: 1
 *             lat: 39.915
 *             lng: 116.404
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
 *                       example: "89110ccc5bfffff"
 *       default:
 *         description: 操作失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/updatelocation', function(req, res, next){
    driverDao.updateDriverLocation(req, res, next);
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: 错误码 (通常为"1")
 *         msg:
 *           type: string
 *           description: 错误信息
 *       example:
 *         code: "1"
 *         msg: "操作失败或未找到"
 */
