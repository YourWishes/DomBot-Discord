const Discord = require('discord.js');

const utils = require('./../utils');
const DomBot = require('./DomBot');
const commands = require('./../commands/index.js');
const music = require('./../music');
const fs = require('fs');

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
		//Check config, we NEED discord so this is important
		if(!config || !config.tokens) throw new Error("Configuration is missing tokens");
		if(!config.tokens.discord) throw new Error("Configuration is missing Discord tokens");
		
		//We are going to make an express server (optional)
		if(config.server) {
			let DomBotExpress = require('./DomBotExpress');
			this.express = new DomBotExpress(this, config);
		}
		
		//Create our discord client
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
		
		//Now we are going to setup the YouTube API (Optional)
		if(config.tokens.youtube) {
			if(!config.tokens.youtube.id) throw new Error("Missing YouTube Client ID in the configuration.");
			if(!config.tokens.youtube.secret) throw new Error("Missing YouTube Client Secret in the configuration.");
			if(!config.tokens.youtube.redirect) throw new Error("Missing YouTube redirect in the configuration.");
			
			let Youtube = require("youtube-api");
			
			//YouTube tokens
			this.ytOauth = Youtube.authenticate({
				type: "oauth"
				, client_id: config.tokens.youtube.id
				, client_secret: config.tokens.youtube.secret
				, redirect_url: config.tokens.youtube.redirect
			});
			//Inject function, saves some work
			this.ytOauth.isDomBotReady = function() {
				return this.credentials && this.credentials['access_token'] && this.credentials['access_token'].length > 0;	
			}
			
			this.ytAuthURL = this.ytOauth.generateAuthUrl({
				access_type: "offline",
				scope: ["https://www.googleapis.com/auth/youtube"]
			});
			
			
			if(fs.existsSync('./tokens/youtube.json')) {
				console.log("Found existing YouTube Authorization.");
				this.ytOauth.setCredentials(JSON.parse(fs.readFileSync('./tokens/youtube.json', 'utf8')));
				//TODO: Validate tokens.
			}
		}
		
		
		if(config.voice && config.voice.enable) {
			if(!config.tokens || !config.tokens.google) throw new Error("Cannot do voice without Google tokens!");
			if(!config.tokens.google.projectId || !config.tokens.google.keyFileName) throw new Error("Missing Project ID or Key File Name for Google tokens!");
			
			this.GoogleSpeech = require('@google-cloud/speech')({
				projectId: config.tokens.google.projectId,
				keyFilename: config.tokens.google.keyFileName
			});
		}
	}
	
	login() {
		this.discordClient.login(config.tokens.discord.token);
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
		if(this.express) {
			this.express.disconnect();
		}
		
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