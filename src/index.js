/*
Copyright © 2019 Ciyang. All rights reserved. 
*/

const readlineSync = require('readline-sync');
const { SingleTasks } = require("./SingleTasks");
const { MultipleTasks } = require("./MultipleTasks");

function cutRFLF(str = '') {
    return str ? str.replace(/[\r\n]/g, "") : '';
}

function finishWork(tasks) {
    if (tasks.errorQueue && tasks.errorQueue.length) {
        var res1 = readlineSync.question('Restart < 1 | 0 > : ');
        if (cutRFLF(res1) == 1) {
            tasks.waitQueue = tasks.errorQueue;
            tasks.errorQueue = new Array();
            tasks.workMultiple(finishWork);
        }
    }
}

function programStart() {
    var res1 = readlineSync.question('<1>Input URL : ');
    var newTasks = new MultipleTasks(cutRFLF(res1));
    var res2 = readlineSync.question('<2>Input Local Path : ');
    newTasks.setPath(cutRFLF(res2));
    var res3 = readlineSync.question('<3>Input Concurrency : ');
    newTasks.setMultipleNum(cutRFLF(res3));
    console.log('Initialization tasks to complete.');
    newTasks.workMultiple(finishWork);
}

programStart();
