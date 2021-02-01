import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/ImagePreview.css";
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import File from "../FileHandler";
const electron = window.require("electron");
const app = electron.remote.app;

function ImagePreview(props) {
    const [imgSrc, setImgSrc] = useState("");

    function convertThumbnailBufferToImgSrc() {
        if (props.file.thumbnailBuffer) {
            return "data:image/jpeg;base64," + props.file.thumbnailBuffer.toString("base64");
        } else {
            return "";
        }
    }

    async function downloadJPG() {
        let downloadsPath = app.getPath("downloads");
        let finishedPath = await props.file.downloadJPG(downloadsPath);
        console.log("Downloaded to " + finishedPath);
    }

    async function downloadCR2() {
        let downloadsPath = app.getPath("downloads");
        let finishedPath = await props.file.downloadCR2(downloadsPath);
        console.log("Downloaded to " + finishedPath);
    }

    useEffect(() => {
        setImgSrc(convertThumbnailBufferToImgSrc());
    }, [props.file]);

    return (
        <div className="imgPreview">
            <h5>{props.file.fileName}</h5>
            <img src={imgSrc}></img>
            {props.file && props.file.azureFilePath && (
                <Button color="primary" onClick={downloadJPG}>
                    JPG
                </Button>
            )}
            {props.file && props.file.azureRawFilePath && (
                <Button color="secondary" onClick={downloadCR2}>
                    CR2
                </Button>
            )}
        </div>
    );
}

export default ImagePreview;
