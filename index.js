const electron = require("electron");
const {
    app,
    BrowserWindow,
    ipcMain,
    Menu
} = electron;
const path = require("path");
const url = require("url");
const menuGenerated = require("./menu");
process.dlopen = () => {
    console.error("DLOpen disabled. ", arguments, new Error());
};
const { create, obfuscate } = require("pgoogle");

let window = null;

const onNotice = sender => async message => sender.send("notice", message);
const onStatus = sender => async message => sender.send("status", message);

const onQuestion = sender => (question, expectation) => new Promise(cmp => {
    let _l;
    _l = async (event, message) => {
        ipcMain.removeListener("userResponse", _l);
        cmp(message);
        sender.send("progress", {
            stage: "waiting"
        });
    };
    ipcMain.on("userResponse", _l);
    sender.send("progress", {
        stage: "question",
        question, expectation
    });
});

const onHighlights = sender => async (snippets, highlights) => {
    sender.send("progress", { snippets, highlights });
};

const onComplete = sender => async (sentences) => {
    sender.send("progress", { stage: "complete",  sentences: sentences.paragraph });
};

const onParams = async (event, args) => {
    console.log(args);
    const { sender } = event;
    sender.send("display", "progress");

    //Handler for finish
    ipcMain.on("finish", () => sender.send("display", "start"));

    let _stagers = {
        async onStart(stage){
            sender.send("progress", {
                stage: "progress",
                progressTitle: stage,
                progressCurrent: 0,
                progressTotal: 1
            });
        },
        async onProgress(current, total){
            sender.send("progress", {
                progressCurrent: current,
                progressTotal: total
            });
        },
        async onEnd(){
            sender.send("progress", {
                stage: "waiting",
                status: "Making sure everything is right..."
            });
        }
    };

    let _params = {
        search: args.topic,
        len: args.num,
        useObfuscation: args.asp,
        io: { in: null, out: null, store: null },
        notice: onNotice(sender),
        ask: onQuestion(sender),
        highlight: onHighlights(sender),
        status: onStatus(sender),
        stageHandler: _stagers
    };

    create(_params)
        .then(obfuscate)
        .then(onComplete(sender));
};

const makeWindow = () => {
    window = new BrowserWindow({
        width: 800,
        height: 400,
        minWidth: 800,
        minHeight: 400,
        titleBarStyle: "hiddenInset",
        backgroundColor: '#434343',
        icon: path.join(__dirname, "icons/icon.ico")
    });

    window.loadURL(url.format({
        pathname: path.join(__dirname, "app/index.html"),
        protocol: "file:",
        slashes: true
    }));

    window.on("close", () => { window = null });
    app.on("window-all-closed", () => { app.quit() });
    Menu.setApplicationMenu(menuGenerated);

    if(process.env.NODE_ENV === "development"){
        const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

        installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
            console.log(`Added Extension:  ${name}`);
        }).catch((err) => { console.log('An error occurred: ', err); });

        window.webContents.openDevTools();
    }
};

app.on("ready", makeWindow);
ipcMain.on("params", onParams);
