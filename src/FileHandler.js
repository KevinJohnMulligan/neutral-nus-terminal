import React, {useState} from 'react';
const fs = require('fs')
const chalkReq = require('chalk');
const chalk = new chalkReq.Instance({level: 2});
 
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

    /**
    * setFile is used to assign a File Object to a stateful value.
    * There is a React Hook state assigned to each kind of file operation
    * @param  {File} fileProp The file selected by the user
    * @param  {function} setFileFunction The function applicable to this file
    */
    function setFile (fileProp, setFileFunction) {
        // Check whether the file object exists and is not null or undefined
        if(fileProp){
            // Set React State according to the operation type
            setFileFunction(fileProp) 
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
                        onChange={(e)=>setFile(e.target.files[0], setSelectedFileSend)}
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
                        onChange={(e)=>setFile(e.target.files[0], setSelectedFileLog)}
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