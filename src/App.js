import React, {useState, useEffect, useRef} from "react"
import './App.sass'
import './styles.scss'
import { utf8ByteArrayToString } from 'utf8-string-bytes'; // this module also has 'stringToUtf8ByteArray'
import  BleModule from './BleModule.js'


const net = require('net');
//define the server port and host
const port = 8888;
const host = '127.0.0.1';
// let sock = undefined;
const TcpEventEmitter = require('./tcpeventemitter')
const tcpevents = new TcpEventEmitter()

// Get the current window
var win = nw.Window.get();
// Open the Dev Tools every time (used for debugging only), it defaults to the console which is what we need
win.showDevTools()

const bleMod =new BleModule()

function App() {
    const [consoleText, setConsoleText] = useState("")
    const [inputText, setInputText] = useState("")
    const textBoxRef = useRef(null)
    const sock = useRef(null)

    useEffect(()=>{
        // Run once to initalise the program

        // GUI: initalise the console with the following text
        const welcomeText = "Welcome to Web Device CLI V0.1.0\r\nCopyright (C) 2019  makerdiary.\r\n" + 
        "* Source: https://github.com/makerdiary/web-device-cli\r\n" + 
        "\r\nThis is a React Electron App based on a Web Command Line Interface via NUS " +
        "(Nordic UART Service) using Web Bluetooth.\r\n" + 
        "\r\n React Electron adaptation by Kevin John Mulligan." + 
        "\r\n - - - - - - - - - - - - - - - - - - - - - - - - -"

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

    function clearConsole(){
        setConsoleText("")
    }

    function addConsoleText(t){
        textBoxRef.current.scrollTop = textBoxRef.current.scrollHeight
        // textarea.scrollTop = textarea.scrollHeight;
        setConsoleText((prevText) => prevText + t + '\n')
    }

    
    function handleChange(e) {
        // handleChange is currently used but the es6 linter wants it
        e.preventDefault() 
        const {name,value} = e.target
        if(name === 'inputText'){   //send when selected from a list
            console.log(`handleChange: ${name}  ${value}`);
            sendFromInput(value)
        } else if (name === 'sendButton'){
            sendFromInput(inputText)
            console.log(`handleChange: ${name}  ${inputText}`);
        } else {
            console.log(`handleChange: ${name}  ${value}`);
        }

    }

    function send(data){
        addConsoleText(`> TX: ${data}`)  //add to local console
        bleMod.nusSendString(data)       //send over BLE
    }

    function sendFromInput(data){
        send(data)                      //general send
        tcpSendString(data)             //send over TCP
        setInputText("")                //clear input box
    }

    function keyPressed(e) {
        e.preventDefault() 
        const {key} = e
        const {value} = e.target;

        setInputText((prevText) => prevText + key)
        if (key === "Enter") {
            sendFromInput(value)
        }
      }
        
    function handleSubmit(e) {
        e.preventDefault() 
    }

    useEffect(() => {
        console.log(inputText) 
        bleMod.nusSendString(inputText);
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [setInputText])

    function connectionToggle(){
        bleMod.connectionToggle()
    }

    return (
        <div className='box'>
            <div className='heading-box'>
                <button 
                className="button is-primary"
                    onClick={connectionToggle}
                >
                    {bleMod.connected? "Disconnect": "Connect"}
                </button>
                
               <h1 className="title">BLE UART</h1>
               <h1 className="title" style={{color: "#000"}}>CLI</h1>
           </div>

            <div className="content-box">
                <textarea
                    ref={textBoxRef}
                    readOnly = {true} 
                    value={consoleText}
                />
            </div>

            <div className="input-box">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        value={inputText} 
                        name="inputText" 
                        className="input is-primary"
                        autoComplete={"off"}
                        placeholder=">" 
                        onChange={handleChange} 
                        onKeyPress={keyPressed}
                    />
                </form>
    
                <button 
                        className="button is-info"
                        name="sendButton" 
                        onClick={handleChange}
                    >
                    Send
                </button>
                <button 
                        className="button is-info"
                        onClick={clearConsole}
                    >
                    Clear
                </button>
            </div>
        </div>
    )
}

export default App


