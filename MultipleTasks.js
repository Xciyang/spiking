/*
Copyright © 2019 Ciyang. All rights reserved. 
*/

const readlineSync = require('readline-sync');
const request = require('request');
const fs = require('fs');
const ProgressBar = require('progress');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function requestOpt() {
    return {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
            'Connection': 'keep-alive'
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
        try {
            this.firstUrl = new URL(url);
        } catch (e) {
            console.log('I think your should restart the program.');
        }
        this.push(url);
    }
    push(url = '') {
        try {
            var u = new URL(url, this.firstUrl);
            url = u.href;
            var tasks = this;
            if (this.firstUrl && u.host != this.firstUrl.host) {
                request.get(url, requestOpt(), function (error, response, body) {
                    if (!error && response.statusCode == 200 && response.headers['content-type'].search('image') != -1)
                        tasks.waitQueue.push(url);
                });
                return;
            }
            if (!this.urlSet.has(url))
                this.waitQueue.push(url);
        }
        catch (e) {
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
    async download(url = '') {
        if (this.urlSet.has(url))
            return new Promise((resolve, reject) => { resolve(3); });
        this.urlSet.add(url);
        var tasks = this;
        return new Promise((resolve, reject) => {
            request(url, requestOpt(), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (response.headers['content-type'].search('image') != -1) {
                        resolve(2);
                        var downloadImg = function (url = '', path = '') {
                            try {
                                var strem = fs.createWriteStream(path);
                                if (strem)
                                    request.get(url, requestOpt(), function (error2, response2, body2) {
                                        if (error2)
                                            setTimeout(downloadImg, 50, url, path);
                                    }).pipe(strem);
                            }
                            catch (error) {
                                console.log('An unexpected error when downloading pictures, url : ' + url);
                            }
                        };
                        var upath = new URL(url).pathname.split('/').join('_');
                        setTimeout(downloadImg, 50, url, tasks.path + '/' + upath);
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
                                tasks.push(iterator.src);
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
                    } else resolve(3);
                } else {
                    tasks.urlSet.delete(url);
                    resolve(0);
                }
            });
        });
    }
    async workMultiple() {
        var bar = new ProgressBar(' progress [:bar] :now \\ :tot Image: :img Error: :err', {
            complete: '=',
            incomplete: ' ',
            width: 25,
            total: 25
        });
        var cnt = 0, cnt2 = 0;
        var tasks = this;
        var loop = function () {
            if (!tasks.runningNum && !tasks.waitQueue.length) {
                bar.update(1, { now: cnt - tasks.errorQueue.length, tot: cnt, img: cnt2, err: tasks.errorQueue.length });
                if (tasks.errorQueue.length) {
                    var res1 = readlineSync.question('Restart <1 | 0> ? :');
                    if (res1 == 1) {
                        tasks.waitQueue = tasks.errorQueue;
                        tasks.errorQueue = new Array();
                        setTimeout(loop, 100);
                    }
                }
                return;
            }
            bar.update(cnt / ((tasks.waitQueue.length ? tasks.waitQueue.length : 1) + cnt), { now: cnt, tot: tasks.waitQueue.length + cnt, img: cnt2, err: tasks.errorQueue.length });
            if (!tasks.waitQueue.length || tasks.runningNum >= tasks.multipleNum) {
                setTimeout(loop, 100);
                return;
            }
            var tmpx = Math.min(tasks.waitQueue.length, tasks.multipleNum);
            for (var i = 0; i < tmpx; i++) {
                (function (url = '') {
                    tasks.download(url).then(resp => {
                        if (resp == 0)
                            tasks.errorQueue.push(url);
                        if (resp == 2)
                            cnt2++;
                        if (resp != 3)
                            cnt++;
                        --tasks.runningNum;
                    });
                })(tasks.waitQueue[0]);
                tasks.waitQueue.shift();
                ++tasks.runningNum;
            }
            setTimeout(loop, 100);
            return;
        };
        setTimeout(loop, 100);
        return;
    }
}
exports.MultipleTasks = MultipleTasks;
