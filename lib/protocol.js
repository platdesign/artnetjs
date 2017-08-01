'use strict';

const Bipro = require('bipro');
const ip = require('ip');
const Joi = require('joi');

module.exports = () => {

	let protocol = new Bipro.Protocol();

	protocol.defineType('ip', {
		compose(ipString, data, schema, protocol) {
			return ip.toBuffer(ipString);
		},
		parse(buf, ctx, schema, protocol) {
			let _ip = ip.toString(buf.slice(ctx.offset, ctx.offset + 4));
			ctx.offset += 4;
			return _ip;
		}
	})

	protocol.defineType('skip', {
		schemaValidation: {
			size: Joi.alternatives().try(Joi.number(), Joi.string()),
			sizeType: Joi.string().default('uint8')
		},
		compose(ipString, data, schema, protocol) {
			return Buffer.alloc(schema.size).fill(0);
		},
		parse(buf, ctx, schema, protocol) {
			ctx.offset += schema.size;
			return true;
		}
	})


	let role = {
		ID: { key: 'ID', type: 'string', size: 8, static: true, default: 'Art-Net' },
		opcode: code => ({ key: 'opcode', type: 'uint16le', static: true, default: code }),
		version: { key: 'version', type: 'uint16be', static: true, default: 0x000E }
	}


	protocol.defineMessage('ArtPoll', {
		schema: [
			role.ID,
			role.opcode(0x2000),
			role.version,
			{ key: 'talktome', type: 'int8', default: 0b00000100 },
			{ key: 'priority', type: 'uint8', static: true, default: 0 }
		]
	})

	protocol.defineMessage('ArtPollReply', {
		schema: [
			role.ID,
			role.opcode(0x2100),
			{ key: 'ip', type: 'ip' },
			{ key: 'port', type: 'uint16le' },
			{ key: 'version', type: 'uint16be' },
			{ key: 'NetSwitch', type: 'int8', default: 0 },
			{ key: 'SubSwitch', type: 'int8', default: 0 },
			{ key: 'rubbish', type: 'skip', size: 6 },
			{ key: 'ShortName', type: 'string', size: 18 },
			{ key: 'LongName', type: 'string', size: 64 },
			{ key: 'NodeReport', type: 'string', size: 64, default: 'Nothing' },
			{ key: 'NumPorts', type: 'uint16be', default: 1 },
			{ key: 'PortTypes', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'GoodInput', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'GoodOutput', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'SwIn', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'SwOut', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'SwVideo', type: 'int8', default: 0 },
			{ key: 'SwMacro', type: 'int8', default: 0 },
			{ key: 'SwRemote', type: 'int8', default: 0 },
			{ key: 'Spare', type: 'array', size: 3, default: [0, 0, 0] },
			{ key: 'Style', type: 'int8', default: 0 },
			{ key: 'MAC', type: 'array', size: 6 },
			{ key: 'BindIp', type: 'ip', default: '0.0.0.0' },
			{ key: 'BindIndex', type: 'int8', default: 0 },
			{ key: 'Status2', type: 'int8', default: 0 },
			//{ key: 'Filler', type: 'array', size: 26, items: { type: 'int8', default: 0 } }

		]
	});

	protocol.defineMessage('ArtIpProg', {
		schema: [
			role.ID,
			role.opcode(0xf800),
			role.version,
			{ key: 'Filler1', type: 'int8', static: true, default: 0 },
			{ key: 'Filler2', type: 'int8', static: true, default: 0 },
			{ key: 'Command', type: 'uint8', default: 0 },
			{ key: 'Filler4', type: 'int8', static: true, default: 0 },
			{ key: 'ip', type: 'ip' },
			{ key: 'subnet', type: 'ip' },
			{ key: 'port', type: 'uint16be', default: 0 },
			{ key: 'spare', type: 'array', size: 8, static: true, default: [0, 0, 0, 0, 0, 0, 0, 0] }
		]
	});

	protocol.defineMessage('ArtIpProgReply', {
		schema: [
			role.ID,
			role.opcode(0xf900),
			role.version,
			{ key: 'Filler', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'ip', type: 'ip' },
			{ key: 'subnet', type: 'ip' },
			{ key: 'port', type: 'uint16be' },
			{ key: 'status', type: 'int8' },
			//{ key: 'spare', type: 'array', size: 8, static: true, default: [0, 0, 0, 0, 0, 0, 0,0] },
		]
	});



	protocol.defineMessage('ArtAddress', {
		schema: [
			role.ID,
			role.opcode(0x6000),
			role.version,
			{ key: 'NetSwitch', type: 'int8', default: 0 },
			{ key: 'BindIndex', type: 'int8', default: 0 },
			{ key: 'ShortName', type: 'string', size: 18 },
			{ key: 'LongName', type: 'string', size: 64 },
			{ key: 'SwIn', type: 'array', size: 4, items:{ type: 'int8', default: 0 } },
			{ key: 'SwOut', type: 'array', size: 4, items:{ type: 'int8', default: 0 } },
			{ key: 'SubSwitch', type: 'int8', default: 0 },
			{ key: 'SwVideo', type: 'int8', default: 0 },
			{ key: 'Command', type: 'int8', default: 0 }
		]
	});



	return protocol;
};
