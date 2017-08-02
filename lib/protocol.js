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
			size: Joi.alternatives().try(Joi.number()),
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

//			{ key: 'OemHi', type: 'uint8' },
			{ key: 'Oem', type: 'uint16be' },
			{ key: 'UbeaVersion', type: 'uint8', default: 0 },
			{ key: 'Status1', type: 'uint8', bits: {
				UBEA: { bit: 0, values: ['present', 'notpresentOrCorrupt'] },
				RDM: 1,
				bootedFrom: { bit: 2, values: ['ROM', 'Flash']},
				portAddressProgrammingAuthority: {
					shift: 4,
					size: 2,
					default: 'unknown',
					values: {
						'unknown': 0b00,
						'frontPanelControls': 0b01,
						'networkOrBrowser': 0b10
					}
				},
				mode: {
					shift: 6,
					size: 2,
					default: 'unknown',
					values: {
						'unknown': 0b00,
						'identify': 0b01,
						'mute': 0b10,
						'normal': 0b11
					}
				}
			} },
			{ key: 'EstaMan', type: 'uint16le', default: 0 },
			{ key: 'ShortName', type: 'string', size: 18 },
			{ key: 'LongName', type: 'string', size: 64 },
			{ key: 'NodeReport', type: 'string', size: 64, default: 'Nothing' },
			{ key: 'NumPorts', type: 'uint16be', default: 1 },
			{ key: 'PortTypes', type: 'array', size: 4, items:{ type: 'uint8', bits: {
				output: 7,
				input: 6,
				protocol: {
					shift: 0,
					size: 6,
					values: {
						'DMX': 0b000000,
						'MIDI': 0b000001,
						'Avab': 0b000010,
						'Colortran CMX': 0b000011,
						'ADB 62.5': 0b000100,
						'Art-Net': 0b000101
					}
				}
			} } },
			{ key: 'GoodInput', type: 'array', size: 4, items:{ type: 'uint8', bits: {
				receiveErrors: 2,
				inputDisabled: 3,
				includesDmxTextPackets: 4,
				includesDmxSIPs: 5,
				includesDmxTestPackets: 6,
				dataReceived: 7
			}} },
			{ key: 'GoodOutput', type: 'array', size: 4, items:{ type: 'uint8', bits: {
				mergeModeLTP: 1,
				dmxOutputShortDetect: 2,
				mergingArtnetData: 3,
				includesDmxTextPackets: 4,
				includesDmxSIPs: 5,
				includesDmxTestPackets: 6,
				dataTransmitted: 7
			}} },
			{ key: 'SwIn', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'SwOut', type: 'array', size: 4, default: [0, 0, 0, 0] },
			{ key: 'SwVideo', type: 'uint8', default: 0 },
			{ key: 'SwMacro', type: 'uint8', default: 0, bits: {
				macro1: 0,
				macro2: 1,
				macro3: 2,
				macro4: 3,
				macro5: 4,
				macro6: 5,
				macro7: 6,
				macro8: 7
			} },
			{ key: 'SwRemote', type: 'uint8', default: 0, bits: {
				remote1: 0,
				remote2: 1,
				remote3: 2,
				remote4: 3,
				remote5: 4,
				remote6: 5,
				remote7: 6,
				remote8: 7
			}},
			{ key: 'Spare', type: 'skip', size: 3 },
			{ key: 'Style', type: 'uint8', default: 0 },
			{ key: 'MAC', type: 'array', size: 6 },
			{ key: 'BindIp', type: 'ip', default: '0.0.0.0' },
			{ key: 'BindIndex', type: 'uint8', default: 0 },
			{ key: 'Status2', type: 'uint8', default: 0, bits: {
				supportsWebConfig: 0,
				dhcpEnabled: 1,
				dhcpCapable: 2,
				artnetSacnSwitchable: 4,
				squawking: 5
			} },
			{ key: 'Filler', type: 'skip', size: 26 }

		]
	});

	protocol.defineMessage('ArtIpProg', {
		schema: [
			role.ID,
			role.opcode(0xf800),
			role.version,
			{ key: 'Filler1', type: 'int8', static: true, default: 0 },
			{ key: 'Filler2', type: 'int8', static: true, default: 0 },
			{ key: 'Command', type: 'uint8' },
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
