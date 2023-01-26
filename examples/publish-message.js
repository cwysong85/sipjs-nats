const { Buffer } = require('node:buffer');
const nats = require('nats');

const publish = async function () {

    const nc = await nats.connect({ servers: `35.203.53.7:4222` });
    console.log(`connected to ${nc.getServer()}`);

    const sub = nc.subscribe('sip-messages');

    const msg = new Buffer.from(`INVITE sip:+14155552222@localhost SIP/2.0\r\nVia: SIP/2.0/UDP 192.168.10.10:5060;branch=z9hG4bK776asdhds\r\nMax-Forwards: 70\r\nTo: "Bob" <sip:+14155552222@localhost>\r\nFrom: "Alice" <sip:+14155551111@localhost>;tag=1\r\nCall-ID: a84b4c76e66710\r\nCSeq: 1 INVITE\r\nContact: "Alice" <sip:+14155551111@192.168.10.10:5060>\r\nDiversion: "Sales" <sip:+14155550000@localhost>\r\nP-Asserted-Identity: "Alice" <sip:+14155551111@localhost>\r\nContent-Length: 0\r\n\r\n`);

    nc.publish('sip-messages', msg);

    await nc.drain();
}

publish();
