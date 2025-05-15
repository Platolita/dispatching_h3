require('dotenv').config();
//引入依赖模块
var express = require('express');//构建Web服务器的核心库，用于处理HTTP请求和响应。
var path = require('path');//用于处理文件路径，帮助定位静态文件等。
var favicon = require('serve-favicon');//设置网站的小图标（可以省略）。
var logger = require('morgan');//记录HTTP请求日志,以便调试。
var cookieParser = require('cookie-parser');//解析请求中的 cookies。
var bodyParser = require('body-parser');//解析请求体中的数据，处理JSON和URL编码的数据。
const swaggerJSDoc = require('swagger-jsdoc');          // <--- 引入 swagger-jsdoc
const swaggerUI = require('swagger-ui-express');      // <--- 引入 swagger-ui-express

//路由设置（访问网站不同页面的方式,每个路由都指向一个对应的文件，处理特定功能）
var index = require('./routes/index');
var track = require ('./routes/track');
var passenger = require ('./routes/passenger');
var driver = require ('./routes/driver');
var order = require ('./routes/order');
var taxi = require ('./routes/taxi')

//Express应用初始化(所有的服务器功能都会基于这个实例实现。)
var app = express();//通过 app 变量，后端可以处理客户端请求、设置中间件、定义路由等。

// Swagger 配置选项  <--- 添加 Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // 指定 OpenAPI 版本
    info: {
      title: '网约车派单系统 API', // 文档标题
      version: '1.0.0',            // 文档版本
      description: '用于毕业设计项目的后端 API 文档', // 文档描述
    },
    servers: [ // 可选：定义服务器基础 URL
      {
        url: 'http://localhost:3000',
        description: '本地开发服务器'
      }
    ]
  },
  // 指向包含 Swagger 注释的 API 路由文件
  apis: ['./routes/*.js'], 
};

// 生成 Swagger/OpenAPI 规范
const swaggerSpec = swaggerJSDoc(swaggerOptions);

//设置中间件（处理请求的拦截器，可以在请求到达路由前或生成响应之前做处理。）
app.use(logger('dev'));//日志中间件，用于记录每次请求的详细信息。
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));//解析请求体的数据，支持JSON和URL编码格式。
app.use(cookieParser());//解析客户端的cookie。
app.use(express.static(path.join(__dirname, '../public'), {index: false}));//指定静态文件的路径，如CSS、图片等前端资源。
//定义路由
app.use('/', index); // index 路由现在基本为空，由 static 处理
app.use('/track',track);//当访问/track时，服务器会加载 track.js 文件中的路由逻辑，来处理关于"车辆轨迹"的相关请求。
app.use('/passenger',passenger);
app.use('/driver',driver);
app.use('/taxi',taxi);
app.use('/order',order);

// 在所有 API 路由之后，添加 Swagger UI 路由 <--- 添加 Swagger UI 路由
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// 在中间件部分添加百度AK验证
app.use('/track', (req, res, next) => {
    if (!process.env.BAIDU_AK) {
        return res.status(500).json({ error: '百度AK未配置' });
    }
    next();
});

// app.get('/ziyu', function(req, res, next) {
//
// });
// catch 404 and forward to error handler（404处理）
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);//'next'函数用于传递控制权给err这个错误对象
});//当请求的路径无法匹配任何已定义的路由时，会返回404错误页面。

// error handler（错误处理）
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  //错误处理中会根据开发环境或者生产环境来提供不同的错误信息提示。
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//设置视图引擎
app.set('views', path.join(__dirname, 'views'));//定义视图模版的位置
app.set('view engine', 'jade');//定义视图模版的渲染引擎(jade,现在叫"pug",用于生成HTML)

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.all('*', function(req, res, next) {//CROS（跨域请求）配置，表示其他域名也可以访问这个服务器，比如前端和后端在不同域名下时需要跨域。
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});



module.exports = app;//导出app

/*项目运行逻辑总结：
项目启动：bin/www 文件启动服务器，通过 require('./app') 加载 app.js 并启动应用。
请求处理：当客户端（如浏览器）向服务器发送请求，app.js 会通过中间件解析请求，然后根据路径和HTTP方法（GET、POST等），将请求交给 routes 文件夹中的具体路由处理。
响应生成：路由文件中的逻辑会调用DAO（数据访问对象）层与数据库交互，处理数据后，将结果通过模板渲染成HTML，或返回JSON数据给前端。*/

//通过理解 app.js 的这些步骤，你可以初步了解如何搭建后端，并进行二次加工，比如扩展新路由、修改API等。如果你想进一步学习，可以从Express框架、路由、中间件、数据库交互等核心知识点入手。 