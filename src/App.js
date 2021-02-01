import logo from "./logo.svg";
import "./components/css/App.css";
import LoginModal from "./components/LoginPage";
import FooterStatusBar from "./components/Footer";
import FindFilesButton from "./components/Upload";
import ImagePreview from "./components/ImagePreview";
import { useEffect, useState } from "react";
import File from "./FileHandler";
import AzureStorageHelper from "./AzureHelper";
import NewFolderButton from "./components/NewFolderButton";
import Folder from "./components/Folder";
const path = window.require("path");

let config = require("./configVariables.json");

function App() {
    const [loginDetails, setLoginDetails] = useState({ username: "" });
    const [view, setView] = useState("login");
    const [userFiles, setUserFiles] = useState([]);
    const [loadFilesIndicator, setLoadFilesIndicator] = useState(false);
    const [currentDirectory, setCurrentDirectory] = useState("");
    const [folders, setFolders] = useState([]);

    function handleLogin(username) {
        setLoginDetails({ ...loginDetails, username: username });
        setView("homepage");
        console.log("Running handleLogin");
    }

    async function loadAllFiles() {
        function getRootFileName(filename) {
            filename = filename.substr(0, filename.indexOf("."));
            if (filename.includes("-thumbnail")) {
                filename = filename.substr(0, filename.indexOf("-thumbnail"));
            }
            return filename;
        }

        try {
            let azh = new AzureStorageHelper();
            let filenames = await azh.getBlobNames();
            let files = {};
            let username = loginDetails.username;
            await filenames.forEach((file) => {
                let rootname = getRootFileName(file);
                const allowedFileTypes = [".png", ".jpg", ".jpeg", ".cr2"];
                let fileType = path.extname(file);
                if (allowedFileTypes.includes(fileType.toLowerCase())) {
                    if (!Object.keys(files).includes(rootname)) {
                        files[rootname] = new File(username);
                    }
                    files[rootname].setAzureFilePath(file);
                }
            });

            // ForEach doesn't work well with async/await, use for...of instead
            for (const rootname of Object.keys(files)) {
                let response = await files[rootname].loadThumbnail();
            }

            console.log(files);
            setUserFiles(files);
        } catch (err) {
            console.log(err);
        }
    }

    function triggerLoadFiles() {
        console.log("Triggering loadFiles()");
        setLoadFilesIndicator(!loadFilesIndicator);
    }

    function addFolder(folderName) {
        let newFolders = folders.concat(folderName);
        setFolders(newFolders);
    }

    useEffect(() => {
        if (loginDetails.username != "") {
            console.log("Running useEffect->loadAllFiles");
            loadAllFiles();
        }
    }, [loginDetails, loadFilesIndicator]);

    useEffect(() => {
        if (loginDetails.username) {
            setCurrentDirectory("/" + loginDetails.username + "/");
        } else {
            setCurrentDirectory("/");
        }
    });

    return (
        <div className="App">
            <header className="App-header">
                {view == "login" && <LoginModal handleLogin={handleLogin} />}
                {view == "homepage" && (
                    <div>
                        <div className="header">
                            <h1>Homepage</h1>
                            <p>Hello {loginDetails.username}</p>
                            <NewFolderButton addFolder={addFolder} />
                            <FindFilesButton loginDetails={loginDetails} triggerLoadFiles={triggerLoadFiles} />
                        </div>
                        <div className="imagesContainer">
                            {Object.keys(userFiles).map((filename) => {
                                var file = userFiles[filename];
                                if (file.thumbnailBuffer) {
                                    return <ImagePreview file={file} />;
                                } else {
                                    return <img />;
                                }
                            })}
                            {folders.map((folderName) => {
                                return <Folder folderName={folderName} />;
                            })}
                        </div>
                    </div>
                )}
                <FooterStatusBar right={currentDirectory} />
            </header>
        </div>
    );
}

export default App;
