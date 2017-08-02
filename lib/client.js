'use strict';


const Controller = require('./controller');

const node = new Controller();


//node.on('nodes', data => data.forEach(node => console.log(JSON.stringify(node, null, 2))));

node.start();


// const Protocol = require('./protocol');

// const dgram = require('dgram');

// const socket = dgram.createSocket('udp4');

// const PORT = 6454;

// socket.bind(PORT, () => {
// 	console.log('listening');
// 	socket.setBroadcast(true);
// });



// const protocol = Protocol();


// // setInterval(() => {

// // 	let msg = protocol.compose('ArtPoll', {});

// // 	//console.log(msg.toJSON().data);


// // 	socket.send(msg, PORT, '255.255.255.255', e => e && console.log(e));

// // }, 1000);





// let nodes =  {};

// socket.on('message', (msg, peer) => {


// 	let res = protocol.match(msg);

// 	if(res) {

// 		if(res.msg === 'ArtPoll') {
// 			//console.log('poll');

// 			let msg = protocol.compose('ArtPollReply', {
// 				ip: '192.168.2.110',
// 				port: PORT,
// 				version: 0x000E,
// 				ShortName: 'Art-NodeJs',
// 				LongName: 'Der geilste Art-Net Node der Welt',
// 				MAC: [0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6]
// 			});

// 			// 	//console.log(msg.toJSON().data);


// 			socket.send(msg, PORT, '255.255.255.255', e => e && console.log(e));

// 		}

// 		if(res.msg === 'ArtPollReply') {
// 			console.log(`ArtPollReply from ${res.data.LongName} ${res.data.ip}`);
// 			nodes[res.data.LongName] = res.data;
// 			return;
// 		}

// 		if(res.msg === 'ArtIpProgReply') {
// 			console.log(`ArtIpProgReply`);
// 			console.log(res.data);
// 		}

// 		if(res.msg === 'ArtAddress') {
// 			console.log(`ArtAddress`);
// 			console.log(res.data);

// 			let msg = protocol.compose('ArtPollReply', {
// 				ip: '192.168.2.110',
// 				port: PORT,
// 				version: 0x000E,
// 				ShortName: res.data.ShortName,
// 				LongName: res.data.LongName,
// 				MAC: [0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6]
// 			});

// 			socket.send(msg, PORT, '255.255.255.255', e => e && console.log(e));
// 		}

// 		//console.log(res);

// 	} else {
// 		console.log('unknown message');

// 		console.log(msg.toString());
// 	}


// });




// // '2.39.2.101'





// // setTimeout(() => {

// // 	let node = Object.keys(nodes).map(k => nodes[k])[0];

// // 	if(node) {
// // 		//console.log(node.ip);

// // 		let msg = protocol.compose('ArtIpProg', {
// // 			Command: 0b10000110,
// // 			ip: '192.168.2.202',
// // 			subnet: '255.255.255.0'
// // 		});

// // 		//console.log(msg.length);

// // 	// console.log(msg.toJSON().data);

// // 		socket.send(msg, PORT, node.ip, e => e && console.log(e));

// // 	}

// // }, 2000);








