'use strict';

//Imports
const DomBotClient = require('./bot/DomBotClient');

let client = new DomBotClient();
client.autorestart = true;
client.login();