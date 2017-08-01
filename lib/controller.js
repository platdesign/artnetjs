'use strict';

const EventEmitter = require('events');
const Protocol = require('./protocol');
const dgram = require('dgram');
const ip = require('ip');

const PORT = 6454;

module.exports = class ArtNetController extends EventEmitter {

	constructor() {
		super();

		this.protocol = Protocol();


		this.socket = dgram.createSocket('udp4');

		this.ShortName = 'Art-Net NodeJs';
		this.LongName = 'Platdesign Art-Net Node for NodeJs';


		this.socket.on('message', (msg, peer) => this._processMsg(msg, peer));

		this.nodes = {};
	}

	start() {
		this.socket.bind(PORT, () => {
			this.socket.setBroadcast(true);
		});

		setInterval(() => this._sendPoll(), 3000);
	}

	_processMsg(msg, peer) {

		let res = this.protocol.match(msg);

		if(res) {

			if(res.msg === 'ArtPoll') {
				this.emit('ArtAddress', res.data);
				this._sendPollReply();
			}

			if(res.msg === 'ArtPollReply') {
				this.nodes[res.data.LongName] = res.data;
				this.emit('nodes', this.nodes);
				return;
			}

		}

	}


	_sendPoll() {
		let msg = this.protocol.compose('ArtPoll', {});
		this.socket.send(msg, PORT, '255.255.255.255', e => e && console.log(e));
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


	nodeSetNet(ip, subnet, port) {

		let cmd = 0b00000000;

		if(port) {
			cmd |= 1 << 0;
		}

		if(subnet) {
			cmd |= 1 << 1;
		}

		if(ip) {
			cmd |= 1 << 2;
		}

		if(port || subnet || ip) {
			cmd |= 1 << 7;
		}

		let msg = this.protocol.compose('ArtIpProg', {
			Command: cmd,
			ip,
			subnet: subnet || '255.0.0.0',
			port
		});

		console.log(msg);

	}


	nodeSetName(ShortName, LongName) {
		let msg = this.protocol.compose('ArtAddress', {
			ShortName,
			LongName
		});

		return msg;
	}

}
