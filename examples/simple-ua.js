const SIPUDP = require('../src/index.js')

class MediaHandler {
    constructor(session) {
        this.session = session
    }
    close() { }
    render() { }
    mute() { }
    unmute() { }
    getDescription(onSuccess, onFailure, mediaHint) { }
    setDescription(description, onSuccess, onFailure) { }
}


const server = new SIPUDP.UA({
    // provide a valid URI here
    uri: 'simple-ua@localhost',

    // NATs host
    natsHost: '127.0.0.1',

    // NATs port
    natsPort: 4222,

    // NATs subscription
    natsSubscription: 'sip-messages',

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

server.on('connected', () => {
    console.log('Connected to NATs server')
})

server.on('disconnected', () => {
    console.log('Disconnected from NATs server')
})

server.on('invite', (session) => {
    console.log('Received INVITE from NATs server')
    // console.log(session)
    session.accept();
})