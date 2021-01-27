const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");

let mainWindow;

// THIS fixed electron modules in react: https://stackoverflow.com/questions/37884130/electron-remote-is-undefined

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: true, // Needed to access electron modules in react
            enableRemoteModule: true, // Needed to access electron modules in react
        },
    });
    const startURL = isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`;

    mainWindow.loadURL(startURL);

    mainWindow.once("ready-to-show", () => mainWindow.show());
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
app.on("ready", createWindow);
