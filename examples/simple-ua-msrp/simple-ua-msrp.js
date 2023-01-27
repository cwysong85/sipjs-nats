const SIPUDP = require('../../src/index.js')
const MSRP = require('../../../msrp-node-lib/src/MsrpSdk')({
    natsConfig: {
        server: '35.203.53.7:4222'
    },
    traceMsrp: true,
    sessionName: 'user-a',
    acceptTypes: 'text/plain',
    setup: 'active'
});
const express = require('express');
const app = express();
const http = require('http');
const s = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(s);

// create msrp server
var msrpServer = new MSRP.Server();

// start server
msrpServer.start();

let sipSession = null;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('answer', (desc) => {
        console.log('Local SDP: ', desc);
        // sipSession.localSdp = desc;
        // sipSession.accept();
    })
});

s.listen(3010, () => {
    console.log('listening on *:3010');
});


class MediaHandler {
    constructor(session) {
        this.session = session
    }
    close() { }
    render() { }
    mute() { }
    unmute() { }
    getDescription(onSuccess, onFailure, mediaHint) {
        // if (mediaHint) {
        //     // right now we assume m=message or m=audio depending on the mediaHint value
        //     if (mediaHint.audio) {

        //     } else {
        //         // Create MSRP session, if none created
        //         // if (!this.msrpSession) {
        //         //     this.msrpSession = msrp.SessionController.createSession();
        //         // }
        //         // this.msrpSession.getDescription(onSuccess, onFailure, mediaHint);
        //         onFailure('Meida type not supported');
        //     }
        // } else {
        //     onFailure();
        // }
    }
    setDescription(description, onSuccess, onFailure) {
        // find m= line to figure out which type of media to handle


        // for (var i = 0; i < sdp.media.length; i++) {
        //     if (sdp.media[i].media === 'audio') {
        //         // throw 'Audio is not currently supported';
        //         // Audio SDP
        //         // if (!this.rtpSession) {
        //         //     // create rtp session
        //         //     // this.rtpSession = new RTPStack.Session();
        //         // }

        //         // this.rtpSession.setDescription(description, onSuccess, onFailure);
        //         onFailure('Audio not supported');
        //         break;
        //     } else if (sdp.media[i].media === 'message') {

        //         // this.session.mediaHandler.render({
        //         //     renderHint: {
        //         //         remote: {
        //         //             audio: false
        //         //         }
        //         //     }
        //         // });

        //         //MSRP SDP
        //         // if (!this.msrpSession) {
        //         //     console.log('No MSRP session yet, setup one.');
        //         //     this.msrpSession = msrp.SessionController.createSession();
        //         // }

        //         // this.msrpSession.setDescription(description, onSuccess, onFailure);
        //         onFailure('Message not supported');
        //         break;
        //     }
        // }
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

    io.emit('incoming_call');
    sipSession = session;
})