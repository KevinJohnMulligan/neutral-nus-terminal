const EventEmitter = require('events')

class TcpEventEmitter extends EventEmitter {
    send(message) {
        // Raise an event to indicate that a TCP message must be sent out
        // Pass the message to be sent as an argument
        this.emit('sendTcp', message)
    }

    received(message) {
         // Raise an event to indicate that a TCP message has been received
         // Pass the received message contents through as an argument
        this.emit('receivedTcp', message)
    }
}

module.exports = TcpEventEmitter