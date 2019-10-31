/*
Copyright © 2019 Ciyang. All rights reserved. 
*/

const request = require('request');
const fs = require('fs');
const ProgressBar = require('progress');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const MD5 = require("crypto-js/MD5");
const puppeteer = require('puppeteer-core');
const { TimeoutError } = require('puppeteer-core/Errors');

function requestOpt() {
    return {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        },
        timeout: 10000
    };
}
class DynamicMultipleTasks {
    constructor(url = '') {
        this.urlSet = new Set();
        this.waitQueue = new Array();
        this.path = './';
        this.multipleNum = 10;
        this.errorQueue = new Array();
        this.runningNum = 0;
        this.finishNum = 0;
        this.req = request.defaults();
        this.browserCreating = 0;
        this.browserRunning = 0;
        this.normalImgQueue = new Array();
        this.displayWindow = true;
        this.chromePath = '';
        this.pageList = new Array();
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
        this.proxy = porxy;
        try {
            this.req = request.defaults({
                'proxy': porxy
            });;
        } catch (e) {
            console.log('Proxy error.');
        }
    }
    setDisplay(disp = true) {
        this.displayWindow = disp;
    }
    setChromePath(path = '') {
        this.chromePath = path;
    }
    newPage() {
        return new Promise((resolve, reject) => {
            this.browser.newPage().then(res => {
                resolve({
                    page: res,
                    inUsing: 0
                });
            }).catch(err => {
                reject('error');
            });
        })
    }
    openBrowser() {
        var tasks = this;
        if (!tasks.browserRunning) {
            console.log('Create browser');
            tasks.browserCreating = 1;
            var opt = {
                executablePath: tasks.chromePath,
                headless: !tasks.displayWindow
            };
            // if (tasks.proxy) opt.args = ['--proxy-server=' + tasks.proxy];
            return new Promise((resolve, reject) => {
                puppeteer.launch(opt).then(res => {
                    tasks.browser = res;
                    tasks.browserRunning = 1;
                    tasks.newPage().then(res2 => {
                        tasks.pageList.push(res2);
                        tasks.browserCreating = 0;
                        resolve(0);
                    }).catch(err2 => {
                        this.browser.close().then(res => {
                            tasks.browserCreating = 0;
                        }).catch(err => {
                            tasks.browserCreating = 0;
                        });
                        reject(0);
                    });
                }).catch(err => {
                    tasks.browserCreating = 0;
                    console.log('Browser error');
                    reject(0);
                });
            });
        }
        return new Promise((resolve, reject) => { resolve(0) })
    }
    loadDynamically(url = '') {
        var tasks = this;
        return new Promise((resolve, reject) => {
            (function useBrowser() {
                for (var i = 0; i < tasks.pageList.length; i++) {
                    if (tasks.pageList[i].inUsing) continue;
                    ++tasks.pageList[i].inUsing;
                    if (tasks.pageList[i].inUsing > 1) throw new Error("There is a problem with the code.");
                    tasks.pageList[i].page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 }).then(res => {
                        tasks.pageList[i].page.content().then(res2 => {
                            --tasks.pageList[i].inUsing;
                            resolve(res2);
                        }).catch(err => {
                            console.log('An unexpected error when downloading pictures, url : ' + url);
                        });
                    }).catch(err => {
                        if (err instanceof TimeoutError) {
                            tasks.pageList[i].page.content().then(res2 => {
                                --tasks.pageList[i].inUsing;
                                resolve(res2);
                            }).catch(err => {
                                console.log('An unexpected error when downloading pictures, url : ' + url);
                                --tasks.pageList[i].inUsing;
                                reject(0);
                            });
                            return;
                        }
                        --tasks.pageList[i].inUsing;
                        reject(0);
                    });
                    return;
                }
                setTimeout(useBrowser, 100);
            })();
        });
    }
    download(url = '') {
        if (this.urlSet.has(url)) return new Promise((resolve, reject) => { resolve(3); });
        this.urlSet.add(url);
        var tasks = this;
        return new Promise((resolve, reject) => {
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
                                tasks.req.get(_url, function (_error, r, b) {
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
                            if (res != -1) ctype = ctype.substr(0, res - 1);
                            downloadImg(url, tasks.path + '/' + upath + '.' + ctype);
                        } catch (e) {
                            console.log('An unexpected error when downloading pictures, url : ' + url);
                        }
                    }
                    else if (response.headers['content-type'].search('text') != -1) {
                        tasks.loadDynamically(url).then(res => {
                            resolve(1);
                            var dom = new JSDOM(res);
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
                        }).catch(err => {
                            tasks.urlSet.delete(url);
                            resolve(0);
                        });
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
                        var strem = fs.createWriteStream(_path);
                        if (strem) {
                            tasks.req.get(_url, function (_error, r, b) {
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
        var bar = new ProgressBar(' progress [:bar] :now \\ :tot Image: :img Error: :err', {
            complete: '=',
            incomplete: ' ',
            width: 25,
            total: 25
        });
        var cnt = 0, cnt2 = 0, tasks = this;
        var loop = function () {
            if (!tasks.runningNum && !tasks.waitQueue.length) {
                bar.update(1, { now: cnt - tasks.errorQueue.length, tot: cnt, img: cnt2, err: tasks.errorQueue.length });
                tasks.browser.close().then(res => { _cb(tasks); });
                return;
            }
            bar.update(cnt / ((tasks.waitQueue.length ? tasks.waitQueue.length : 1) + cnt), { now: cnt, tot: tasks.waitQueue.length + cnt, img: cnt2, err: tasks.errorQueue.length });
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
            return setTimeout(loop, 100);
        };
        var initPage = function () {
            for (var i = tasks.pageList.length; i < tasks.multipleNum; i++) {
                tasks.newPage().then(res2 => {
                    tasks.pageList.push(res2);
                    if (tasks.pageList.length == tasks.multipleNum) setTimeout(loop, 100);
                }).catch(err => {
                    console.log('Browser page error');
                    tasks.browser.close().then(res => {
                        tasks.browserRunning = 0;
                        _cb(tasks);
                    }).catch(err => {
                        tasks.browserRunning = 0;
                        _cb(tasks);
                    });
                });
            }
        }
        tasks.openBrowser().then(res => {
            initPage();a
        }).catch(err => {
            console.log('error');
        });
        return;
    }
    close() {
        return this.browser.close();
    }
}

exports.DynamicMultipleTasks = DynamicMultipleTasks;
