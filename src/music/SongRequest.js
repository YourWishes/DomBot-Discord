'use strict';

const music = require('./index.js');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const songsDir = './songs/';

module.exports = class SongRequest {
    constructor(youtube_id, message) {
		this.id = youtube_id;
		this.message = message;
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
					req.message.reply(message);
					return;
				}
				
				if(d.livestream && d.livestream == 1) {
					req.message.reply("Sorry, but livestream's cannot be played (yet) :confounded:");
					return;
				}
				
				req.data = d;
				req.message.reply(d.title + " has been queued.");
				music.addSongRequest(req);
			}
			ytdl.getInfo(this.getURL(), {filter : 'audioonly'}, funcSucc.bind(null, this));//Bind the SongRequest object to the function.
			
		} catch(e) {
			let message = "An error occured! :confounded: sorry about that, your song has been skipped.\n```javascript\n";
			message += e;
			message += "```";
			this.message.reply(message);
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
		if(!this.message.guild || !this.message.guild.dombot) {
			this.unqueue();
			return;
		}
		if(this.message.guild.dombot.playing && this.message.guild.dombot.playing.isPlaying()) return;
		this.play();
	}
	
	isPlaying() {
		return this.playing;
	}
	
	play() {
		if(!this.message.guild || !this.message.guild.dombot || !this.message.guild.dombot.connection) return;
		this.playing = true;
		this.unqueue();
		
		try {
			let dombot = this.message.guild.dombot;
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
			this.message.reply(message);
			return;
		}
	}
	
	//Events
	onStart() {
		this.message.reply("Your song \"" + this.data.title + "\" is now playing! :musical_note:");
		console.log("Playing " + this.data.title + " in Discord " + this.message.guild.name + " - " + this.message.guild.dombot.connection.channel.name);
		this.unqueue();
	}
	
	onEnd() {
		this.playing = false;
	}
}