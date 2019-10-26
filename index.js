const request = require('request')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// const MD5 = require("crypto-js/md5");

class UrlTasks {
    constructor(url = '', flag = 1) {
        this.urlSet = new Set();
        this.waitQueue = new Array();
        this.flag = flag;
        this.waitToDeal = 0;
        if (this.flag) this.firstUrl = new URL(url);
        this.push(url);
    }
    push(url = '') {
        if (this.urlSet.has(url)) return -1;
        this.urlSet.add(url);
        this.waitQueue.push(url);
        ++this.waitToDeal;
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
                if (error) {
                    resolve(0);
                    return;
                }
                if (response.statusCode == 200) {
                    if (response.headers['content-type'] == 'image/png') {

                    }
                    else {
                        const dom = new JSDOM(body, {
                            url: url,
                            contentType: response.headers['content-type'],
                            runScripts: "outside-only"
                        });
                        var aList = dom.window.document.getElementsByTagName('a');
                        for (const iterator of aList) {
                            if (iterator.src) tasks.push(iterator.src);
                            if (iterator.href) tasks.push(iterator.href);
                        }
                        var imgList = dom.window.document.getElementsByTagName('img');
                        for (const iterator of imgList) {
                            if (iterator.src) tasks.push(iterator.src);
                            if (iterator.href) tasks.push(iterator.href);
                        }
                    }
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }
    async workSingle() {
        while (this.waitQueue.length) {
            var nowUrl = this.waitQueue[0];
            this.waitQueue.shift();
            var res = await this.download(nowUrl, this);
            if (res == 0) console.log('failed : ' + nowUrl);
            --this.waitToDeal;
        }
    }
}

process.stdin.setEncoding('utf8');

console.log('Input URL:');

process.stdin.on('readable', () => {
    programStart();
});

function programStart() {
    var chunk = process.stdin.read();
    var newTasks = new UrlTasks(chunk);
    newTasks.workSingle();
    console.log('任务启动！');
}