'use strict';

const EventEmitter = require('events');
const Protocol = require('./protocol');
const dgram = require('dgram');
const ip = require('ip');
const ESTA = require('./data/esta');
const OEMList = require('./data/oem.json');
const DeviceStyles = require('./data/device-styles');


const PORT = 6454;

function createNodeId(node){
	let str = `${node.NumPorts}-${node.version}-${node.MAC}-${node.MAC.join(':')}`;

	var hash = 0;
	if (str.length == 0) return hash;
	for (let i = 0; i < str.length; i++) {
		let char = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}


function getInfoFromOEM(code) {
	return OEMList.find(item => parseInt(item.OemCode) === code) || null;
}


module.exports = class ArtNetController extends EventEmitter {

	constructor() {
		super();

		this.protocol = Protocol();



		this.ShortName = 'Art-Net NodeJs';
		this.LongName = 'Platdesign Art-Net Node for NodeJs';

		this.nodes = {};
	}

	_initSocket() {
		this.socket = dgram.createSocket('udp4');
		this.socket.on('message', (msg, peer) => this._processMsg(msg, peer));
		this.socket.on('error', e => console.log(e));
	}

	async start(config) {
		if(this.socket) {
			await this.stop();
		}

		this._initSocket();

		let readyPromise = new Promise(resolve => this.socket.once('listening', () => resolve()));

		this.socket.bind({
			port: PORT,
			address: config.address
		}, () => {
			this.socket.setBroadcast(true);
		});

		await readyPromise;

		clearInterval(this._pollTimer);
		this._sendPoll();
		this._pollTimer = setInterval(() => this._sendPoll(), 1000);
	}

	async stop() {
		clearInterval(this._pollTimer);

		if(this.socket) {
			await new Promise(resolve => {
				try {
					this.socket.close(() => resolve());
				} catch(e) {}

				delete this.socket;
			});
		}

		this.nodes = {};
		this.emit('nodes', Object.keys(this.nodes).map(k => this.nodes[k]));
	}

	_processMsg(msg, peer) {

		let res = this.protocol.match(msg);

		if(res) {

			if(res.msg === 'ArtPoll') {
				this.emit('ArtAddress', res.data);
				this._sendPollReply();
			}

			if(res.msg === 'ArtPollReply') {

				if(res.data.ip !== ip.address()) {

					let id = createNodeId(res.data);

					let existing = this.nodes[id];

					if(existing) {
						Object.assign(existing, res.data);
					} else {
						let node = this.nodes[id] = Object.assign({id}, res.data);
						node.ESTAManufactor = ESTA[node.EstaMan];
						node.OemInfo = getInfoFromOEM(node.Oem);
						node.StyleInfo = DeviceStyles[node.Style];

					}

					this.emit('nodes', Object.keys(this.nodes).map(k => this.nodes[k]));
				}
				return;
			}

			if(res.msg === 'ArtIpProgReply') {
				console.log(res.data);
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


	nodeSetNet(currentIp, ip, subnet, port) {

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

		console.log(currentIp);

		let msg = this.protocol.compose('ArtIpProg', {
			Command: cmd,
			ip,
			subnet
		});

		//console.log(msg.toJSON().data);

		this.socket.send(msg, PORT, currentIp, e => e && console.log(e));
	}


	nodeSetName(ShortName, LongName) {
		let msg = this.protocol.compose('ArtAddress', {
			ShortName,
			LongName
		});

		return msg;
	}

}
