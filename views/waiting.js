/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
const main = require('electron').remote.require('../app/main');
const ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('setContinue', (event, arg) => {
    document.getElementById('TasksContinue').style.display = '';
});

ipcRenderer.on('setRetry', (event, arg) => {
    document.getElementById('TasksRetry').style.display = '';
    document.getElementById('ErrorNum').innerText = arg;
});

document.getElementById('ContinueButton').onclick = function () {
    main.TasksContinue();
}

document.getElementById('RetryButton').onclick = function () {
    main.TasksContinue();
}

document.getElementById('ReturnButton').onclick = function () {
    main.TasksReturn();
}