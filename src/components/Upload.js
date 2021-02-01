import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Upload.css";
import { Card, CardImg, CardText, CardBody, CardTitle, Spinner, Button, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import File from "../FileHandler";
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
            <UploadModal isOpen={showUploadModal} toggle={toggleUploadModal} loginDetails={props.loginDetails} triggerLoadFiles={props.triggerLoadFiles} />
        </>
    );
}

function UploadModal(props) {
    const [files, setFiles] = useState([]);
    const [fileTags, setFileTags] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUploadingFileName, setCurrentUploadingFileName] = useState("");

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
            for (const file of files) {
                let newFile = new File(props.loginDetails.username);
                newFile.setFilePath(file.path);
                console.log("Should be uploading " + file.name);
                setIsUploading(true);
                setCurrentUploadingFileName(file.name);
                await newFile.uploadFile();
                setIsUploading(false);
                setCurrentUploadingFileName("");
                console.log("Uploaded " + file.name);
            }
            setFiles([]);
            setFileTags([]);
            props.toggle();
            props.triggerLoadFiles();
        }
    }

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle}>
            <ModalHeader>Upload File</ModalHeader>
            <ModalBody className="modalBody">
                {fileTags}
                {isUploading && (
                    <div>
                        <Spinner color="primary" />
                        Uploading {currentUploadingFileName}...
                    </div>
                )}
                <Button onClick={openBrowseDialog} className="browseButton">
                    Browse
                </Button>
                <Button onClick={uploadFiles} className="uploadButton">
                    Upload
                </Button>
            </ModalBody>
        </Modal>
    );
}

export default FindFilesButton;
