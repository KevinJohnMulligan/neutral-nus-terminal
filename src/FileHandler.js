import React, {useState} from 'react';
const fs = require('fs')
 
const FileHandler = (props) => {  
    const [selectedFileSend, setSelectedFileSend] = useState(null)
    const [selectedFileLog, setSelectedFileLog] = useState(null)
    
    function isFileNull(fileArg){
        if(fileArg===null){
            const errmsg = "No file selected"
            props.addConsoleText(errmsg)
            console.error(errmsg)
            return true
        }
        return false
    }

    function sendFromFile(){
        if(isFileNull(selectedFileSend)){
            return
        }
        console.log(`selected file ${selectedFileSend}`)


        fs.readFile(Buffer(selectedFileSend.path), (err, data) => {
            if (err) {
              console.error(err)
              return
            }
            props.sendRaw(data)
            console.log(data)
          })
    }

    function logToFile(){
        if(isFileNull(selectedFileLog)){
            return
        }
        console.log(`selected file ${selectedFileLog}`)

        fs.appendFile(selectedFileLog.path, props.consoleText, function (err) {
            if (err) return console.log(err);
            console.log(`${props.consoleText} written to ${selectedFileLog.path}`);
          });
    }

    function hasFile (fileArg) {
        return (fileArg !== null && fileArg.name!==null)
    }

    function setFile (fileProp, index) {
        if(fileProp!== undefined){
            index === 0 ? setSelectedFileSend(fileProp) : setSelectedFileLog(fileProp)
        }     
    }
    return (
        <div className={"input-box-file"}>

            <div className="input-box-row">
 
            <div className={`file is-right is-small 
                            ${hasFile(selectedFileSend)? " is-info": " is-primary"}`} >
                <label className="file-label">
                    <input 
                        className="file-input" 
                        type="file" 
                        name="fileName"
                        multiple={false}
                        accept=".txt, .bin, .hex"
                        onChange={(e)=>setFile(e.target.files[0], 0)}
                    />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                        {hasFile(selectedFileSend)? selectedFileSend.name : "Choose a file…"}
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
            <div className={`file is-right is-small 
                            ${hasFile(selectedFileLog)? " is-info": " is-primary"}`} >
                <label className="file-label">
                    <input 
                        className="file-input" 
                        type="file" 
                        name="fileName"
                        multiple={false}
                        accept=".txt"
                        onChange={(e)=>setFile(e.target.files[0], 1)}
                    />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            {hasFile(selectedFileLog)? selectedFileLog.name : "Choose a file…"}
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