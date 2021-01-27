import logo from "./logo.svg";
import "./App.css";
import LoginModal from "./components/LoginPage";
import FooterStatusBar from "./components/Footer";
import UploadButtom from "./components/Upload";
import { useState } from "react";

let config = require("./configVariables.json");

function App() {
    const [loginDetails, setLoginDetails] = useState({ username: "" });
    const [view, setView] = useState("login");

    function handleLogin(username) {
        setLoginDetails({ ...loginDetails, username: username });
        setView("homepage");
    }

    return (
        <div className="App">
            <header className="App-header">
                {view == "login" && <LoginModal handleLogin={handleLogin} />}
                {view == "homepage" && (
                    <div>
                        <h1>Homepage</h1>
                        <p>Hello {loginDetails.username}</p>
                        <UploadButtom />
                    </div>
                )}
                <FooterStatusBar />
            </header>
        </div>
    );
}

export default App;
