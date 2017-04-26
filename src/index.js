'use strict';

//Imports
const Discord = require('discord.js');

const config = require('./../config/config.json');
const commands = require('./commands/index.js');
const music = require('./music');

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

discordClient.on('ready', () => {
	console.log('Discord bot ready.');
	let message = "===Joining servers===\n";
	discordClient.guilds.forEach(function(guild) {
		if(!guild.dombot) {
			guild.dombot = {
				connecting: false,
				volume: 0.5
			};
			if(config.chat && config.chat.volume) guild.dombot.volume = config.chat.volume;
			guild.dombot.guild = guild;
			guild.getSongQueue = function() {
				let queue = [];
				music.getSongQueue().forEach(function(songRequest) {
					if(!songRequest || !songRequest.message || !songRequest.message.guild || !songRequest.message.guild.id) return;
					if(songRequest.message.guild.id != this.id) return;
					queue.push(songRequest);
				});
				return queue;
			}
		}
		
		message += " - " + guild.name + "\n";
		
		guild.channels.forEach(function(channel) {
			if(
				!guild.dombot.connecting &&
				!guild.dombot.connection &&
				channel instanceof Discord.VoiceChannel &&
				channel.joinable &&
				channel.speakable
			) {
				//check if this is one of the channels to join
				let found = false;
				for(let i = 0; i < config.chat.voiceChannels.length; i++) {
					if(config.chat.voiceChannels[i] != channel.id) continue;
					found = true;
					break;
				}
				if(!found) return;
				
				guild.dombot.connecting = true;
				channel.join().then(connection => {
					guild.dombot.connecting = false;
					guild.dombot.connection = connection;
					console.log("Joined channel " + connection.channel.name);
				});
			}
		});
	});
	discordClient.user.setGame("with underage girls.");
	console.log(message);
});

discordClient.on('message', message => {
	if(!config.chat || !config.chat.commandPrefix) return;
	if(message.content.startsWith(config.chat.commandPrefix)) {
		//Got a command, send it to the cmd manager
		let m = message.content.substring(config.chat.commandPrefix.length);//Remove the command prefix
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