import logo from "./logo.svg";
import "./App.css";
import LoginModal from "./components/LoginPage";
import FooterStatusBar from "./components/Footer";
import FindFilesButton from "./components/Upload";
import { useEffect, useState } from "react";
import File from "./FileHandler";
import AzureStorageHelper from "./AzureHelper";

let config = require("./configVariables.json");

function App() {
    const [loginDetails, setLoginDetails] = useState({ username: "" });
    const [view, setView] = useState("login");
    const [userFiles, setUserFiles] = useState([]);

    function handleLogin(username) {
        setLoginDetails({ ...loginDetails, username: username });
        setView("homepage");
    }

    function getRootFileName(filename) {
        filename = filename.substr(0, filename.indexOf("."));
        if (filename.includes("-thumbnail")) {
            filename = filename.substr(0, filename.indexOf("-thumbnail"));
        }
        return filename;
    }

    async function loadAllFiles() {
        try {
            let azh = new AzureStorageHelper();
            let filenames = await azh.getBlobNames();
            let files = {};
            let username = loginDetails.username;
            await filenames.forEach(async (file) => {
                let rootname = getRootFileName(file);
                if (!Object.keys(files).includes(rootname)) {
                    files[rootname] = new File(username);
                }
                files[rootname].setAzureFilePath(file);
                await files[rootname].loadThumbnail();
                console.log("Done with " + rootname);
            });
            if (Object.keys(files).length > 0) {
                console.log("loading Thumbnail");
                var firstFileName = Object.keys(files)[0];
                var file = files[firstFileName];
                let buffer = await file.loadThumbnail();
                // var imageElem = document.getElementById("mainImg");
                // imageElem.src = "data:image/jpeg;base64," + buffer.toString("base64");
            }

            console.log(files);
            setUserFiles(files);
        } catch (err) {
            console.log(err);
        }
    }

    function convertThumbnailBufferToImgSrc(buffer) {
        return "data:image/jpeg;base64," + buffer.toString("base64");
    }

    useEffect(() => {
        if (loginDetails.username != "") {
            loadAllFiles();
        }
    }, [loginDetails]);

    return (
        <div className="App">
            <header className="App-header">
                {view == "login" && <LoginModal handleLogin={handleLogin} />}
                {view == "homepage" && (
                    <div>
                        <h1>Homepage</h1>
                        <p>Hello {loginDetails.username}</p>
                        <FindFilesButton />
                        {Object.keys(userFiles).map((filename) => {
                            var file = userFiles[filename];
                            if (file.thumbnailBuffer) {
                                return <img src={convertThumbnailBufferToImgSrc(file.thumbnailBuffer)} />;
                            } else {
                                return <img />;
                            }
                        })}
                    </div>
                )}
                <FooterStatusBar />
            </header>
        </div>
    );
}

export default App;
