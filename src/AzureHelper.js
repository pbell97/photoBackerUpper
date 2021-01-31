const { BlobServiceClient, BlockBlobTier } = window.require("@azure/storage-blob");
const { v1: uuid } = window.require("uuid");
const fs = window.require("fs");
const path = require("path");
var Readable = window.require("stream").Readable;

// Import with: const AzureStorageHelper = require('./AzureHelper')
// On the storage account's settings, need to create a Shared Access Signature AND allow CORS
// Make sure SAS token has 'object' service checked

module.exports = class AzureStorageHelper {
    constructor() {
        let config = require("./configVariables.json");
        this._connectionString = config.azureStorageConnectionString;
        this._containerName = config.containerName;
        this.blobServiceClient = new BlobServiceClient(config.bloblSASUrl);
        this._blobNames = null;
    }

    async getBlobNames(refreshCache = false) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this._blobNames == null || refreshCache) {
                    this._blobNames = [];
                    const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
                    for await (const blob of containerClient.listBlobsFlat()) {
                        this._blobNames.push(blob.name);
                    }
                }
                resolve(this._blobNames);
            } catch {
                reject(null);
            }
        });
    }

    async uploadFile(filepath, prefix, folderName = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = path.basename(filepath);
                const newUUID = uuid();
                let blobName = folderName ? `${folderName}/${prefix}_${newUUID}_${filename}` : `${prefix}_${newUUID}_${filename}`;

                const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                await blockBlobClient.uploadFile(filepath);
                resolve();
            } catch (err) {
                console.log(err.message);
                reject();
            }
        });
    }

    async uploadFileWithoutUUID(filepath, folderName = "") {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = path.basename(filepath);
                let blobName = path.join(folderName, filename);

                const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                if (filename.includes(".CR2")) {
                    let options = { tier: BlockBlobTier.Cool };
                    let response = await blockBlobClient.uploadFile(filepath, options);
                } else {
                    await blockBlobClient.uploadFile(filepath);
                }

                resolve();
            } catch (err) {
                console.log(err.message);
                reject();
            }
        });
    }

    async uploadBuffer(buffer, filename, folderName = "", bytesCallback = null) {
        return new Promise(async (resolve, reject) => {
            try {
                // Converts stream to buffer
                var stream = new Readable();
                stream.push(buffer);
                stream.push(null);

                // If no callback, make an empty function
                bytesCallback = bytesCallback ? bytesCallback : () => {};

                // Gets folder name and sets upload options
                const blobName = path.join(folderName, filename);

                const ONE_MEGABYTE = 1024 * 1024;
                const uploadOptions = {
                    bufferSize: 4 * ONE_MEGABYTE,
                    maxBuffers: 20,
                };
                const fileType = "image/jpeg";

                // Connects to container and creates blobl
                const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                try {
                    let result = await blockBlobClient.uploadStream(stream, uploadOptions.bufferSize, uploadOptions.maxBuffers, {
                        blobHTTPHeaders: {
                            blobContentType: fileType,
                        },
                        onProgress: (ev) => bytesCallback(ev.loadedBytes),
                    });
                    resolve(result);
                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    async downloadFile(blobName, folderPath) {
        return new Promise(async (resolve, reject) => {
            try {
                const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                const downloadBlockBlobResponse = await blockBlobClient.download(0);
                let totalFileSize = downloadBlockBlobResponse.contentLength;

                let originalFileName = blobName.substr(blobName.indexOf("_") + 38, blobName.length);
                let fullFilePath = path.join(folderPath, originalFileName);

                await this._downloadFromStream(downloadBlockBlobResponse.readableStreamBody, fullFilePath);
                resolve(fullFilePath);
            } catch (err) {
                console.log(err.message);
                reject();
            }
        });
    }

    async downloadBuffer(blobName) {
        return new Promise(async (resolve, reject) => {
            try {
                const containerClient = this.blobServiceClient.getContainerClient(this._containerName);
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                const downloadBlockBlobResponse = await blockBlobClient.download(0);

                let buffer = await this._downloadFromBuffer(downloadBlockBlobResponse.readableStreamBody);
                resolve(buffer);
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    }

    async _downloadFromStream(readableStream, filepath) {
        return new Promise((resolve, reject) => {
            let writeObj = fs.createWriteStream(filepath);
            // const chunks = [];
            readableStream.on("data", (data) => {
                let lengthOfData = data.length;
                writeObj.write(data);
            });
            readableStream.on("end", () => {
                writeObj.close();
            });
            readableStream.on("error", reject);
        });
    }

    async _downloadFromBuffer(readableStream) {
        return new Promise((resolve, reject) => {
            try {
                let buffer = Buffer.from([]);
                readableStream.on("data", (data) => {
                    buffer = Buffer.concat([buffer, Buffer.from(data)], buffer.length + data.length); //Add the data read to the existing buffer.
                });
                readableStream.on("end", () => {
                    resolve(buffer);
                });
                readableStream.on("error", reject);
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    }
};
