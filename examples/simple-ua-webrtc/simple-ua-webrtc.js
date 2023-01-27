const SIPUDP = require('../../src/index.js')
const express = require('express');
const app = express();
const http = require('http');
const s = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(s);

let sipSession = null;
let localSocket = null;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    localSocket = socket;
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

s.listen(3010, () => {
    console.log('listening on *:3010');
});

class MediaHandler {
    constructor(session) {
        this.session = session
        this.answerSdp = null;
        localSocket.on('answer-sdp', (sdp) => {
            console.log('Recv Answer SDP from browser: ', sdp);
            this.answerSdp = sdp;
            this.session.accept();
        });

    }
    close() { }
    render() { }
    mute() { }
    unmute() { }
    getDescription(onSuccess, onFailure, mediaHint) {
        onSuccess(this.answerSdp);
    }
    setDescription(description, onSuccess, onFailure) {
        io.emit('offer-sdp', description);
        onSuccess();
    }
}


const ua = new SIPUDP.UA({
    // provide a valid URI here
    uri: 'simple-ua@localhost',

    natsConfig: {
        servers: [
            '35.203.53.7:4222'
        ],
        subscription: 'sip-messages'
    },

    // auto start...
    autostart: true,

    // no need to register since we are UAS
    register: false,

    // trace sip or not
    traceSip: true,

    // enable UAS support
    doUAS: true,

    // Custom media handler - Enabled for custom media handling
    mediaHandlerFactory: (session) => {
        return new MediaHandler(session)
    }
})

ua.on('connected', () => {
    console.log('Connected to NATs server')
})

ua.on('disconnected', () => {
    console.log('Disconnected from NATs server')
})

ua.on('invite', (session) => {
    console.log('Received INVITE from NATs server')
})