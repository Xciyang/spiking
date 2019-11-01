/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
const main = require('electron').remote.require('../app/main');
const ipcRenderer = require('electron').ipcRenderer;

let tasks

function TasksContinue() {
    main.TasksContinue();
}

ipcRenderer.on('setContinue', (event, arg) => {
    document.getElementById('TasksContinue').style.display = '';
});

// ipcRenderer.on('displayReset', (event, arg) => {
//     document.getElementById('TasksContinue').style.display = '';
// });