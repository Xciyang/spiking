﻿/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
const request = require('request');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const MD5 = require("crypto-js/MD5");
const { BrowserWindow } = require('electron')

function requestOpt() {
    return {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        },
        timeout: 10000
    };
}
class MultipleTasks {
    constructor(url = '') {
        this.urlSet = new Set();
        this.waitQueue = new Array();
        this.path = './';
        this.multipleNum = 10;
        this.errorQueue = new Array();
        this.runningNum = 0;
        this.finishNum = 0;
        this.req = request.defaults();
        this.normalImgQueue = new Array();
        this.stop = 1;
        try {
            this.firstUrl = new URL(url);
        } catch (e) {
            console.log('URL parsing error.');
        }
        this.push(url);
    }
    push(url = '') {
        try {
            var u = new URL(url, this.firstUrl);
            url = u.href;
            if (!this.urlSet.has(url)) this.waitQueue.push(url);
        } catch (e) {
            console.log('Error URL : ' + url);
        }
        return;
    }
    pushImg(url = '') {
        try {
            var u = new URL(url, this.firstUrl);
            url = u.href;
            if (!this.urlSet.has(url)) this.normalImgQueue.push(url);
        } catch (e) {
            console.log('Error URL : ' + url);
        }
        return;
    }
    setPath(path = './') {
        this.path = path;
    }
    setMultipleNum(multiplenum = 10) {
        this.multipleNum = parseInt(multiplenum);
    }
    setProxy(porxy = '') {
        try {
            this.req = request.defaults({
                'proxy': porxy
            });;
        } catch (e) {
            console.log('Proxy error.');
        }
    }
    setMainWindow(mainWindow = new BrowserWindow()) {
        this.mainWindow = mainWindow;
    }
    download(url = '') {
        if (this.urlSet.has(url)) return new Promise((resolve, _reject) => { resolve(3); });
        this.urlSet.add(url);
        var tasks = this;
        return new Promise((resolve, _reject) => {
            tasks.req(url, requestOpt(), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var u = new URL(url);
                    if (tasks.firstUrl && u.host != tasks.firstUrl.host && response.headers['content-type'].search('image') == -1) {
                        resolve(3);
                        return;
                    }
                    if (response.headers['content-type'].search('image') != -1) {
                        resolve(2);
                        var downloadImg = function (_url = '', _path = '') {
                            var strem = fs.createWriteStream(_path);
                            if (strem) {
                                tasks.req.get(_url, function (_error, _response, _body) {
                                    if (_error) setTimeout(downloadImg, 50, _url, _path);
                                }).pipe(strem);
                            } else {
                                console.log('An unexpected error when downloading pictures, url : ' + _url);
                            }
                        }
                        try {
                            var upath = MD5(response.request.href).toString();
                            var ctype = response.headers['content-type'];
                            ctype = ctype.substr(ctype.indexOf('/') + 1);
                            var res = ctype.indexOf(';');
                            if (res != -1) ctype = ctype.substr(0, res);
                            downloadImg(url, tasks.path + '/' + upath + '.' + ctype);
                        } catch (e) {
                            console.log('An unexpected error when downloading pictures, url : ' + _url);
                        }
                    }
                    else if (response.headers['content-type'].search('text') != -1) {
                        resolve(1);
                        const dom = new JSDOM(body, {
                            url: url,
                            contentType: response.headers['content-type'],
                            runScripts: 'outside-only',
                            userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
                        });
                        var imgList = dom.window.document.getElementsByTagName('img');
                        for (const iterator of imgList) {
                            if (iterator.src)
                                tasks.pushImg(iterator.src);
                            if (iterator.href)
                                tasks.push(iterator.href);
                        }
                        var aList = dom.window.document.getElementsByTagName('a');
                        for (const iterator of aList) {
                            if (iterator.src)
                                tasks.push(iterator.src);
                            if (iterator.href)
                                tasks.push(iterator.href);
                        }
                        // ...
                    } else {
                        resolve(3);
                    }
                } else {
                    tasks.urlSet.delete(url);
                    resolve(0);
                }
            });
        });
    }
    downloadImg(url = '') {
        if (this.urlSet.has(url)) return new Promise((resolve, reject) => { resolve(3); });
        this.urlSet.add(url);
        var tasks = this;
        return new Promise((resolve, reject) => {
            tasks.req(url, requestOpt(), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (response.headers['content-type'].search('image') == -1) {
                        tasks.urlSet.delete(url);
                        tasks.push(url);
                        resolve(3);
                        return;
                    }
                    resolve(2);
                    var downloadImg = function (_url = '', _path = '') {
                        try {
                            var strem = fs.createWriteStream(_path);
                            if (strem) {
                                tasks.req.get(_url, function (_error, r, b) {
                                    if (_error) setTimeout(downloadImg, 50, _url, _path);
                                }).pipe(strem);
                            }
                        } catch (err) {
                            console.log('An unexpected error when downloading pictures, url : ' + _url);
                        }
                    }
                    try {
                        var upath = MD5(response.request.href).toString();
                        var ctype = response.headers['content-type'];
                        ctype = ctype.substr(ctype.indexOf('/') + 1);
                        var res = ctype.indexOf(';');
                        if (res != -1) ctype = ctype.substr(0, res - 1);
                        downloadImg(url, tasks.path + '/' + upath + '.' + ctype);
                    } catch (e) {
                        console.log('An unexpected error when downloading pictures, url : ' + url);
                    }
                } else {
                    tasks.urlSet.delete(url);
                    resolve(0);
                }
            });
        });
    }
    workMultiple(_cb) {
        this.stop = 0;
        this.mainWindow.setProgressBar(2);
        var cnt = 0, cnt2 = 0;
        var tasks = this;
        var loop = function () {
            if (tasks.stop) return;
            tasks.mainWindow.webContents.send('setProgress', {
                a: cnt,
                b: (tasks.waitQueue.length ? tasks.waitQueue.length : 1) + cnt
            });
            tasks.mainWindow.webContents.send('setImageNum', cnt2);
            tasks.mainWindow.webContents.send('setErrorNum', tasks.errorQueue.length);
            if (!tasks.runningNum && !tasks.waitQueue.length) {
                tasks.mainWindow.setProgressBar(-1);
                tasks.stop = 0;
                return _cb(tasks);
            }
            tasks.mainWindow.setProgressBar(cnt / ((tasks.waitQueue.length ? tasks.waitQueue.length : 1) + cnt));
            if ((!tasks.waitQueue.length && !tasks.normalImgQueue.length) || tasks.runningNum >= tasks.multipleNum) return setTimeout(loop, 100);
            var tmpy = Math.min(tasks.normalImgQueue.length, tasks.multipleNum);
            for (var i = 0; i < tmpy; i++) {
                (function (url = '') {
                    tasks.downloadImg(url).then(resp => {
                        if (resp == 0) tasks.errorQueue.push(url);
                        if (resp == 2) cnt2++;
                        if (resp != 3) cnt++;
                    });
                })(tasks.normalImgQueue[0]);
                tasks.normalImgQueue.shift();
            }
            var tmpx = Math.min(tasks.waitQueue.length, tasks.multipleNum - tasks.runningNum);
            for (var i = 0; i < tmpx; i++) {
                ++tasks.runningNum;
                (function (url = '') {
                    tasks.download(url).then(resp => {
                        if (resp == 0) tasks.errorQueue.push(url);
                        if (resp == 2) cnt2++;
                        if (resp != 3) cnt++;
                        tasks.runningNum--;
                    });
                })(tasks.waitQueue[0]);
                tasks.waitQueue.shift();
            }
            setTimeout(loop, 100);
        }
        setTimeout(loop, 100);
    }
}

exports.MultipleTasks = MultipleTasks;
