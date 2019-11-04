/*
Copyright © 2019 Ciyang. All rights reserved. 
*/
// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')
// const path = require('path')
const { MultipleTasks } = require('./MultipleTasks')
const { DynamicMultipleTasks } = require('./DynamicMultipleTasks')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tasks

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  // and load the index.html of the app.

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    if (tasks) tasks.stop = 1;
  })

  mainWindow.loadFile('views/index.html')

  Menu.setApplicationMenu(null);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function TasksFinish() {
  if (tasks && tasks.errorQueue.length) {
    tasks.waitQueue = tasks.errorQueue;
    tasks.errorQueue = new Array();
  }
  mainWindow.loadFile('views/waiting.html').then(() => {
    mainWindow.webContents.send('setRetry', tasks.waitQueue.length);
  });
}

exports.TasksContinue = () => {
  mainWindow.loadFile('views/starting.html').then(() => {
    tasks.workMultiple(TasksFinish);
  });
}

exports.TasksReturn = () => {
  mainWindow.loadFile('views/index.html').then(() => {
    tasks = 0;
    mainWindow.setProgressBar(-1);
  });
}

/**
 * data:{url,path,concurrency,proxy}
*/
exports.MultipleStart = (data) => {
  if (tasks) {
    mainWindow.webContents.send('setError', 'Already starting.');
    return;
  }
  try {
    tasks = new MultipleTasks(data.url);
    tasks.setMainWindow(mainWindow);
    tasks.setPath(data.path);
    tasks.setMultipleNum(data.concurrency);
    tasks.setProxy(data.proxy);
    mainWindow.loadFile('views/starting.html').then(() => {
      tasks.workMultiple(TasksFinish);
    });
  } catch (err) {
    tasks = 0;
    mainWindow.webContents.send('setError', err.message);
  }
}
/**
 *data:{url,path,concurrency,chrome,display,login}
*/
exports.DynamicStart = (data) => {
  if (tasks) {
    mainWindow.webContents.send('setError', 'Already starting.');
    return;
  }
  try {
    tasks = new DynamicMultipleTasks(data.url);
    tasks.setMainWindow(mainWindow);
    tasks.setPath(data.path);
    tasks.setMultipleNum(data.concurrency);
    tasks.setProxy(data.proxy);
    tasks.setChromePath(data.chrome);
    tasks.setDisplay(data.display);
    if (data.login) {
      mainWindow.loadFile('views/waiting.html').then(() => {
        tasks.openBrowser().then(() => {
          tasks.loadDynamically(tasks.firstUrl.href).then(() => {
            mainWindow.webContents.send('setContinue');
          }).catch(err => {
            tasks = 0;
            mainWindow.loadFile('views/index.html');
            mainWindow.webContents.send('setError', err.message);
          });
        }).catch(err => {
          tasks = 0;
          mainWindow.loadFile('views/index.html');
          mainWindow.webContents.send('setError', err.message);
        });
      });
    } else {
      mainWindow.loadFile('views/starting.html').then(() => {
        mt.workMultiple(TasksFinish);
      })
    }
  } catch (err) {
    tasks = 0;
    mainWindow.webContents.send('setError', err.message);
  }
}
