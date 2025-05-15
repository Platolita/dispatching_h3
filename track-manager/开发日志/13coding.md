# 2025/1/13 coding

## 修改
### 1. 修改数据库密码

    修改server/conf/db.js中的密码为193878


### 2. 修改src/component/Map.js中的fetchAllOrder

    修改src/component/Map.js中的fetchAllOrder为"fetchAllOrder().then(orders => {this.setState({ orders });});"

## 出现问题

### 1. 地图组件加载失败
    运行这个项目打开前端，点击“统计”发现在浏览器终端有一个报错“bundle.js:35884 Uncaught (in promise) TypeError: (0 , _index.getDriver)(...).then is not a function
    at MapControllerCpnt.componentDidMount (bundle.js:35884:37)
    at bundle.js:106582:25
    at measureLifeCyclePerf (bundle.js:106393:12)
    at bundle.js:106581:11
    at CallbackQueue.notifyAll (bundle.js:55829:22)
    at ReactReconcileTransaction.close (bundle.js:111440:26)
    at ReactReconcileTransaction.closeAll (bundle.js:17903:25)
    at ReactReconcileTransaction.perform (bundle.js:17850:16)
    at ReactUpdatesFlushTransaction.perform (bundle.js:17837:20)
    at ReactUpdatesFlushTransaction.perform (bundle.js:5039:32)”，同时轨迹查询下的地图组件不断转圈，好像是在加载

### 2. 点击h3格网返回空json

# 2025/1/14 analysis
## 分析细节
    1. 前端没有实现司乘匹配和h3格网划分的细节
    2. 我认为整个前端只需要显示司乘匹配效果和h3格网划分效果就可以了，而具体的司乘匹配和h3格网划分的逻辑应该在后台实现
    3. 这样看的话，后端还需要做的工作有？（见前端项目报错分析与解决）
# 2025/1/16 思考
## 项目进展的思考
    1.用h3格网结合强化学习或者什么东西做出来就可以有一个成果了，就可以发文章？然后结2.项？但是其效用、与现有方案的对比、创新呢？
    3. 如果用h3格网结合强化学习，那么需要做的工作有？
# 2025/3/28 pgsql连接成功
## 问题：
    录入还不够精确；目前进展到优化录入脚本和协调数据库表了；最近的困难是旧的不如意的数据在表里面因为有依赖删不掉。
# 2025/4/15 更换思路，实现派单
## 完成工作：
### 对PGSQL存储h3交通路网的暂时的失败尝试，转而使用百度地图服务api；
1.改了百度地图AK，原来自建的的AK不能用了，新建了一个用上了；
2.获取司乘单元坐标getpassengerpoints、getdriverpoints；
3.实现了没有h3格网的全局贪心司乘派单匹配接口dispatch_matching;
## 下面的工作：
### 实现基于h3格网的派单匹配。
1.尤其注意数据库设计（需不需要存储多级/含属性的h3格网等等新增表）、
2.利用h3格网进行派单匹配是否需要多级格网？
3.考虑百度地图api提供的更多服务（交通路网？等等等等）

# 2025/5/10 完成基于h3格网的派单匹配dev
## 完成工作：
### 实现基于h3格网的派单匹配。
1.完成了基于h3格网的派单匹配[但是运算成本是巨大的]：
    (1)数据库中对司乘的存储冗余度高，众多坐标距离相近的(司机/乘客)点重复存储，占用空间大，查询效率低；
    (2)后端整体时空间复杂度没有概念，进而牵扯到Redis缓存的布设、百度地图的QPS服务购买指标等；
## 下面的工作：
    1.两个派单方法得到的将写入`order`表的订单数据需要再细化；
    2.两个派单方法的复杂度比较衡量指标需要确立，以便前端展示；
    3.再有可能的精力的话，优化数据库结构,聚合冗余,[近邻合并]===>DEBSCAN、K-means聚类算法试试；
    4.再有可能的话，引入[路径缓存]
    5.派单的h3格网应用优化到9~4、3、2级？