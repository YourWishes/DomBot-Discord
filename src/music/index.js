'use strict';

const utils = require('./../utils');

const songRequestQueue = [];
let musicTask;

module.exports = {
	setup: function() {
		musicTask = setInterval(() => {
			this.tick();
		}, 1000);
	},
	
	tick: function() {
		//Performed once every 1000ms
		for(var i = 0; i < songRequestQueue.length; i++) {
			songRequestQueue[i].tick();
		}
	},
	
	addSongRequest: function(songRequest) {
		if(songRequestQueue.contains(songRequest)) return;
		songRequestQueue.push(songRequest);
	},
	
	removeSongRequest: function(songRequest) {
		songRequestQueue.remove(songRequest);
	},
	
	getSongQueue: function() {return songRequestQueue;}
};