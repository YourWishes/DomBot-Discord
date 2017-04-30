'use strict';

//Imports
const DomBotClient = require('./bot/DomBotClient');

try {
	let client = new DomBotClient();
	client.autorestart = true;
	client.login();
} catch(e) {
	console.log(e);
}