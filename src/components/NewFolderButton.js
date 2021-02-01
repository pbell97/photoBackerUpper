import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Upload.css";
import { Card, CardImg, CardText, CardBody, CardTitle, Spinner, Button, Label, Input, InputGroup, InputGroupText, InputGroupAddon, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import File from "../FileHandler";
const electron = window.require("electron");
const dialog = electron.remote.dialog;
const path = require("path");
const AzureStorageHelper = require("../AzureHelper");

function NewFolderButton(props) {
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    function toggleModal() {
        setShowNewFolderModal(!showNewFolderModal);
    }

    return (
        <>
            <Button color="primary" size="lg" onClick={toggleModal}>
                New Folder
            </Button>
            <NewFolderCreationModal isOpen={showNewFolderModal} toggle={toggleModal} addFolder={props.addFolder} />
        </>
    );
}

function NewFolderCreationModal(props) {
    const [folderName, setFolderName] = useState("");

    function handleFolderNameChange(event) {
        setFolderName(event.target.value);
        console.log(event.target.value);
    }

    function createFolder() {
        let newFolderName = folderName.split(" ").join("_");
        props.addFolder(newFolderName);
        props.toggle();
    }

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle}>
            <ModalHeader>Create New Folder</ModalHeader>
            <ModalBody className="modalBody">
                New folders are only temporary unless a file is uploaded within them
                <br />
                <br />
                No spaces - Please use underscores instead
                <br />
                <br />
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        <InputGroupText>Folder Name</InputGroupText>
                    </InputGroupAddon>
                    <Input onChange={handleFolderNameChange} />
                </InputGroup>
                <br />
                <br />
                <Button onClick={createFolder}>Create Folder</Button>
            </ModalBody>
        </Modal>
    );
}

export default NewFolderButton;
