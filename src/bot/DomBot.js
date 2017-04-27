'use strict'

const config = require('./../../config/config.json');
const music = require('./../music');

module.exports = class DomBot {
	constructor(guild) {
		guild.dombot = this;
		
		this.connecting = false;
		this.volume = 0.5;
		if(config.chat && config.chat.volume) this.volume = config.chat.volume;
	}
	
	getSongQueue() {
		let queue = [];
		for(var i = 0; i < music.getSongQueue().length; i++) {
			let songRequest = music.getSongQueue()[i];
			if(!songRequest || !songRequest.message || !songRequest.message.guild || !songRequest.message.guild.id) return;
			if(songRequest.message.guild.id != this.guild.id) return;
			queue.push(songRequest);
		}
		return queue;
	}
	
	/*** EVENTS ***/
	//Handle connecting to channels (may be done by the main thread, or may be done by the summon command as an example)
	onChannelConnect(connection) {		
		this.connecting = false;
		this.connection = connection;
		console.log("Joined channel \"" + connection.channel.name + "\" in server \"" + connection.channel.guild.name + "\".");
	}
}