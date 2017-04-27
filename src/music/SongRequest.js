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
			let funcSucc = function(req,d) {
				if(d.livestream && d.livestream == 1) {
					req.message.reply("Sorry, but livestream's cannot be played (yet) :confounded:");
					return;
				}
				
				req.data = d;
				req.message.reply(d.title + " has been queued.");
				music.addSongRequest(req);
			}
			let funcBad = function(req,d,d1) {
				let message = "An error occured! :confounded: sorry about that, your song has been skipped.\n```javascript\n";
				message += d;
				message += "```";
				req.message.reply(message);
			}
			let req = ytdl.getInfo(this.getURL(), {filter : 'audioonly'}).then(funcSucc.bind(null, this)).catch(funcBad.bind(null, this));
		} catch(e) {
			let message = "An error occured! :confounded: sorry about that, your song has been skipped.\n```javascript\n";
			message += e;
			message += "```";
			this.message.reply(message);
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
			
			this.stream = ytdl(this.getURL(), {filter : 'audioonly'});
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
		this.message.reply("Your song \"" + this.data.title + "\" is now playing!");
		console.log("Playing " + this.data.title + " in Discord " + this.message.guild.name + " - " + this.message.guild.dombot.connection.channel.name);
		this.unqueue();
	}
	
	onEnd() {
		this.playing = false;
	}
}