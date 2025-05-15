# 1.git clone
    https://github.com/ZeroWangZY/track-manager.git
# 2.nodejs&npm
    安装适当的老版本Node.js，该项目需要使用npm指令和Node的运行环境。<br>    
    (安装npmnode-v8.17.0-win-x64并删去原来npm的系统环境变量设置)
# 3.安装依赖库
    (1)安装前端代码的依赖库：命令行中进入项目根目录，执行命令行命令npm install
    (2)安装后台代码的依赖库：再进入server目录，执行命令行命令npm install
# 4.适当的数据库的创建、插值&连接
    (1)mysql创建数据库/插入数据
    (2)修改数据库连接配置文件server/config/db.js，连接数据库
    (3)检查 MySQL 用户的身份验证插件：
        mysql->  SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
    (4)确保符合mysql模块的数据库连接方式
        （现在的一般是符合mysql2的连接方式caching_sha2_password）  
        mysql->  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
# 5.启动项目运行
    cd server
    npm start
