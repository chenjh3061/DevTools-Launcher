# DevTools-Launcher快捷脚本启动器

基于Electron，采用原生JS实现的脚本启动器，如elasticsearch.bat不需要手动点击，在图形界面都可以一键启动。

### 使用：
下载依赖（注意Electron依赖东西很多，可能会耗费很久时间下载）
```
npm install 
```
本地启动
```
npm start
```
```
npm run dist
```
```
npm run package-win
```


现有功能：
  - 一键启动对应服务
  - 手动添加/删除/修改服务配置
  - 修改对应服务的yml配置文件
  - 监听服务端口和日志

后续优化：
  - 服务自动发现（扫描常见安装路径）
  - UI、交互优化
  - 端口占用检测
  - 依赖关系管理
  - JDK/Python/Node.js版本切换
  - 环境变量批量管理
  - 实时资源占用图表（CPU/内存/磁盘）
  - 服务健康度评分
  - 异常报警（邮件/桌面通知）
  - 自动化工作流
