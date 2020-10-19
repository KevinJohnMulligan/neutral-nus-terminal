import React, {useState, useEffect, useRef} from "react"
import './App.sass'
import './styles.scss'
import { utf8ByteArrayToString } from 'utf8-string-bytes'; // this module also has 'stringToUtf8ByteArray'

const bleNusServiceUUID  = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID   = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID   = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const MTU = 20;

var bleDevice;
var nusService;
var rxCharacteristic;
var txCharacteristic;

var connected = false;

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

function App() {
    const [consoleText, setConsoleText] = useState("")
    const [inputText, setInputText] = useState("")
    const [suggestionChecked, setSuggestionChecked] = useState(true)
    const textBoxRef = useRef(null)
    const sock = useRef(null)

    useEffect(()=>{
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

    useEffect(()=>{
        console.log("setup server")
        setupTcpServer()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

    function connectionToggle() {
        if (connected) {
            disconnect();
        } else {
            connect();
        }
    }

    function clearConsole(){
        setConsoleText("")
    }

    function connect() {
        if (!navigator.bluetooth) {
            console.log('WebBluetooth API is not available.\r\n' +
                        'Please make sure the Web Bluetooth flag is enabled.');
            addConsoleText('WebBluetooth API is not available on your browser.\r\n' +
                        'Please make sure the Web Bluetooth flag is enabled.');
            return;
        }
        console.log('Requesting Bluetooth Device...');
        navigator.bluetooth.requestDevice({
            // Search for all devices that support the NUS service and my watch as a functionality test
            filters: [{services: [bleNusServiceUUID]}, {name: "Amazfit Bip Watch"}]
            // optionalServices: [bleNusServiceUUID],
            // acceptAllDevices: true
        })
        .then(device => {
            bleDevice = device; 
            console.log('Found ' + device.name);
            console.log('Connecting to GATT Server...');
            bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Locate NUS service');
            return server.getPrimaryService(bleNusServiceUUID);
        })
        .then(service => {
            nusService = service;
            console.log('Found NUS service: ' + service.uuid);
        })
        .then(() => {
            console.log('Locate RX characteristic');
            return nusService.getCharacteristic(bleNusCharRXUUID);
        })
        .then(characteristic => {
            rxCharacteristic = characteristic;
            console.log('Found RX characteristic');
        })
        .then(() => {
            console.log('Locate TX characteristic');
            return nusService.getCharacteristic(bleNusCharTXUUID);
        })
        .then(characteristic => {
            txCharacteristic = characteristic;
            console.log('Found TX characteristic');
        })
        .then(() => {
            console.log('Enable notifications');
            return txCharacteristic.startNotifications();
        })
        .then(() => {
            console.log('Notifications started');
            txCharacteristic.addEventListener('characteristicvaluechanged',
                                            handleNotifications);
            connected = true;
            addConsoleText('\r\n' + bleDevice.name + ' Connected.\r\n');
            send('Connected')
        })
        .catch(error => {
            console.log('' + error);
        addConsoleText('' + error);
            if(bleDevice && bleDevice.gatt.connected)
            {
                bleDevice.gatt.disconnect();
            }
        });
    }

    function disconnect() {
        if (!bleDevice) {
            console.log('No Bluetooth Device connected...');
            return;
        }
        console.log('Disconnecting from Bluetooth Device...');
        if (bleDevice.gatt.connected) {
            bleDevice.gatt.disconnect();
            connected = false;
            console.log('Bluetooth Device connected: ' + bleDevice.gatt.connected);
        } else {
            console.log('> Bluetooth Device is already disconnected');
        }
    }


    function onDisconnected() {
        connected = false;
    addConsoleText('\r\n' + bleDevice.name + ' Disconnected.\r\n');
    }

    function handleNotifications(event) {
        console.log('notification');
        let value = event.target.value;
        // Convert raw data bytes to character values and use these to 
        // construct a string.
        let str = "";
        for (let i = 0; i < value.byteLength; i++) {
            str += String.fromCharCode(value.getUint8(i));
        }
        
        addConsoleText(`< RX: ${str}`); 
    }

    function nusSendString(s) {
        if(bleDevice && bleDevice.gatt.connected) {
            console.log("send: " + s);
            let val_arr = new Uint8Array(s.length)
            for (let i = 0; i < s.length; i++) {
                let val = s[i].charCodeAt(0);
                val_arr[i] = val;
            }
            sendNextChunk(val_arr);
        } else {
            console.log('Not connected to a device yet.');
        }
    }

    function sendNextChunk(a) {
        let chunk = a.slice(0, MTU);
        rxCharacteristic.writeValue(chunk)
        .then(function() {
            if (a.length > MTU) {
                sendNextChunk(a.slice(MTU));
            }
        });
    }

// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
// aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

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

    function handleCheck(){
        setSuggestionChecked(!suggestionChecked) 
    }

    function send(data){
        addConsoleText(`> TX: ${data}`)  //add to local console
        nusSendString(data)             //send over BLE
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
        // initalise the console with the following text
        const welcomeText = "Welcome to Web Device CLI V0.1.0\r\nCopyright (C) 2019  makerdiary.\r\n" + 
                            "* Source: https://github.com/makerdiary/web-device-cli\r\n" + 
                            "\r\nThis is a React Electron App based on a Web Command Line Interface via NUS " +
                            "(Nordic UART Service) using Web Bluetooth.\r\n" + 
                            "\r\n React Electron adaptation by Kevin John Mulligan." + 
                            "\r\n - - - - - - - - - - - - - - - - - - - - - - - - -"

        addConsoleText(welcomeText)
    }, [])


    useEffect(() => {
        console.log(inputText) 
        nusSendString(inputText);
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [setInputText])


    return (
        <div className='box'>
            <div className='heading-box'>
                <button 
                className="button is-primary"
                    onClick={connectionToggle}
                >
                    {connected? "Disconnect": "Connect"}
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
                        autoComplete={suggestionChecked? "on": "off"}
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
                <button 
                className="button is-info"
                    onClick={handleCheck}
                >
                    {suggestionChecked? "Disable Suggestions": "Enable Suggestions"}
                </button>
            </div>
        </div>
    )
}

export default App


