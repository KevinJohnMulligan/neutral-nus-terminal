import React, {useState} from 'react';
const fs = require('fs')
 
const FileHandler = (props) => {  
    const [selectedFile, setSelectedFile] = useState(null)
    
    function isFileNull(){
        if(selectedFile===null){
            const errmsg = "No file selected"
            props.addConsoleText(errmsg)
            console.error(errmsg)
            return true
        }
        return false
    }

    function sendFromFile(){
        if(isFileNull()){
            return
        }
        const ext = ((selectedFile.path).match('[^.]+$')[0]).toLowerCase()
        
        const bufferType = (ext === 'txt')? 'utf8' : 'Base64'
        
        fs.readFile(selectedFile.path, bufferType, (err, data) => {
            if (err) {
              console.error(err)
              return
            }
            props.send(data)
            console.log(data)
          })
    }

    function logToFile(){
        if(isFileNull()){
            return
        }

        fs.appendFile(selectedFile.path, props.consoleText, function (err) {
            if (err) return console.log(err);
            console.log(`${props.consoleText} written to ${selectedFile.path}`);
          });
    }

    return (
        <div className={"input-box-file"}>

            <div className="input-box-row">
 
                <div className="file has-name is-right is-info is-small">
                <label className="file-label">
                    <input 
                        className="file-input" 
                        type="file" 
                        name="fileName"
                        multiple={false}
                        accept=".txt, .bin, .hex"
                        onChange={(e)=>{setSelectedFile(e.target.files[0])}}
                    />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            Choose a file…
                        </span>
                        <span className="file-name">
                            {(selectedFile!==null && selectedFile.name!==null)? selectedFile.name : "No file selected"}
                        </span>
                    </span>
                </label>
            </div>
                
                <button 
                    name="sendFromFileButton"
                    className="button is-info is-small"
                    onClick={sendFromFile}
                    >
                    Send from file
                </button>
            </div>

            <div className="input-box-row">
            <div className={`file has-name is-right is-small ${(selectedFile!==null && selectedFile.name!==null)? " is-info": " is-primary"}`} >
                <label className="file-label">
                    <input 
                        className="file-input" 
                        type="file" 
                        name="fileName"
                        multiple={false}
                        accept=".txt"
                        onChange={(e)=>{setSelectedFile(e.target.files[0])}}
                    />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            Choose a file…
                        </span>
                        <span className="file-name">
                            {(selectedFile!==null && selectedFile.name!==null)? selectedFile.name : "No file selected"}
                        </span>
                    </span>
                </label>
            </div>
                
                <button 
                    name="logToFileButton"
                    className="button is-info is-small"
                    onClick={logToFile}
                    >
                    Log to file
                </button>
            </div>
        </div>
    )
}
 
export default FileHandler;