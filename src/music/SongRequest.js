'use strict';

const music = require('./index.js');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const DomBot = require('./../bot/DomBot');

const songsDir = './songs/';

module.exports = class SongRequest {
    constructor(youtube_id, message_or_dombot, member_or_null) {
		this.id = youtube_id;
		if(message_or_dombot instanceof DomBot) {
			this.dombot = message_or_dombot;
		} else {
			this.message = message_or_dombot;
		}
		
		if(member_or_null) this.member = member_or_null;
    }
	
	sendReply(response) {
		//Sends a reply if this has a message, if it's a DomBot sends a "broadcast"
		if(this.message) {
			this.message.reply(response);
		} else {
			if(this.member) {
				response = "@"+this.member.displayName + ", " + response;
			}
			this.dombot.sendMessage(response);
		}
	}
	
	getDombot() {
		if(this.dombot) return dombot;
		return this.message.guild.dombot;
	}
	
	getGuild() {
		if(this.dombot) return dombot.guild;
		return this.message.guild;
	}
	
	queue() {
		try {
			//SUCC (Success)
			let funcSucc = function(req,err,d) {
				//Normal function is [error,info] but we prepend the req object for self referencing.
				if(!d || err) {
					let message = "An error occured! :confounded: sorry about that, your song has been skipped.\n```javascript\n";
					message += err;
					message += "```";
					req.sendReply(message);
					return;
				}
				
				if(d.livestream && d.livestream == 1) {
					req.sendReply("Sorry, but livestream's cannot be played (yet) :confounded:");
					return;
				}
				
				req.data = d;
				req.sendReply(d.title + " has been queued.");
				music.addSongRequest(req);
			}
			ytdl.getInfo(this.getURL(), {filter : 'audioonly'}, funcSucc.bind(null, this));//Bind the SongRequest object to the function.
			
		} catch(e) {
			let message = "An error occured! :confounded: sorry about that, your song has been skipped.\n```javascript\n";
			message += e;
			message += "```";
			this.sendReply(message);
			console.log(e);
			return;
		}
	}
	
	unqueue() {
		music.removeSongRequest(this);
	}
	
	getURL() {
		return 'https://www.youtube.com/watch?v='+this.id;
	}
	
	setVolume(volume) {
		if(this.dispatcher) {
			this.dispatcher.setVolume(volume*0.25);
		}
	}
	
	skip() {
		this.playing = false;
		this.dispatcher.end();
	}
	
	tick() {
		if(!this.getGuild() || !this.getDombot()) {
			this.unqueue();
			return;
		}
		if(this.getDombot().playing && this.getDombot().playing.isPlaying()) return;
		this.play();
	}
	
	isPlaying() {
		return this.playing;
	}
	
	play() {
		if(!this.getGuild() || !this.getDombot() || !this.getDombot().connection) return;
		this.playing = true;
		this.unqueue();
		
		try {
			let dombot = this.getDombot();
			dombot.playing = this;
			
			this.stream = ytdl.downloadFromInfo(this.data, {filter : 'audioonly'});
			this.dispatcher = dombot.connection.playStream(this.stream, {
				volume: dombot.volume*0.25
			});
			this.dispatcher.songRequest = this;
			
			this.dispatcher.once('end', function() {
				this.songRequest.onEnd();
			});
			
			this.dispatcher.on('start', function() {
				this.songRequest.onStart();
			});
		} catch(e) {
			let message = "An error occured! :confounded: sorry about that, your song has been skipped.\n```javascript\n";
			message += e;
			message += "```";
			this.sendReply(message);
			return;
		}
	}
	
	//Events
	onStart() {
		this.sendReply("Your song \"" + this.data.title + "\" is now playing! :musical_note:");
		console.log("Playing " + this.data.title + " in Discord " + this.getGuild().name + " - " + this.getDombot().connection.channel.name);
		this.unqueue();
	}
	
	onEnd() {
		this.playing = false;
	}
}