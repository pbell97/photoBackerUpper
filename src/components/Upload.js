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

function UploadButtom(props) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    function toggleUploadModal() {
        setShowUploadModal(!showUploadModal);
    }

    return (
        <>
            <Button color="primary" size="lg" onClick={toggleUploadModal}>
                Upload
            </Button>
            <UploadModal isOpen={showUploadModal} toggle={toggleUploadModal} />
        </>
    );
}

function UploadModal(props) {
    function openBrowseDialog() {
        dialog.showOpenDialog({
            properties: ["openFile", "multiSelection"],
        });
    }

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle}>
            <ModalHeader>Upload File</ModalHeader>
            <ModalBody>
                <Button onClick={openBrowseDialog}>Browse</Button>
            </ModalBody>
        </Modal>
    );
}

export default UploadButtom;
