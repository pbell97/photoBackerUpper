import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Footer.css";
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button, Label, Input } from "reactstrap";

function FooterStatusBar(props) {
    return (
        <div id="footer">
            <span className="footerLeft">{props.left != undefined && props.left}</span>
            <span className="footerRight">{props.right != undefined && props.right}</span>
        </div>
    );
}

export default FooterStatusBar;
