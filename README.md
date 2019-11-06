# Spiking

![](https://img.shields.io/github/watchers/Xciyang/spiking?label=watching)
![](https://img.shields.io/github/stars/Xciyang/spiking)
![](https://img.shields.io/github/downloads/Xciyang/spiking/total)
![](https://img.shields.io/github/v/release/Xciyang/spiking)
![](https://img.shields.io/github/license/Xciyang/spiking)
![](https://img.shields.io/github/languages/top/Xciyang/spiking)
![](https://img.shields.io/github/languages/code-size/Xciyang/spiking)
[![](https://www.codefactor.io/repository/github/xciyang/spiking/badge/master)](https://www.codefactor.io/repository/github/xciyang/spiking/overview/master)

一个使用Node.js开发的通用爬图工具。

A common web crawler tool developed using Node.js.

### 为什么选择它？(Advantage)

- 图形化界面（使用Electron） Graphical Interface (Using Electron)
- 自定义初始链接 Custom initial link
- 无头浏览器支持 Headless browser support 
- 并发/多线程 Concurrent / multithreaded
- 高效爬取机制 Efficient crawling mechanism
- 自动去重 Automatic similarity
- 可调控的爬取速度 Adjustable crawling speed
- 进度可视化 Progress visualization
- 使用代理 Using a proxy

### 开始(Getting started)

```
git clone https://github.com/Xciyang/spiking.git

cd spiking

npm install

npm start
```

如果你在中国，存在一些致命的问题，使用淘宝镜像无法正常安装Electron@7.0.1。

请先在`~/.npmrc`文件中加入以下内容，再进行`npm install`。

```
npm config set electron_mirror=https://npm.taobao.org/mirrors/electron/
npm config set electron_custom_dir=7.1.0
```

### 用法(Usage)

下载最新的[Release](https://github.com/Xciyang/spiking/releases)版本。

Download the latest [Release] (https://github.com/Xciyang/spiking/releases) version.

请阅读用法：[简体中文(zh_CN)](https://github.com/Xciyang/spiking/blob/master/USAGE.md)

Please read usage: [English(en_US)](https://github.com/Xciyang/spiking/blob/master/USAGE_EN.md)

### 待完成项(To-do list)

- 语言本地化 Localization
- 任务保存 Tasks Saving
- 自定义筛选方式 Custom filtering method

### 更多(More)

[Electron](https://github.com/electron/electron)
