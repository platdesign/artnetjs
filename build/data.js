'use strict';

const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');

const OEMCsvFile = path.resolve('raw-data', 'oem-codes.csv');
const OEMJsonFile = path.resolve('lib', 'data', 'oem.json');



fs.readFile(OEMCsvFile, 'utf8', (err, contents) => {

	if(err) {
		throw err;
	}

	parse(contents, { columns: true, skip_empty_lines: true }, function(err, output){
		if(err) {
			throw err;
		}

		let objects = output.map(item => {
			delete item[''];
			delete item['Source code'];
			delete item['Case Source'];
			return item;
		});

		fs.writeFile(OEMJsonFile, JSON.stringify(objects), 'utf8', err => {
			if(err) {
				throw err;
			}
		});

	});
});



