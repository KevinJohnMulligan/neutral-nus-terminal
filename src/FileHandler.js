import React, { useState, useEffect } from 'react';
const fs = require('fs')
const chalkReq = require('chalk');
const chalk = new chalkReq.Instance({level: 2});
 
const FileHandler = (props) => {  
    const [selectedFileSend, setSelectedFileSend] = useState(null)
    const [selectedFileRaw, setSelectedFileRaw] = useState(null)
    const [selectedFileLog, setSelectedFileLog] = useState(null)
    const [receivedRawData, setReceivedRawData] = useState("")
    const [isRaw, setIsRaw] = useState(false)
    
    useEffect (()=>{
        props.bleMod.on('receivedBleRaw', (data) => {
            if (data){
                let dataString = ""
                for (let i = 0; i < data.byteLength - 1; i++) {
                    // Convert received data into Hex format
                    dataString = dataString + data.getInt8(i).toString(16)
                }
                console.log(`Values in file handler  ${dataString}`)
                console.log(`Length in file handler  ${(data)? data.byteLength : "undefined"}`)
                console.log(`File  ${(selectedFileRaw)? selectedFileRaw.path : "undefined"}`)
                setReceivedRawData((prevData)=> prevData + dataString)
                setIsRaw(true)            
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(()=>{
        if(isRaw){
            setIsRaw(false)
            receiveToFile()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[isRaw])

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
            props.bleMod.nusSendRaw(data)
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

    function receiveToFile(){
        console.group("receiveToFile");
        console.log(chalk.bgBlack(`receviedRawData current state \n ${receivedRawData}`))
        console.log(chalk.bgBlack(`selectedFileRaw               \n ${selectedFileRaw}`))
        if(isFileNull(selectedFileRaw)){
            console.groupEnd();
            return
        }
        console.log(`selected file ${selectedFileRaw.path}`)

        fs.appendFile(selectedFileRaw.path, receivedRawData, function (err) {
            if (err) return console.log(err);
            console.log(`${receivedRawData} received text will be written to ${selectedFileRaw.path}`);
        });
        // Clear the received data
        setReceivedRawData("")
        console.warn("Complete")
        console.groupEnd();
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
            console.log(fileProp.path)
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

            <div className="input-box-row">
            <div className={`file is-right is-small 
                            ${hasFile(selectedFileRaw)? " is-info": " is-primary"}`} >
                <label className="file-label">
                    <input 
                        className="file-input" 
                        type="file" 
                        name="fileName"
                        multiple={false}
                        accept=".txt, .bin, .hex"
                        onChange={(e)=>setFile(e.target.files[0], setSelectedFileRaw)}
                    />
                    <span className="file-cta">
                        <span className="file-icon">
                            <i className="fas fa-upload"></i>
                        </span>
                        <span className="file-label">
                            {hasFile(selectedFileRaw)? selectedFileRaw.name : "Choose a file…"}
                        </span>
                    </span>
                </label>
            </div>
                
                <button 
                    name="receiveRawDataFileButton"
                    className="button is-info is-small"
                    onClick={receiveToFile}
                    >
                    Receive Raw to file
                </button>
            </div>
        </div>
    )
}
 
export default FileHandler;