# Spiking

![](https://img.shields.io/github/issues/Xciyang/spiking)
![](https://img.shields.io/github/forks/Xciyang/spiking)
![](https://img.shields.io/github/stars/Xciyang/spiking)
![](https://img.shields.io/github/license/Xciyang/spiking)
![](https://img.shields.io/github/languages/top/Xciyang/spiking)
![](https://img.shields.io/github/last-commit/Xciyang/spiking)
![](https://img.shields.io/github/languages/code-size/Xciyang/spiking)
![](https://img.shields.io/github/repo-size/Xciyang/spiking)

一个使用JavaScript开发的爬图工具。

A web crawler tool developed using JavaScript.

### 为什么选择它？(Advantage)

- 自定义初始链接 Custom initial link
- 并发/多线程 Concurrent / multithreaded
- 广度优先遍历策略 Breadth-first traversal strategy
- 自动去重 Automatic similarity
- 可调控的爬取速度 Adjustable crawling speed
- 进度可视化 Progress visualization

### 开始(Getting started)

```
git clone https://github.com/Xciyang/spiking.git

npm install

npm start
```

### 用法(Usage)

当你`start`后依次进行下列操作。

Do the following after `start`.

1. Input URL
2. Input Local Path
3. Input Concurrency
4. Input Use Proxy or Not
5. Input Proxy(optional)

然后爬取会自动开始。

Then the crawl will start automatically.

当一切结束后可以重试请求失败的链接。

When everything is done you can retry the failed link request.


### 待完成项(To-do list)

- 无头浏览器支持 Headless browser support
- 多种筛选方式 Multiple filtering methods
- 自定义筛选方式 Custom filtering method
- 使用Electron框架 Using the electron frame
