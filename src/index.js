'use strict';

//Imports
const process = require('process');
const fs = require('fs');
const DomBotClient = require('./bot/DomBotClient');

process.on('uncaughtException', (err) => {
	if(fs.existsSync('error.log')) fs.unlinkSync('error.log');
	fs.writeFileSync('error.log', err.stack);
	console.log("ERROR UNCAUGHT EXCEPTION!!");
	process.exit(1);
});

try {
	let client = new DomBotClient();
	client.login();
} catch(e) {
	console.log(e);
} 