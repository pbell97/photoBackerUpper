const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");

// Import with: const AzureStorageHelper = require('./AzureHelper')

module.exports = class AzureStorageHelper {
    constructor() {
        let config = require("./configVariables.json");
        this._connectionString = config.azureStorageConnectionString;
        this._containerName = config.containerName;
        this.blobServiceClient = BlobServiceClient.fromConnectionString(
            this._connectionString
        );
        this._blobNames = null;
    }

    async getBlobNames(refreshCache = false) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this._blobNames == null || refreshCache) {
                    this._blobNames = [];
                    const containerClient = this.blobServiceClient.getContainerClient(
                        this._containerName
                    );
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
                let blobName = folderName
                    ? `${folderName}/${prefix}_${newUUID}_${filename}`
                    : `${prefix}_${newUUID}_${filename}`;

                const containerClient = this.blobServiceClient.getContainerClient(
                    this._containerName
                );
                const blockBlobClient = containerClient.getBlockBlobClient(
                    blobName
                );
                await blockBlobClient.uploadFile(filepath);
                resolve();
            } catch (err) {
                console.log(err.message);
                reject();
            }
        });
    }

    async uploadFileWithoutUUID(filepath, folderName = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const filename = path.basename(filepath);
                let blobName = folderName
                    ? `${folderName}/${filename}`
                    : filename;

                const containerClient = this.blobServiceClient.getContainerClient(
                    this._containerName
                );
                const blockBlobClient = containerClient.getBlockBlobClient(
                    blobName
                );
                await blockBlobClient.uploadFile(filepath);
                resolve();
            } catch (err) {
                console.log(err.message);
                reject();
            }
        });
    }

    async downloadFile(blobName, folderPath) {
        return new Promise(async (resolve, reject) => {
            try {
                const containerClient = this.blobServiceClient.getContainerClient(
                    this._containerName
                );
                const blockBlobClient = containerClient.getBlockBlobClient(
                    blobName
                );
                const downloadBlockBlobResponse = await blockBlobClient.download(
                    0
                );
                let totalFileSize = downloadBlockBlobResponse.contentLength;

                let originalFileName = blobName.substr(
                    blobName.indexOf("_") + 38,
                    blobName.length
                );
                let fullFilePath = path.join(folderPath, originalFileName);

                await this._downloadFromStream(
                    downloadBlockBlobResponse.readableStreamBody,
                    fullFilePath
                );
                resolve(fullFilePath);
            } catch (err) {
                console.log(err.message);
                reject();
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
};
