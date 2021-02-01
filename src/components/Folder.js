import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/ImagePreview.css";
import "./css/Folder.css";
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import File from "../FileHandler";
const electron = window.require("electron");
const app = electron.remote.app;

function Folder(props) {
    return (
        <div className="imgPreview">
            <h5>{props.folderName}</h5>
            <img className="folderIcon" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/OneDrive_Folder_Icon.svg/1200px-OneDrive_Folder_Icon.svg.png"></img>
        </div>
    );
}

export default Folder;
