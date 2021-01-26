import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/LoginPage.css";
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

function LoginModal(props) {
    const [usernameText, setUsernameText] = useState("");

    function handleUsernameChange(event) {
        setUsernameText(event.target.value);
    }

    function handleLogin() {
        props.handleLogin(usernameText);
    }

    return (
        <div>
            <h1>Photo BackerUpper v1.0</h1>
            <Card id="loginCard">
                <Input
                    type="text"
                    name="username"
                    id="usernameInput"
                    placeholder="Enter Username"
                    onChange={handleUsernameChange}
                />
                <Button onClick={handleLogin}>Login</Button>
            </Card>
        </div>
    );
}
export default LoginModal;
