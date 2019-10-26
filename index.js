/*
Copyright © 2019 Ciyang. All rights reserved. 
*/

const request = require('request');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const readlineSync = require('readline-sync');
const ProgressBar = require('progress');

class UrlTasks {
    constructor(url = '', flag = 1) {
        this.urlSet = new Set();
        this.waitQueue = new Array();
        this.flag = flag;
        this.waitToDeal = 0;
        this.path = './';
        this.errorQueue = new Array();
        if (this.flag) {
            try {
                this.firstUrl = new URL(url);
            } catch (e) {
                console.log('I think your should restart the program');
            }
        }
        this.push(url);
    }
    push(url = '') {
        var u;
        try {
            u = new URL(url, this.firstUrl);
            url = u.href;
        } catch (error) {
            console.log('error : ' + url);
            return -1;
        }
        if (this.firstUrl && u.host != this.firstUrl.host) return -1;
        if (this.urlSet.has(url)) return -1;
        this.urlSet.add(url);
        this.waitQueue.push(url);
        ++this.waitToDeal;
    }
    setPath(path = './') {
        this.path = path;
    }
    // async waitForFinish() {
    //     return new Promise(resolve => {
    //         var interval = setInterval(function () {
    //             if (this.waitToDeal == 0) {
    //                 if (interval) window.clearInterval(interval);
    //                 resolve(1);
    //             }
    //         }, 1000)
    //     });
    //     return;
    // }
    // work() {
    //     while (this.waitQueue.length) {
    //         var cnt = this.waitQueue.length;
    //         while (cnt--) {
    //             var nowUrl = this.waitQueue[0];
    //             this.waitQueue.shift();
    //             request(nowUrl, function (error, response, body) {
    //                 if (err) {
    //                     return console.error('error to : ' + nowUrl);
    //                 }
    //                 if (response.statusCode == 200) {

    //                 }
    //                 --this.waitToDeal;
    //             });
    //         }
    //         this.waitForFinish();
    //     }
    // }
    async download(url = '', tasks) {
        return new Promise((resolve, reject) => {
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (response.headers['content-type'].search('image') != -1) {
                        try {
                            var upath = new URL(url).pathname.split('/').join('_');
                            request.get(url).pipe(fs.createWriteStream(tasks.path + '/' + upath));
                        } catch (e) {
                            console.log('error1');
                        }
                    }
                    else if (response.headers['content-type'].search('text') != -1) {
                        const dom = new JSDOM(body, {
                            url: url,
                            contentType: response.headers['content-type'],
                            runScripts: "outside-only"
                        });
                        var imgList = dom.window.document.getElementsByTagName('img');
                        for (const iterator of imgList) {
                            if (iterator.src) tasks.push(iterator.src);
                            if (iterator.href) tasks.push(iterator.href);
                        }
                        var aList = dom.window.document.getElementsByTagName('a');
                        for (const iterator of aList) {
                            if (iterator.src) tasks.push(iterator.src);
                            if (iterator.href) tasks.push(iterator.href);
                        }
                    }
                    resolve(1);
                    return;
                }
                console.log('error : ' + url);
                tasks.errorQueue.push(url);
                resolve(0);
            });
        });
    }
    async workSingle() {
        var bar = new ProgressBar(' progress [:bar] :now \\ :tot', {
            complete: '=',
            incomplete: ' ',
            width: 100,
            total: 100
        });
        var cnt = 0;
        while (this.waitQueue.length) {
            bar.update(cnt / (this.waitToDeal + cnt), { now: cnt, tot: this.waitToDeal + cnt });
            var nowUrl = this.waitQueue[0];
            this.waitQueue.shift();
            var res = await this.download(nowUrl, this);
            if (res == 0) console.log('failed : ' + nowUrl);
            --this.waitToDeal, ++cnt;
        }
        bar.update(1);
        var res = this.errorQueue;
        this.errorQueue = '';
        return res;
    }
}
process.stdin.setEncoding('utf8');

function cutRFLF(str = '') {
    return str ? str.replace(/[\r\n]/g, "") : '';
}

function programStart() {
    var res1 = readlineSync.question('<1>Input URL : ');
    var newTasks = new UrlTasks(cutRFLF(res1));
    var res2 = readlineSync.question('<2>Input Local Path : ');
    newTasks.setPath(cutRFLF(res2));
    newTasks.workSingle();
}

programStart();
