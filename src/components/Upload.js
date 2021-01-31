import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Footer.css";
import {
    Card,
    CardImg,
    CardText,
    CardBody,
    CardTitle,
    CardSubtitle,
    Button,
    Label,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
const electron = window.require("electron");
const dialog = electron.remote.dialog;
const path = require("path");
const AzureStorageHelper = require("../AzureHelper");

function FindFilesButton(props) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    function toggleUploadModal() {
        setShowUploadModal(!showUploadModal);
    }

    return (
        <>
            <Button color="primary" size="lg" onClick={toggleUploadModal}>
                Find Files
            </Button>
            <UploadModal isOpen={showUploadModal} toggle={toggleUploadModal} />
        </>
    );
}

function UploadModal(props) {
    const [files, setFiles] = useState([]);
    const [fileTags, setFileTags] = useState([]);

    function openBrowseDialog() {
        let selection = dialog.showOpenDialogSync({
            properties: ["openFile"],
        });
        if (selection) {
            let newFile = {
                name: path.basename(selection),
                path: selection[0],
            };
            let newFiles = [].concat(files);
            newFiles.push(newFile);
            setFiles(newFiles);

            let newFileTags = [].concat(fileTags);
            newFileTags.push(<p>{newFile.name}</p>);
            setFileTags(newFileTags);
        }
    }

    async function uploadFiles() {
        if (files.length == 0) {
            alert("Must select a file before uploading");
        } else {
            console.log("Should be uploading...");
            let AzHelp = new AzureStorageHelper();
            files.forEach((file) => {
                AzHelp.uploadFile(file.path, "patrick");
            });
            setFiles([]);
        }
    }

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle}>
            <ModalHeader>Upload File</ModalHeader>
            <ModalBody>
                {fileTags}
                <Button onClick={openBrowseDialog}>Browse</Button>
                <Button onClick={uploadFiles}>Upload</Button>
            </ModalBody>
        </Modal>
    );
}

export default FindFilesButton;
