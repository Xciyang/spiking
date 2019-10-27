/*
Copyright © 2019 Ciyang. All rights reserved. 
*/


const request = require('request');
const fs = require('fs');
const ProgressBar = require('progress');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
        return new Promise((resolve, reject) => {
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (response.headers['content-type'].search('image') != -1) {
                        try {
                            resolve(2);
                            var upath = new URL(url).pathname.split('/').join('_');
                            request.get(url).pipe(fs.createWriteStream(tasks.path + '/' + upath));
                        } catch (e) {
                            console.log('An unexpected error when downloading pictures, url : ' + url);
                        }
                        return;
                    }
                    if (response.headers['content-type'].search('text') != -1) {
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
                        }
                    }
                    resolve(1);
                    return;
                }
                console.log('request failed, url : ' + url);
                tasks.errorQueue.push(url);
                resolve(0);
            });
        });
    }
    async workSingle() {
        var bar = new ProgressBar(' progress [:bar] :now \\ :tot :img', {
            complete: '=',
            incomplete: ' ',
            width: 100,
            total: 100
        });
        var cnt = 0, cnt2 = 0;
        while (this.waitQueue.length) {
            bar.update(cnt / (this.waitQueue.length + cnt), { now: cnt, tot: this.waitQueue.length + cnt, img: cnt2 });
            var nowUrl = this.waitQueue[0];
            this.waitQueue.shift();
            var res = await this.download(nowUrl, this);
            if (res == 0) console.log('failed download: ' + nowUrl);
            if (res == 2) cnt2++;
            ++cnt;
        }
        bar.update(1, { now: cnt - this.errorQueue.length, tot: this.waitQueue.length + this.errorQueue.length + cnt, img: cnt2 });
        var res = this.errorQueue;
        this.errorQueue = '';
        return res;
    }
}
exports.SingleTasks = SingleTasks;
