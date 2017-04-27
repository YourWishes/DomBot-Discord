'use strict'

const config = require('./../../config/config.json');
const music = require('./../music');

module.exports = class DomBot {
	constructor(guild) {
		guild.dombot = this;
		
		this.guild = guild;
		this.connecting = false;
		this.volume = 0.5;
		if(config.chat && config.chat.volume) this.volume = config.chat.volume;
	}
	
	getDiscordClient() {
		return this.guild.client;
	}
	
	getMember() {
		return this.guild.member(this.getDiscordClient().user);
	}
	
	getSongQueue() {//Try and cache this result when you call this function
		let queue = [];
		for(var i = 0; i < music.getSongQueue().length; i++) {
			let songRequest = music.getSongQueue()[i];
			if(!songRequest || !songRequest.message || !songRequest.message.guild || !songRequest.message.guild.id) return;
			if(songRequest.message.guild.id != this.guild.id) return;
			queue.push(songRequest);
		}
		return queue;
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
			console.log(e);
		});
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