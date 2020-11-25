import React, {useState, useEffect, useRef} from "react"
import './App.sass'
import './styles.scss'
import { utf8ByteArrayToString } from 'utf8-string-bytes'; // this module also has 'stringToUtf8ByteArray'
import TcpEventEmitter from './tcpeventemitter'
import  BleModule from './BleModule.js'
import TextInput from "./TextInput.js";
import  FileHandler from './FileHandler.js'

const net = require('net');
//define the server port and host
const port = 8888;
const host = '127.0.0.1';
// let sock = undefined;
const tcpevents = new TcpEventEmitter()
// run in development mode?
const isDevMode = false
const isDevMode = true

// Get the current window
var win = nw.Window.get();
if (win.x < 500){ //if it's on the left of the screen already, move and resize it
    win.moveTo(0, 0)
    win.resizeTo(500, 550)
}

// if Development mode, then show the debug tools
if(isDevMode){
    // Open the Dev Tools every time (used for debugging only), it defaults to the console which is what we need
    win.showDevTools()
}

const bleMod =new BleModule()

function App() {
    const [consoleText, setConsoleText] = useState("")
    const [showFileUI, setShowFileUI] = useState(true)
    const [isMono, setIsMono] = useState(false)
    const textBoxRef = useRef(null)
    const sock = useRef(null)

    useEffect(()=>{
        // Run once to initalise the program

        // GUI: initalise the console with the following text
        const welcomeText = 
`Welcome to 'Neutral NUS Terminal' based on 'Web Device CLI V0.1.0'
    Web Device CLI V0.1.0  -  Copyright (C) 2019  makerdiary
    Source: https://github.com/makerdiary/web-device-cli

This is a React NWjs App based on a Web Command Line Interface via NUS (Nordic UART Service) using Web Bluetooth.

   React NWjs adaptation by Kevin John Mulligan.
   - - - - - - - - - - - - - - - - - - - - - - -`

        addConsoleText(welcomeText)

        // BLE: initalise the send and receive event listeners
        console.log("setup BLE send listener")
        bleMod.on('sendBle', (data) => {
            send(data)
        })

        console.log("setup BLE addConsoleText listener")
        bleMod.on('receivedBle', (data) => {
            addConsoleText(`< RX: ${data}`)
            tcpSendString(data)
        })
        
        // TCP: initialise the TCP server and the receive event listener
        console.log("setup server")
        setupTcpServer()

        console.log("setup TCP receive listener")
        // Register a listener for messages received via TCP
        tcpevents.on('receivedTcp', (data) => {
            console.log('TCP received from client: ', data)
            send(data) // send to BLE device and show the TX in the GUI
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function createSocket(socket){
        sock.current = socket
    } 

    function setupTcpServer(){
        //Create an instance of the server
        const server = net.createServer((s)=>{
            createSocket(s)
            onClientConnection(s)
        });
        //Start listening with the server on given port and host.
        server.listen(port,host,function(){
            console.log(`Server started on port ${port} at ${host}`); 
        });
        //Ensure the server process is closed when the program closes
        process.on('SIGTERM', () => {
            server.close(() => {
              console.log('Process terminated')
            })
          })

        //Declare connection listener function
        function onClientConnection(socket){
            //Log when a client connnects.
            console.log(`${socket.remoteAddress}:${socket.remotePort} Connected`);
            
            //Listen for data from the connected client.
            // When data is received from a client, run the callback function.
            socket.on('data',function(data){
            //Log data from the client after converting to utf8 and removing the new line character at the end of the string
            const message = utf8ByteArrayToString(data).trim()
            console.log(`< ${socket.remoteAddress}:${socket.remotePort} : ${message} `);
            addConsoleText(`< ${socket.remoteAddress}:${socket.remotePort} : ${message} `);
            tcpevents.received(message)
            });
            // Register a listener for messages that need to be sent via TCP
            tcpevents.on('sendTcp', (data) => {
                console.log('TCP message to be sent: ', data)
                socket.write(data)
            })

            //Handle client connection termination.         
            // socket.on('close',function(){
            //     console.log(`${socket.remoteAddress}:${socket.remotePort} Terminated the connection`);
            // });

            //Handle Client connection error.
            socket.on('error',function(error){
                console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
            });
            
        };
    }
    
    function tcpSendString(data){
        tcpevents.send(data)
    }

    function addConsoleText(t){
        textBoxRef.current.scrollTop = textBoxRef.current.scrollHeight
        // textarea.scrollTop = textarea.scrollHeight;
        setConsoleText((prevText) => prevText + t + '\n')
    }

    function send(data){
        addConsoleText(`> TX: ${data}`)  //add to local console
        bleMod.nusSendString(data)       //send over BLE
    }

    function connectionToggle(){
        bleMod.connectionToggle()
    }

    return (
        <div className='box'>
            <div className='heading-box'>
                <button 
                className="button is-primary is-main"
                    onClick={connectionToggle}
                >
                    {bleMod.connected? "Disconnect": "Connect"}
                </button>
                
                <h1 className="title">BLE UART</h1>
                <h1 className="title" style={{color: "#000"}}>CLI</h1>
                <div className="heading-box-row">
                    <div className="field">
                        <input 
                            id="switchMonospace" 
                            type="checkbox" 
                            name="switchMonospace"
                            className="switch is-small" 
                            checked={isMono} 
                            onChange={()=>setIsMono(!isMono)}/>
                        <label htmlFor="switchMonospace">Monopacing </label>
                    </div>
                    <div className="field">
                        <input 
                            id="switchFileUI" 
                            type="checkbox" 
                            name="switchFileUI"
                            className="switch is-small" 
                            checked={showFileUI} 
                            onChange={()=>setShowFileUI(!showFileUI)}/>
                        <label htmlFor="switchFileUI">Show File UI </label>
                    </div>
                </div>
           </div>

            <div className="content-box">
                <textarea
                    ref={textBoxRef}
                    readOnly = {true} 
                    value={consoleText}
                    style={isMono? {fontFamily: "Courier"} : null}
                />
            </div>

            <TextInput 
                send={send}
                tcpSendString={tcpSendString}
                setConsoleText={setConsoleText}
                showFileUI={showFileUI}
                setShowFileUI={setShowFileUI}
                />

            {showFileUI? 
                <FileHandler
                    send={bleMod.nusSendString}
                    sendRaw={bleMod.nusSendRaw}
                    consoleText={consoleText}
                    addConsoleText={addConsoleText}
                /> 
                : null}
        </div>
    )
}

export default App


