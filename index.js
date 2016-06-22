'use strict';
const {app, Menu} = require('electron');
const template = require('./scripts/menu');
const mainWindow = require('./app/main');

// require('crash-reporter').start({
// 	productName: 'macPq',
// 	companyName: 'lanzz.org',
// 	submitURL: 'http://macpq.lanzz.org/crash'
// });

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate-with-no-open-windows', () => {
	mainWindow.open();
});

app.on('ready', () => {
	var menu = Menu.buildFromTemplate(template);
	if (menu) {
		Menu.setApplicationMenu(menu);
		menu = null;
	}

	mainWindow.open();

	if (process.env.DEV) {
		const watcher = require('./scripts/watcher.js');
		watcher.watch(app, ['./index.js', './scripts', './app']);
	}
});
