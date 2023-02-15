const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const resizeImage = require("resize-img");
const fs = require("fs");
const os = require("os");

// ===========================<<<<<!!!IMPORTANT!!!>>>>>==========================

// 1. DO NOT ENABLE NODE INTEGRATION
// 2. ENABLE CONTEXT ISOLATION
// 3. DEFINE CONTENT SECURITY POLICY IN HTML
// 4. VALIDATE USER INPUT
// 5. png to ico - icon for electron app, nsis installer for windows,license file.md,
// 6. webpreferences: devtools:false,

// ==============================================================================

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let win;

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1366,
    height: 768,
    resizable: isDevelopment,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, "index.html"));

  win.on("ready-to-show", () => {
    win.show();
  });

  // Open the DevTools.
  if (isDevelopment) {
    win.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

let aboutWin;

const createAboutWin = () => {
  aboutWin = new BrowserWindow({
    width: 350,
    height: 350,
    title: "About Electron",
    resizable: isDevelopment,
    webPreferences: {
      //  preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  aboutWin.loadFile(path.join(__dirname, "about.html"));

  aboutWin.on("ready-to-show", () => {
    aboutWin.show();
  });
};

app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

process.env.NODE_ENV = "development";

const isDevelopment = process.env.NODE_ENV !== "production";

const menu = [
  {
    label: app.name,
    submenu: [
      {
        label: "About",
        accelerator: "Ctrl + B",
        click: createAboutWin,
      },
    ],
  },
  {
    role: "fileMenu",
  },
];

const mainMenu = Menu.buildFromTemplate(menu);
Menu.setApplicationMenu(mainMenu);

const resizeImg = async ({ imgPath, height, width, dest }) => {
  try {
    const newPath = await resizeImage(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    const fileName = path.basename(imgPath);

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.writeFileSync(path.join(dest, fileName), newPath);

    win.webContents.send("image-done");

    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
};

ipcMain.on("resize-image", (e, parameters) => {
  parameters.dest = path.join(os.homedir(), "imageresizer");
  resizeImg(parameters);
});
