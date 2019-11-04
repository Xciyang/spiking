/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
const request = require('request');
const fs = require('fs');
const { JSDOM } = require("jsdom");
const MD5 = require("crypto-js/md5");
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
    console.log(path);
  }
  setMultipleNum(multiplenum = 10) {
    this.multipleNum = parseInt(multiplenum);
  }
  setProxy(porxy = '') {
    this.proxy = porxy;
    try {
      this.req = request.defaults({
        'proxy': porxy
      });
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
  setMainWindow(mainWindow = new BrowserWindow()) {
    this.mainWindow = mainWindow;
  }
  newPage() {
    return new Promise((resolve, reject) => {
      this.browser.newPage().then(res => {
        resolve({
          page: res,
          inUsing: 0
        });
      }).catch(err => {
        reject(err);
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
            this.browser.close().then(() => {
              tasks.browserCreating = 0;
            }).catch(() => {
              tasks.browserCreating = 0;
            });
            reject(err2);
          });
        }).catch(err => {
          tasks.browserCreating = 0;
          console.log('Browser error');
          reject(err);
        });
      });
    }
    return new Promise((resolve) => { resolve(0) });
  }
  loadDynamically(url = '') {
    var tasks = this;
    return new Promise((resolve, reject) => {
      (function useBrowser() {
        for (var i = 0; i < tasks.pageList.length; i++) {
          if (tasks.pageList[i].inUsing) continue;
          ++tasks.pageList[i].inUsing;
          if (tasks.pageList[i].inUsing > 1) throw new Error("There is a problem with the code.");
          tasks.pageList[i].page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 }).then(() => {
            tasks.pageList[i].page.content().then(res2 => {
              --tasks.pageList[i].inUsing;
              resolve(res2);
            }).catch(err => {
              console.log('An unexpected error when downloading pictures, url : ' + url);
              reject(err);
            });
          }).catch(err => {
            if (err instanceof TimeoutError) {
              tasks.pageList[i].page.content().then(res2 => {
                --tasks.pageList[i].inUsing;
                resolve(res2);
              }).catch(err2 => {
                console.log('An unexpected error when downloading pictures, url : ' + url);
                --tasks.pageList[i].inUsing;
                reject(err2);
              });
            } else {
              --tasks.pageList[i].inUsing;
              reject(err);
            }
          });
          return;
        }
        setTimeout(useBrowser, 100);
      })();
    });
  }
  downloadingImg(url2 = '', path2 = '') {
    var strem = fs.createWriteStream(path2);
    if (strem) {
      tasks.req.get(url2, function (error2) {
        if (error2) setTimeout(downloadingImg, 50, url2, path2);
      }).pipe(strem);
    } else {
      console.log('An unexpected error when downloading pictures, url : ' + url2);
    }
  }
  download(url = '') {
    if (this.urlSet.has(url)) return new Promise((resolve) => { resolve(3); });
    this.urlSet.add(url);
    var tasks = this;
    return new Promise((resolve, reject) => {
      tasks.req(url, requestOpt(), function (error, response) {
        if (!error && response.statusCode == 200) {
          var u = new URL(url);
          if (tasks.firstUrl && u.host != tasks.firstUrl.host && response.headers['content-type'].search('image') == -1) {
            resolve(3);
            return;
          }
          if (response.headers['content-type'].search('image') != -1) {
            resolve(2);
            try {
              var upath = MD5(response.request.href).toString();
              var ctype = response.headers['content-type'];
              ctype = ctype.substr(ctype.indexOf('/') + 1);
              var res = ctype.indexOf(';');
              if (res != -1) ctype = ctype.substr(0, res - 1);
              tasks.downloadingImg(url, tasks.path + '/' + upath + '.' + ctype);
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
              reject(err);
            });
          } else {
            resolve(3);
          }
        } else {
          tasks.urlSet.delete(url);
          reject(error);
        }
      });
    });
  }
  downloadImg(url = '') {
    if (this.urlSet.has(url)) return new Promise((resolve) => { resolve(3); });
    this.urlSet.add(url);
    var tasks = this;
    return new Promise((resolve, reject) => {
      tasks.req(url, requestOpt(), function (error, response) {
        if (!error && response.statusCode == 200) {
          if (response.headers['content-type'].search('image') == -1) {
            tasks.urlSet.delete(url);
            tasks.push(url);
            resolve(3);
            return;
          }
          resolve(2);
          try {
            var upath = MD5(response.request.href).toString();
            var ctype = response.headers['content-type'];
            ctype = ctype.substr(ctype.indexOf('/') + 1);
            var res = ctype.indexOf(';');
            if (res != -1) ctype = ctype.substr(0, res - 1);
            tasks.downloadingImg(url, tasks.path + '/' + upath + '.' + ctype);
          } catch (e) {
            console.log('An unexpected error when downloading pictures, url : ' + url);
          }
        } else {
          tasks.urlSet.delete(url);
          reject(error);
        }
      });
    });
  }
  workMultiple(callback) {
    this.stop = 0;
    this.mainWindow.setProgressBar(2);
    var cnt = 0, cnt2 = 0, tasks = this;
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
        tasks.stop = 1;
        tasks.browser.close().then(() => { callback(tasks); }).catch(() => { callback(tasks); });
        return;
      }
      tasks.mainWindow.setProgressBar(cnt / ((tasks.waitQueue.length ? tasks.waitQueue.length : 1) + cnt));
      if ((!tasks.waitQueue.length && !tasks.normalImgQueue.length) || tasks.runningNum >= tasks.multipleNum) return setTimeout(loop, 100);
      var tmpy = Math.min(tasks.normalImgQueue.length, tasks.multipleNum);
      for (var i = 0; i < tmpy; i++) {
        (function (url = '') {
          tasks.downloadImg(url).then(resp => {
            if (resp == 2) cnt2++;
            if (resp != 3) cnt++;
          }).catch(() => {
            tasks.errorQueue.push(url);
          });
        })(tasks.normalImgQueue.shift());
      }
      var tmpx = Math.min(tasks.waitQueue.length, tasks.multipleNum - tasks.runningNum);
      for (var i = 0; i < tmpx; i++) {
        ++tasks.runningNum;
        (function (url = '') {
          tasks.download(url).then(resp => {
            if (resp == 2) cnt2++;
            if (resp != 3) cnt++;
            tasks.runningNum--;
          }).catch(() => {
            tasks.errorQueue.push(url);
            tasks.runningNum--;
          });
        })(tasks.waitQueue.shift());
      }
      return setTimeout(loop, 100);
    };
    var initPage = function () {
      if (tasks.pageList.length >= tasks.multipleNum) setTimeout(loop, 100);
      for (var i = tasks.pageList.length; i < tasks.multipleNum; i++) {
        tasks.newPage().then(res2 => {
          tasks.pageList.push(res2);
          if (tasks.pageList.length == tasks.multipleNum) setTimeout(loop, 100);
        }).catch(() => {
          console.log('Browser page error');
          tasks.browser.close().then(() => {
            tasks.browserRunning = 0;
            callback(tasks);
          }).catch(() => {
            tasks.browserRunning = 0;
            callback(tasks);
          });
        });
      }
    }
    tasks.openBrowser().then(() => {
      initPage();
    }).catch(() => { });
    return;
  }
  close() {
    tasks.browserRunning = 0;
    return this.browser.close();
  }
}

exports.DynamicMultipleTasks = DynamicMultipleTasks;
