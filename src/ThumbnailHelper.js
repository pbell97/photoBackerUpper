const imageThumbnail = window.require("image-thumbnail");
const fs = window.require("fs");

module.exports.ThumbnailHelper = {
    makeThumbnailFileToBuffer: async function (inputFilepath, width = 200) {
        return new Promise(async (resolve, reject) => {
            try {
                let options = {
                    width: width,
                    responseType: "buffer",
                };
                const thumbnail = await imageThumbnail(inputFilepath, options);
                resolve(thumbnail);
            } catch (err) {
                reject(err);
            }
        });
    },

    makeThumbnailFileToFile: async function (inputFilepath, outputFilepath, width = 200) {
        return new Promise(async (resolve, reject) => {
            try {
                const thumbnailBuffer = await this.makeThumbnailFileToBuffer(inputFilepath, width);
                fs.writeFile(outputFilepath, thumbnailBuffer, () => {});
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },

    makeThumbnailBufferToBuffer: async function (buffer, width = 200) {
        new Promise(async (resolve, reject) => {
            try {
                let options = {
                    width: width,
                    responseType: "buffer",
                };
                const thumbnail = await imageThumbnail(buffer, options);
                resolve(thumbnail);
            } catch (err) {
                reject(err);
            }
        });
    },

    makeThumbnailBufferToFile: async function (buffer, outputFilepath, width = 200) {
        new Promise(async (resolve, reject) => {
            try {
                const thumbnailBuffer = await this.makeThumbnailBufferToBuffer(buffer, width);
                fs.writeFile(outputFilepath, thumbnailBuffer, () => {});
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },
};
