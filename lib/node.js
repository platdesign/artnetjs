'use strict';

const EventEmitter = require('events');
const Protocol = require('./protocol');
const dgram = require('dgram');
const ip = require('ip');

const PORT = 6454;

module.exports = class ArtNetNode extends EventEmitter {

	constructor() {
		super();

		this.protocol = Protocol();


		this.socket = dgram.createSocket('udp4');

		this.ShortName = 'Art-Net NodeJs';
		this.LongName = 'Platdesign Art-Net Node for NodeJs';


		this.socket.on('message', (msg, peer) => this._processMsg(msg, peer));
	}

	start() {
		this.socket.bind(PORT, () => {
			this.socket.setBroadcast(true);
		});
	}

	_processMsg(msg, peer) {

		let res = this.protocol.match(msg);

		if(res) {

			if(res.msg === 'ArtPoll') {
				this.emit('ArtAddress', res.data);
				this._sendPollReply();
			}

			if(res.msg === 'ArtAddress') {
				this.emit('ArtAddress', res.data);

				this.ShortName = res.data.ShortName;
				this.LongName = res.data.LongName;

				this._sendPollReply();
			}

		}

	}


	_sendPollReply() {
		let msg = this.protocol.compose('ArtPollReply', {
			ip: ip.address(),
			port: PORT,
			ShortName: this.ShortName,
			LongName: this.LongName,
			MAC: [0,0,0,0,0,0]
		});

		this.socket.send(msg, PORT, '255.255.255.255', e => e && console.log(e));
	}

}
