'use strict';

const { Controller } = require('../');



// init controller instance
let controller = new Controller();


// Will be executed everytime the nodes list changes
controller.on('nodes', nodes => {
	console.log(nodes)
})


// Opens the socket and starts polling for nodes
controller.start({
	address: '0.0.0.0'
});

