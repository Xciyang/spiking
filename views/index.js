/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
const remote = require('electron').remote;
const main = remote.require('../app/main');
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const dialog = remote.dialog;

const ipcRenderer = require('electron').ipcRenderer;

(function initMenu() {
    const menu = new Menu();
    menu.append(new MenuItem({ label: 'Paste(Ctrl + V)', role: 'paste' }));
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (isEleEditable(e.target)) menu.popup(remote.getCurrentWindow());
    }, false);
})();

function isEleEditable(e) {
    if (!e) {
        return false;
    }
    if (e.tagName == 'INPUT' || e.contentEditable == 'true') {
        return true;
    } else {
        return isEleEditable(e.parentNode)
    }
}

document.getElementById('MultipleRadio').onclick = function () {
    document.getElementById('ErrorMessage').style.display = 'none';
    document.getElementById('DynamicContainer').style.display = 'none';
    document.getElementById('MultipleContainer').style.display = '';
}

document.getElementById('DynamicRadio').onclick = function () {
    document.getElementById('ErrorMessage').style.display = 'none';
    document.getElementById('MultipleContainer').style.display = 'none';
    document.getElementById('DynamicContainer').style.display = '';
}

function setError(st) {
    var em = document.getElementById('ErrorMessage');
    em.style.display = '';
    em.innerText = st;
    var b = document.createElement('button');
    b.innerText = '×';
    b.className = 'btn';
    b.style.marginLeft = '95%';
    b.onclick = function () {
        em.style.display = 'none';
    }
    em.innerText = st;
    em.appendChild(b);
}

document.getElementById('MultipleButton').onclick = function () {
    try {
        var url = document.getElementById('basic-url').value;
        if (!url) throw new Error('Please Input URL.');
        var lpath = (document.getElementById('basic-path-button').innerText != 'Choose Local Path') && document.getElementById('basic-path-button').innerText;
        if (!lpath) throw new Error('Please Choose Local Path.');
        var concurrency = parseInt(document.getElementById('basic-concurrency').value) || 0;
        if (!concurrency || concurrency <= 0) throw new Error('Please Input Right Concurrency.')
        var lproxy = document.getElementById('basic-proxy').value;
        main.MultipleStart({
            url: url,
            path: lpath,
            concurrency: concurrency,
            proxy: lproxy
        });
    } catch (e) {
        setError(e.message);
        scrollTo(0, 0);
    }
}

document.getElementById('DynamicButton').onclick = function () {
    try {
        var url = document.getElementById('basic-url').value;
        if (!url) throw new Error('Please Input URL.');
        var lpath = (document.getElementById('basic-path-button').innerText != 'Choose Local Path') && document.getElementById('basic-path-button').innerText;
        if (!lpath) throw new Error('Please Choose Local Path.');
        var concurrency = parseInt(document.getElementById('basic-concurrency').value) || 0;
        if (!concurrency || concurrency <= 0) throw new Error('Please Input Right Concurrency.')
        var lproxy = document.getElementById('basic-proxy').value;
        var lchrome = document.getElementById('basic-chrome').files[0] && document.getElementById('basic-chrome').files[0].path;
        if (!lchrome) throw new Error('Please Choose Chrome Path.');
        var ldisplay = document.getElementById('basic-display').checked;
        var llogin = document.getElementById('basic-login').checked;
        if (llogin && !ldisplay) throw new Error('Please Display First.');
        main.DynamicStart({
            url: url,
            path: lpath,
            concurrency: concurrency,
            proxy: lproxy,
            chrome: lchrome,
            display: ldisplay,
            login: llogin
        });
    } catch (e) {
        setError(e.message);
        scrollTo(0, 0);
    }

}

ipcRenderer.on('setError', (event, arg) => {
    setError(arg);
});

document.getElementById('basic-path-button').addEventListener("click", function () {
    dialog.showOpenDialog({
        properties: [
            'openDirectory',
        ],
        filters: [
            { name: 'All', extensions: ['*'] },
        ]
    }).then(res => {
        if (res.filePaths[0]) {
            document.getElementById('basic-path-button').innerText = res.filePaths[0];
        }
    })
});