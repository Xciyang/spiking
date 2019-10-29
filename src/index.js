/*
Copyright © 2019 Ciyang. All rights reserved. 
*/

const readlineSync = require('readline-sync');
const { SingleTasks } = require("./SingleTasks");
const { MultipleTasks } = require("./DynamicMultipleTasks");
const { DynamicMultipleTasks } = require("./DynamicMultipleTasks");

function cutRFLF(str = '') {
    return str ? str.replace(/[\r\n]/g, "") : '';
}

function finishWork(tasks) {
    if (tasks.errorQueue && tasks.errorQueue.length) {
        var res1 = readlineSync.keyInYNStrict('Restart : ');
        if (res1) {
            tasks.waitQueue = tasks.errorQueue;
            tasks.errorQueue = new Array();
            tasks.workMultiple(finishWork);
        }
    } else {
        readlineSync.keyInPause('EXIT');
    }
}

function programStart() {
    var res1 = readlineSync.question('<1>Input URL : ');
    var newTasks = new MultipleTasks(cutRFLF(res1));
    var res2 = readlineSync.question('<2>Input Local Path : ');
    newTasks.setPath(cutRFLF(res2));
    var res3 = readlineSync.questionInt('<3>Input Concurrency : ');
    newTasks.setMultipleNum(res3);
    var res4 = readlineSync.keyInYNStrict('<4>Input Use Proxy or Not  : ');
    if (res4) {
        var res5 = readlineSync.question('<5>Input Proxy : ');
        newTasks.setProxy(cutRFLF(res5));
    }
    console.log('Initialization tasks to complete.');
    newTasks.workMultiple(finishWork);
}

programStart();
