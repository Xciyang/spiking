/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
const ipcRenderer = require('electron').ipcRenderer;

var DowloadProgress = document.getElementById('DowloadProgress');
var DowloadImage = document.getElementById('DowloadImage');
var DowloadError = document.getElementById('DowloadError');
var DowloadTotal = document.getElementById('DowloadTotal');
var Progress = { a: 1, b: 1 };
var ImageNum = 0;
var ErrorNum = 0;

ipcRenderer.on('setProgress', (event, arg) => {
    Progress = arg;
});

ipcRenderer.on('setImageNum', (event, arg) => {
    ImageNum = arg;
});

ipcRenderer.on('setErrorNum', (event, arg) => {
    ErrorNum = arg;
});

var inv = setInterval(() => {
    DowloadImage.innerText = ImageNum;
    DowloadError.innerText = ErrorNum;
    DowloadProgress.innerText = Progress.a + ' / ' + Progress.b;
    DowloadProgress.style.width = (Progress.a / Progress.b) + '%';
    DowloadTotal.innerText = Progress.a + ' / ' + Progress.b;
}, 100);

