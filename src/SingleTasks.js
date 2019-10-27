/*
Copyright © 2019 Ciyang. All rights reserved. 
*/

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
class SingleTasks {
    constructor(url = '') {
        this.urlSet = new Set();
        this.waitQueue = new Array();
        this.path = './';
        this.errorQueue = new Array();
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
            if (this.firstUrl && u.host != this.firstUrl.host) return;
            if (this.urlSet.has(url)) return;
            his.urlSet.add(url);
            this.waitQueue.push(url);
        } catch (e) {
            console.log('Error URL : ' + url);
        }
    }
    setPath(path = './') {
        this.path = path;
    }
    async download(url = '', tasks) {
        return new Promise((resolve, _reject) => {
            request(url, requestOpt(), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (response.headers['content-type'].search('image') != -1) {
                        resolve(2);
                        try {
                            var upath = new URL(url).pathname.split('/').join('_');
                            request.get(url).pipe(fs.createWriteStream(tasks.path + '/' + upath));
                        } catch (e) {
                            console.log('An unexpected error when downloading pictures, url : ' + url);
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
                        };
                        resolve(1);
                    } else resolve(3);
                } else {
                    tasks.urlSet.delete(url);
                    resolve(0);
                }
            });
        });
    }
    async workSingle(_cb) {
        var bar = new ProgressBar(' progress [:bar] :now \\ :tot Image: :img Error: :err', {
            complete: '=',
            incomplete: ' ',
            width: 25,
            total: 25
        });
        var cnt = 0, cnt2 = 0;
        while (this.waitQueue.length) {
            bar.update(cnt / (this.waitQueue.length + cnt), { now: cnt, tot: this.waitQueue.length + cnt, img: cnt2, err: this.errorQueue.length });
            var nowUrl = this.waitQueue[0];
            this.waitQueue.shift();
            var res = await this.download(nowUrl, this);
            if (res == 0) this.errorQueue.push(nowUrl);
            if (res == 2) cnt2++;
            ++cnt;
        }
        bar.update(1, { now: cnt - this.errorQueue.length, tot: this.waitQueue.length + this.errorQueue.length + cnt, img: cnt2, err: this.errorQueue.length });
        _cb(this);
        return;
    }
}
exports.SingleTasks = SingleTasks;
