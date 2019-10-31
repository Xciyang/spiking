/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
const ipcRenderer = require('electron').ipcRenderer;

var DowloadProgress = document.getElementById('DowloadProgress');
var DowloadImage = document.getElementById('DowloadImage');
var DowloadError = document.getElementById('DowloadError');

ipcRenderer.on('setProgress', (event, arg) => {
    DowloadProgress.innerText = arg.a + ' / ' + arg.b;
    DowloadProgress.style.width = arg.a / arg.b + '%';
});
ipcRenderer.on('setImageNum', (event, arg) => {
    DowloadImage.innerText = arg;
});
ipcRenderer.on('setErrorNum', (event, arg) => {
    DowloadError.innerText = arg;
});