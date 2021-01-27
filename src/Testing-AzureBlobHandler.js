const {
    BlobServiceClient,
    uploadStreamToBlockBlob,
    Aborter,
    BlobURL,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    SharedKeyCredential,
    StorageURL,
} = require("@azure/storage-blob");
const { v1: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
const ONE_MINUTE = 60 * 1000;

let config = require("./configVariables.json");

let connectionString = config.azureStorageConnectionString;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    connectionString
);

// Get a reference to a container
const containerName = "photobackerupper";
const containerClient = blobServiceClient.getContainerClient(containerName);

// List the blob(s) in the container.
async function listBlobs() {
    console.log("\nListing blobs...");
    for await (const blob of containerClient.listBlobsFlat()) {
        console.log("\t", blob.name);
    }
}

// Upload file source:
// https://github.com/Azure-Samples/azure-sdk-for-js-storage-blob-stream-nodejs/blob/master/v12/routes/index.js

async function uploadLocalFileViaStream(filename, filepath) {
    const newUUID = uuid();
    const blobName = `${newUUID}_${filename}`;
    const stream = fs.createReadStream(filepath);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        let result = await blockBlobClient.uploadStream(
            stream,
            uploadOptions.bufferSize,
            uploadOptions.maxBuffers,
            { blobHTTPHeaders: { blobContentType: "image/jpeg" } }
        );
        return result;
    } catch (err) {
        return null;
    }
}

async function uploadLocalFile(filename, filepath) {
    const newUUID = uuid();
    const blobName = `${newUUID}_${filename}`;
    const stream = fs.createReadStream(filepath);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    blockBlobClient.uploadFile(filepath);
}

let filename = "Sample7.png";
let filepath = "/Users/patrickbell/Desktop/Sample7.png";
uploadLocalFile(filename, filepath);

let blobnameToDownload = "9819b390-6030-11eb-825f-574a92b3cfce-Sample8.png";

// Reference: https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs
async function downloadBlob(blobName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    let totalFileSize = downloadBlockBlobResponse.contentLength;

    console.log("\nDownloaded blob content...");
    console.log(
        "\t",
        await downloadFromStream(
            downloadBlockBlobResponse.readableStreamBody,
            blobName
        )
    );
}

// downloadBlob(blobnameToDownload);
