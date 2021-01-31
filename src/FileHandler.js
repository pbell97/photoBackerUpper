const AzureStorageHelper = require("./AzureHelper");
const ThumbnailHelper = require("./ThumbnailHelper");
const { v1: uuid } = window.require("uuid");
const fs = window.require("fs");
const path = window.require("path");

module.exports = class File {
    constructor(username, folder = "") {
        this.username = username;
        this.folder = folder;

        this.fileName = null;
        this.filePath = null;
        this.azureFilePath = null;
        this.fileBuffer = null;

        this.rawFileName = null;
        this.rawFilePath = null;
        this.azureRawFilePath = null;
        this.rawFileBuffer = null;

        this.azureThumbnailFilePath = null;
        this.thumbnailBuffer = null;
    }

    setFilePath(filePath, findRaw = true) {
        this.fileName = path.basename(filePath);
        this.filePath = filePath;
        this.azureFilePath = path.join(this.username, this.folder, this.fileName);

        if (findRaw) {
            this.rawFilePath = this.findRaw(filePath);
            this.rawFileName = this.rawFilePath ? this.fileName.substr(0, this.fileName.length - 3) + "CR2" : null;
            this.azureRawFilePath = this.rawFilePath ? path.join(this.username, this.folder, this.rawFileName) : null;
        }
    }

    findRaw(filePath) {
        let directory = path.dirname(filePath);
        let rawPath = null;
        fs.readdirSync(directory).forEach((file) => {
            if (file == this.fileName.substr(0, this.fileName.length - 3) + "CR2") {
                rawPath = path.join(directory, file);
            }
        });
        return rawPath;
    }

    setAzureFilePath(azureFilePath) {
        if (azureFilePath.includes("CR2")) {
            this.azureRawFilePath = azureFilePath;
        } else if (azureFilePath.includes("-thumbnail")) {
            this.azureThumbnailFilePath = azureFilePath;
        } else {
            this.azureFilePath = azureFilePath;
            this.fileName = path.basename(azureFilePath);
            this.folder = this.parseFolder(azureFilePath);
        }
    }

    parseFolder(azureFilePath) {
        let dir = path.dirname(azureFilePath);
        return dir != "." ? dir : "";
    }

    async uploadFile() {
        let azHelper = new AzureStorageHelper();
        let thumbnailName = "";

        // Attempts to make a thumbnail
        try {
            this.thumbnailBuffer = await ThumbnailHelper.ThumbnailHelper.makeThumbnailFileToBuffer(this.filePath, 200);
            thumbnailName = this.fileName.substr(0, this.fileName.indexOf(".")) + "-thumbnail" + this.fileName.substr(this.fileName.indexOf("."));
        } catch (err) {
            console.log(`Unable to make thumbnail for ${this.filePath}`);
        }
        // Uploads file
        let azureFolderPath = path.join(this.username, this.folder);
        await azHelper.uploadFileWithoutUUID(this.filePath, azureFolderPath);

        // Uploads thumbnail and raw file if available
        if (this.thumbnailBuffer != null) {
            await azHelper.uploadBuffer(this.thumbnailBuffer, thumbnailName, azureFolderPath);
        }
        if (this.rawFilePath) {
            await azHelper.uploadFileWithoutUUID(this.rawFilePath, azureFolderPath);
        }
    }

    async loadThumbnail() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.azureThumbnailFilePath == null) {
                    reject();
                }
                if (this.thumbnailBuffer != null) {
                    resolve(buffer);
                }
                let azHelper = new AzureStorageHelper();
                var buffer = await azHelper.downloadBuffer(this.azureThumbnailFilePath);
                this.thumbnailBuffer = buffer;
                resolve(buffer);
            } catch (err) {
                reject(err);
            }
        });
    }
    // Load from azure (load filenames and azure paths, not necessarily thumbnails automatically)
};

// let pp = "/Users/patrickbell/Desktop/dogPics/Ellie Pics/IMG_0241.JPG";
// let rp = "/Users/patrickbell/Desktop/dogPics/Ellie Pics/IMG_0241.CR2";
// ImageHandler.uploadImageAndRaw(pp, rp);

function getRootFileName(filename) {
    filename = filename.substr(0, filename.indexOf("."));
    if (filename.includes("-thumbnail")) {
        filename = filename.substr(0, filename.indexOf("-thumbnail"));
    }
    return filename;
}

async function loadAllFiles() {
    let azh = new AzureStorageHelper();
    let filenames = await azh.getBlobNames();
    let files = {};
    let username = "Patrick";
    filenames.forEach((file) => {
        let rootname = getRootFileName(file);
        if (!Object.keys(files).includes(rootname)) {
            files[rootname] = new File(username);
        }
        files[rootname].setAzureFilePath(file);
    });
    console.log(files);
}
// loadAllFiles();

async function uploadFiles() {
    let pp = "/Users/patrickbell/Desktop/dogPics/Ellie Pics/IMG_0244.JPG";
    let newFile = new File("Patrick");
    newFile.setFilePath(pp);
    await newFile.uploadFile();
}
// uploadFiles();
