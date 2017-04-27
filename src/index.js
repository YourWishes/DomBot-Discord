'use strict';

//Imports
const Discord = require('discord.js');

const config = require('./../config/config.json');
const commands = require('./commands/index.js');
const music = require('./music');
const DomBot = require('./bot/DomBot');

//First we are going to get and confirm our configuration files
if(!config || !config.credentials) {
	throw new Error('Invalid Configuration');
}

if(!config.credentials.client) throw new Error('Missing Client ID in config.json');
if(!config.credentials.token) throw new Error('Missing Token ID in config.json');

//Configuration is ok, now make the bot
const discordClient = new Discord.Client();
commands.loadCommands();
music.setup();


/*
 *
 * DISCORD API EVENTS
 *
 */
discordClient.on('ready', () => {
	console.log('Discord bot ready.');
	//Join the Guilds
	let message = "\n===Joining servers===\n";
	discordClient.guilds.forEach(function(guild) {
		message += " - " + guild.name + "\n";//Append our friendly log
		
		//Make our Guild object (sorta injected data)
		if(!guild.dombot) {
			let dombot = new DomBot(guild);
		}
		
		//Iterate over the channels
		guild.channels.forEach(function(channel) {
			//If it's an available voice channel...
			if(
				!guild.dombot.connecting &&
				!guild.dombot.connection &&
				channel instanceof Discord.VoiceChannel &&
				channel.joinable &&
				channel.speakable
			) {
				//Confirm whether this is one of the channels in the config we want to join
				let found = false;
				for(let i = 0; i < config.chat.voiceChannels.length; i++) {
					if(config.chat.voiceChannels[i] != channel.id) continue;
					found = true;
					break;
				}
				if(!found) return;
				
				//Start Connecting, make it thread safe(ish)
				guild.dombot.connecting = true;
				channel.join().then(connection => {
					//Connected successfully!
					connection.channel.guild.dombot.onChannelConnect(connection);
				});
			}
		});
	});
	//Print the log
	console.log(message);
});

//Listen for Discord messages
discordClient.on('message', message => {
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
});

//Connect the bot (main thread)
discordClient.login(config.credentials.token);