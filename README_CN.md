# Spiking

Chinese | [English](https://github.com/Xciyang/spiking/blob/master/README.md)

![](https://img.shields.io/github/watchers/Xciyang/spiking?label=watching)
![](https://img.shields.io/github/stars/Xciyang/spiking)
![](https://img.shields.io/github/downloads/Xciyang/spiking/total)
![](https://img.shields.io/github/v/release/Xciyang/spiking)
![](https://img.shields.io/github/license/Xciyang/spiking)
![](https://img.shields.io/github/languages/top/Xciyang/spiking)
![](https://img.shields.io/github/languages/code-size/Xciyang/spiking)
[![](https://www.codefactor.io/repository/github/xciyang/spiking/badge/master)](https://www.codefactor.io/repository/github/xciyang/spiking/overview/master)

一个使用Node.js开发的通用爬图工具。

### 为什么选择它？

- 图形化界面（Electron） 
- 自定义初始链接
- 无头浏览器支持（puppeteer）
- 并发/多线程
- 高效爬取机制
- 自动去重
- 进度可视化
- 使用代理

### 开始

```
git clone https://github.com/Xciyang/spiking.git

cd spiking

npm install

npm start
```

使用淘宝镜像可能会无法正常安装Electron。

请先在`~/.npmrc`文件中加入以下内容，electron_custom_dir设置为当前版本，如`8.2.3`，再进行`npm install`。

```
npm config set electron_mirror=https://npm.taobao.org/mirrors/electron/
npm config set electron_custom_dir=X.X.X
```

### 用法(Usage)

下载最新的[Release](https://github.com/Xciyang/spiking/releases)版本。

请阅读用法：[简体中文(zh_CN)](https://github.com/Xciyang/spiking/blob/master/USAGE_CN.md)

### 待完成项(To-do list)

- 语言本地化
- 任务保存
- 自定义筛选方式

### 更多(More)

[Electron](https://github.com/electron/electron)

[puppeteer](https://github.com/puppeteer/puppeteer)