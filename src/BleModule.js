const EventEmitter = require('events')

class BleModule extends EventEmitter{
    constructor(){
        super()

        this.bleNusServiceUUID  = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
        this.bleNusCharRXUUID   = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
        this.bleNusCharTXUUID   = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
        this.MTU = 20
    
        this.bleDevice = undefined
        this.nusService = undefined
        this.rxCharacteristic = undefined
        this.txCharacteristic = undefined
    
        this.connected = false
        this.setConnected(false)
        
        // bind BleModule's [this] to these functions that are called outside of this module
        this.connectionToggle = this.connectionToggleUnbound.bind(this)
        this.onDisconnected = this.onDisconnectedUnbound.bind(this)
        this.handleNotifications = this.handleNotificationsUnbound.bind(this)
        this.nusSendString = this.nusSendStringUnbound.bind(this)
    }

    setConnected(isConnected){
        // Set the local connected variable
        this.connected = isConnected
    }

    send(message) {
        // Raise an event to indicate that a BLE message must be sent out
        // Pass the message to be sent as an argument
        this.emit('sendBle', message)
    }

    received(message) {
         // Raise an event to indicate that a message has been received
         // Pass the message contents through as an argument
        this.emit('receivedBle', message)
    }

    connectionToggleUnbound() {
        if (this.connected) {
            this.disconnect();
        } else {
            this.connect();
        }
    }

    connect() {
        if (!navigator.bluetooth) {
            console.log('WebBluetooth API is not available.\r\n' +
                        'Please make sure the Web Bluetooth flag is enabled.');
            
            this.received('WebBluetooth API is not available on your browser.\r\n' +
                        'Please make sure the Web Bluetooth flag is enabled.');
            return;
        }
        console.log('Requesting Bluetooth Device...');

        navigator.bluetooth.requestDevice({
            // Search for all devices that support the NUS service and my watch as a functionality test
            filters: [{services: [this.bleNusServiceUUID]}, {name: "Amazfit Bip Watch"}]
            // optionalServices: [this.bleNusServiceUUID],
            // acceptAllDevices: true
        })
        .then(device => {
            this.bleDevice = device; 
            console.log('Found ' + device.name);
            console.log('Connecting to GATT Server...');
            this.bleDevice.addEventListener('gattserverdisconnected', this.onDisconnected);
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Locate NUS service');
            return server.getPrimaryService(this.bleNusServiceUUID);
        })
        .then(service => {
            this.nusService = service;
            console.log('Found NUS service: ' + service.uuid);
        })
        .then(() => {
            console.log('Locate RX characteristic');
            return this.nusService.getCharacteristic(this.bleNusCharRXUUID);
        })
        .then(characteristic => {
            this.rxCharacteristic = characteristic;
            console.log('Found RX characteristic');
        })
        .then(() => {
            console.log('Locate TX characteristic');
            return this.nusService.getCharacteristic(this.bleNusCharTXUUID);
        })
        .then(characteristic => {
            this.txCharacteristic = characteristic;
            console.log('Found TX characteristic');
        })
        .then(() => {
            console.log('Enable notifications');
            return this.txCharacteristic.startNotifications();
        })
        .then(() => {
            console.log('Notifications started');
            this.txCharacteristic.addEventListener('characteristicvaluechanged',
                                            this.handleNotifications)
            this.received('\r\n' + this.bleDevice.name + ' Connected.\r\n');
            this.send('Connected')
            this.setConnected(true)
        })
        .catch(error => {
            console.log('' + error);
            this.received(`${error}` );
            if(this.bleDevice && this.bleDevice.gatt.connected)
            {   
                console.log(`This error caused the device to disconnect:  ${error}`)
                this.bleDevice.gatt.disconnect();
                this.setConnected(false)
            }
        });
    }

    disconnect() {
        if (!this.bleDevice) {
            console.log('No Bluetooth Device connected...');
            return;
        }
        console.log('Disconnecting from Bluetooth Device...');
        if (this.bleDevice.gatt.connected) {
            this.bleDevice.gatt.disconnect();
            this.setConnected(false)
            console.log('Bluetooth Device connected: ' + this.bleDevice.gatt.connected);
        } else {
            console.log('> Bluetooth Device is already disconnected');
        }
    }


    onDisconnectedUnbound() {
        this.setConnected(false)
        this.received('\r\n' + this.bleDevice.name + ' Disconnected.\r\n');
    }

    handleNotificationsUnbound(event) {
        console.log('notification');
        let value = event.target.value;
        // Convert raw data bytes to character values and use these to 
        // construct a string.
        let str = "";
        for (let i = 0; i < value.byteLength; i++) {
            str += String.fromCharCode(value.getUint8(i));
        }
        
        this.received(str); 
    }

    nusSendStringUnbound(s) {
        if(this.bleDevice && this.bleDevice.gatt.connected) {
            console.log("nus send: " + s);
            let val_arr = new Uint8Array(s.length)
            for (let i = 0; i < s.length; i++) {
                let val = s[i].charCodeAt(0);
                val_arr[i] = val;
            }
            this.sendNextChunk(val_arr);
        } else {
            console.log('Not connected to a device yet.');
        }
    }

    sendNextChunk(a) {
        let chunk = a.slice(0, this.MTU);
       
        this.rxCharacteristic.writeValue(chunk)
        .then(() => {
            if (a.length > this.MTU) {
                this.sendNextChunk(a.slice(this.MTU));
            }
        });
    }
}

module.exports = BleModule