const {BrowserWindow, dialog} = require('electron');

let mainWindow;

function onClosed() {
	mainWindow = null;
}

function open() {
    if (mainWindow) {
        return mainWindow;
    }
	var opts = {
		width: 800,
		height: 600,
		'accept-first-mouse': true,
		'title-bar-style': 'hidden'
	};

	const win = new BrowserWindow(opts);
	win.maximize();
	if (process.env.DEV) {
		win.loadURL('http://localhost:8000/app/main/view.dev.html');
		win.openDevTools({mode: 'undocked'});
	} else {
		win.loadURL(`file://${__dirname}/app/main/view.html`);
	}
	win.on('closed', onClosed);

    mainWindow = win;
	return win;
}

function showMessageBox(options) {
	if (!('buttons' in options)) {
		options.buttons = ['OK'];
	}
	if (mainWindow) {
		dialog.showMessageBox(mainWindow, options);
	} else {
		dialog.showMessageBox(options);
	}
}

module.exports = {
    open: open,
	showMessageBox: showMessageBox,
};