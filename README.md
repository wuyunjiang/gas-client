# 实时 Gas（桌面悬浮版）

[悬浮主界面]

软件主要有两个功能
1、显示实时 BaseFee 和矿工小费信息，点击 gas 小图标，显示 gas 详细，分为 1、2、3 档
[展开 gas 详情界面]

2、持续监听指定合约的某个变量的值，比如 nft 的已 mint 数量，公售开关是否开启，mint 价格，owner 等等
[展开合约变量监听界面]

**联系我直接获取**
电话/微信同号：15756290079

**自己编译**

1、克隆仓库代码到本地
2、npm install 安装依赖
3、修改 App.js 中 setGasSocket 方法内的代码，连接到自己的 WebSocket 服务器
4、运行 npm run tauri dev 调试代码
5、运行 npm run tauri build 生成安装包

关于第三步，需要自己开发服务端代码，原理也很简单，间隔几秒调用一下 blocknative 的获取 gas 的接口，然后与客户端建立 socket 连接传递数据就好

```
https://api.blocknative.com/gasprices/blockprices
```
