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
} from "reactstrap";

function FooterStatusBar(props) {
    return (
        <div id="footer">
            <span className="footerLeft">This is a left footer status</span>
            <span className="footerRight">This is a right footer status</span>
        </div>
    );
}

export default FooterStatusBar;
