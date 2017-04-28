const Discord = require('discord.js');
const Youtube = require("youtube-api")

const utils = require('./../utils');
const DomBot = require('./DomBot');
const commands = require('./../commands/index.js');
const music = require('./../music');

let config = utils.rerequire('./../../config/config.json');

/*
 * DISCORD CUSTOM API
 */
if(typeof Discord.GuildMember.prototype.isDomBotAdmin !== "function") {
	Discord.GuildMember.prototype.isDomBotAdmin = function() {
		if(!config || !config.security) return false;
		if(config.security.owner) {
			if(this.id == config.security.owner) return true;
		}
		if(!config.security.admins || typeof config.security.admins !== typeof []) return false;
		for(var i = 0; i < config.security.admins.length; i++) {
			if(config.security.admins[i] == this.id) return true;
		}
		return false;
	}
}

module.exports = class DomBotClient {
	//Throws error for configuration invalid-ness
	constructor(guild) {
		//Configuration ok (enough), Create our Discord Client
		this.discordClient = new Discord.Client();
		this.discordClient.dombot = this;//Inject some data
		
		//Init stuff
		commands.loadCommands();
		music.setup();
		
		//Register our events
		let orf = function(dombot) {dombot.onReady();}
		this.discordClient.on('ready', orf.bind(null,this));

		this.discordClient.on('guildCreate', guild => {
			if(!guild.dombot) {
				let dombot = new DomBot(guild);
			}
		});

		this.discordClient.on('message', message => {
			message.client.dombot.onMessage(message);
		});
		
		let odf = function(dombot,e) {dombot.onDisconnect(e);}
		this.discordClient.on('disconnect', odf.bind(null, this));
	}
	
	login() {
		//First we are going to get and confirm our configuration files
		if(!config || !config.credentials) {
			throw new Error('Invalid Configuration');
		}

		if(!config.credentials.client) throw new Error('Missing Client ID in config.json');
		if(!config.credentials.token) throw new Error('Missing Token ID in config.json');
		
		this.discordClient.login(config.credentials.token);
	}
	
	onReady() {
		console.log('Discord bot ready.');
		//Join the Guilds
		let message = "\n===Joining servers===\n";
		this.discordClient.guilds.forEach(function(guild) {
			message += " - " + guild.name + "\n";//Append our friendly log
			//Make our Guild object (sorta injected data)
			if(!guild.dombot) {
				let dombot = new DomBot(guild);
			}
		});
		//Print the log
		console.log(message);
	}
	
	onDisconnect(e) {
		if(this.autorestart) {
			config = utils.rerequire('./../../config/config.json');
			let client = new DomBotClient();
			client.autorestart = this.autorestart;
			client.login();//Not sure, this may cause a stack overflow at some point :thinking:
		}
	}
	
	onMessage(message) {
		//Is this a command? We need to pass it to the command manager if it is
		if(message.content.startsWith(commands.getCommandPrefix())) {
			//Got a command, send it to the cmd manager
			let m = message.content.substring(commands.getCommandPrefix().length);//Remove the command prefix
			if(m.length < 1) return;//Not a valid cmd
			let marr = m.split(' ');//Split by spaces
			let cmd = marr[0];
			let args = [];
			for(let i = 0; i < marr.length; i++) {
				if(i == 0) continue;
				args.push(marr[i]);
			}
			commands.handleCommand(message, message.content.substring(1), cmd, args);
		}
	}
}