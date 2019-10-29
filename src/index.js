/*
Copyright © 2019 Ciyang. All rights reserved. 
*/

const readlineSync = require('readline-sync');
const { SingleTasks } = require("./SingleTasks");
const { MultipleTasks } = require("./MultipleTasks");
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
function DynamicStart(params) {
    var res1 = readlineSync.question('<2>Input URL : ');
    var newTasks = new DynamicMultipleTasks(cutRFLF(res1));
    var res2 = readlineSync.question('<3>Input Local Path : ');
    newTasks.setPath(cutRFLF(res2));
    var res3 = readlineSync.questionInt('<4>Input Concurrency : ');
    newTasks.setMultipleNum(res3);
    var res4 = readlineSync.question('<5>Input Chrome Path : ');
    newTasks.setChromePath(res4);
    var res5 = readlineSync.keyInYNStrict('<6>Input Display Window : ');
    newTasks.setDisplay(res5);
    var res6 = readlineSync.keyInYNStrict('<7>Input Use Proxy or Not  : ');
    if (res6) {
        var res7 = readlineSync.question('<8>Input Proxy : ');
        newTasks.setProxy(cutRFLF(res7));
    }
    console.log('Initialization tasks to complete.');
    newTasks.workMultiple(finishWork);
}
function MultipleStart() {
    var res1 = readlineSync.question('<2>Input URL : ');
    var newTasks = new MultipleTasks(cutRFLF(res1));
    var res2 = readlineSync.question('<3>Input Local Path : ');
    newTasks.setPath(cutRFLF(res2));
    var res3 = readlineSync.questionInt('<4>Input Concurrency : ');
    newTasks.setMultipleNum(res3);
    var res4 = readlineSync.keyInYNStrict('<5>Input Use Proxy or Not  : ');
    if (res4) {
        var res5 = readlineSync.question('<6>Input Proxy : ');
        newTasks.setProxy(cutRFLF(res5));
    }
    console.log('Initialization tasks to complete.');
    newTasks.workMultiple(finishWork);
}

function programStart() {
    while (true) {
        var res = readlineSync.question('<1>Input Way [Multiple(m)/Dynamic(d)]: ');
        if (res == 'm' || res == 'Multiple') {
            MultipleStart();
            break;
        } else if (res == 'd' || res == 'Dynamic') {
            DynamicStart();
            break;
        } else {
            console.log('Wrong way.');
        }
    }
}

programStart();
