'use strict'
const Discord = require('discord.js');

const config = require('./../../config/config.json');
const music = require('./../music');
const ffmpeg = require('fluent-ffmpeg');

/*
 *	I need to clear up the difference between DomBot and DomBotClient
 *	You can think of DomBot (this class) as an individual DomBot for each Guild
 * (Discord Server) that DomBotClient (The application itself) is connected to
 */
module.exports = class DomBot {
	constructor(guild) {
		guild.dombot = this;
		
		this.guild = guild;
		this.connecting = false;
		this.volume = 0.5;
		if(config.chat && config.chat.volume) this.volume = config.chat.volume;
	
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
	}
	
	getDiscordClient() {
		return this.guild.client;
	}
	
	getMember() {
		return this.guild.member(this.getDiscordClient().user);
	}
	
	getDomBotClient() {return this.getDiscordClient().dombot;}
	
	getSongQueue() {//Try and cache this result when you call this function
		let queue = [];
		for(var i = 0; i < music.getSongQueue().length; i++) {
			let songRequest = music.getSongQueue()[i];
			if(!songRequest || !songRequest.message || !songRequest.message.guild || !songRequest.message.guild.id) return;
			if(songRequest.message.guild.id != this.guild.id) return;
			songRequest.index = i;
			queue.push(songRequest);
		}
		return queue;
	}
	
	shuffleQueue() {
		let ogQueue = this.getSongQueue();//Get the current queue order
		let queue = ogQueue.clone().shuffle();//Shuffle the queue order to a new array
		for(var i = 0; i < queue.length; i++) {
			//Iterate over the shuffled array
			//Set the song in the master queue at the original song's index to be the new song.
			//...I shoulda worded that better but that's the best I can do
			music.getSongQueue()[ogQueue[i].index] = queue[i];
		}
	}
	
	setVolume(vol) {
		vol = Math.min(Math.max(0, vol), 1);//Clamp
		this.volume = vol;
		if(this.playing) this.playing.setVolume(this.volume);
	}
	
	canTalkInTextChannel(channel) {
		if(channel.type != "text") return false;
		let allowedChannel = false;
		for(let i = 0; i < config.chat.textChannels.length; i++) {
			if(config.chat.textChannels[i] != channel.id) continue;
			allowedChannel = true;
			break;
		}
		return allowedChannel;
	}
	
	getAvailableTextChannel() {
		if(!this.guild) return;
		if(!this.guild.channels || this.guild.channels.length < 1) return;
		let arr = this.guild.channels.array();
		for(var i = 0; i < arr.length; i++) {
			if(this.canTalkInTextChannel(arr[i])) return arr[i];
		}
	}
	
	sendMessage(message) {
		//Sends a message to whatever available text channel there is, if I can't talk I won't.
		let channel = this.getAvailableTextChannel();
		if(!channel) return false;
		channel.sendMessage(message);
	}
	
	reply(member, message) {
		this.sendMessage("@"+member.displayName + ", " + message);
	}
	
	disconnect() {
		//Disconnects from the voice channel
		this.connecting = false;
		try {
			if(this.connection) this.connection.disconnect();
		} catch(e) {
			console.error(e);
		}
		this.connection = undefined;
	}
	
	/*** EVENTS ***/
	//Handle connecting to channels (may be done by the main thread, or may be done by the summon command as an example)
	onChannelConnect(connection) {
		this.connecting = false;
		this.connection = connection;
		console.log("Joined channel \"" + connection.channel.name + "\" in server \"" + connection.channel.guild.name + "\".");
		
		//Add some event listeners for timeouts, and errors
		connection.on('error', function(error) {
			let dombot = this.channel.guild.dombot;
			dombot.onConnectionError(this, error);
		});
		
		connection.on('disconnect', function() {
			let dombot = this.channel.guild.dombot;
			dombot.onConnectionDisconnect(this);
		});
		
		connection.on('debug', function(e) {
			//console.log(e);
		});
		
		//For DomBot Audio Recognition (HIGHLY EXPERIMENTAL)
		if(this.getDomBotClient().GoogleSpeech) {
			this.connectionReceiver = connection.createReceiver();
			this.connectionReceiver.on('warn', function() {
				console.log("Reciever error");
			});
			
			//Alright we have made a voice reciever! Now we need to start spying
			//on clients.
			let members = connection.channel.members.array();
			for(var i = 0; i < members.length; i++) {
				this.createVoiceThing(members[i]);
			}
		}
	}
	
	createVoiceThing(user) {
		if(!user || !user.voiceChannel) return;
		//Make sure we aren't making one for ourself...
		if(user.id === this.getMember().id) return;
		
		console.log("Making new voice thing for user: " + user.displayName);
		let pcmStream = this.connectionReceiver.createPCMStream(user);//So this is the stream
		
		//I'm going to make some "probably's" here, just the idea of stuff he may know
		let probably = [
			"dombot",
			"dom",
			"discord",//Cuz.. Discord
			"him",//Incase they mean the bot, he is a guy after all :^)
			"bot",
			"diva",
			"may"
		];
		
		//Config used for google's speech API
		const request = {
			config: {
				encoding: "FLAC",
				sampleRateHertz: 48000,
				languageCode: "en-AU",
				verbose: true,
				phrases:probably
			},
			interimResults: false // If you want interim results, set this to true
		};
		
		//Make an FFMPEG Command, we take in the Discord.JS Linear PCM 32-bit 48khz audio stream (dual channel)
		//And convert to the above format.
		
		//First, here are the handlers, we bind some stuff as well
		let ffmpegError = function(dombot, user, pcmStream, recognize, command, error) {
			try {pcmStream.close();} catch(e) {}//Force close the stream, safe
			try {dombot.createVoiceThing(user);} catch(e) {}//This may StackOverflow, will try threading
			console.log("oh no, an error occured!");
			console.log(e);
		}
		
		let ffmpegEnd = function(dombot, user, pcmStream, recognize, command) {
			try {dombot.createVoiceThing(user);} catch(e) {}//This may StackOverflow, will try threading later.
		}
		
		let recData = function(dombot, user, pcmStream, recognize, command, data) {
			if(data.results && typeof data.results === typeof "") {
				console.log(user.displayName + ": " + data.results);
				dombot.onTextToSpeech(user, data.results, data);
			}
		}
		
		let command = ffmpeg();
		let recognize = this.getDomBotClient().GoogleSpeech.createRecognizeStream(request);
		
		command.input(pcmStream).fromFormat('s32le').audioFrequency(48000).audioChannels(2)
			.toFormat('flac')
			.audioFrequency(48000)
			.audioChannels(1)
			.on('error', ffmpegError.bind(null, this, user, pcmStream, recognize, command))
			.on('end', ffmpegEnd.bind(null, this, user, pcmStream, recognize, command))
			.pipe(recognize).on('data', recData.bind(null, this, user, pcmStream, recognize, command)).on('error', function(e) {
				console.log("Error");
				console.log(e);
			});
	}
	
	onTextToSpeech(user, message, data) {
		console.log(user.displayName + ": " + message);
	}
	
	onConnectionError(connection, error) {
		//Called when there is a connection error.
		console.log(error);
		this.sendMessage("```" + error + "```");
		this.disconnect();
	}
	
	onConnectionDisconnect(connection) {
		console.log("Disconnected from channel \"" + connection.channel.name + "\" in server \"" + connection.channel.guild.name + "\".");
		this.connecting = false;
		this.connection = undefined;
	}
}