const SongRequest = require('./../../music/SongRequest');
const utils = require('./../../utils');

module.exports = {
    label: "summon",
    aliases: ["join"],
	description: "Makes the bot join the channel that you are in.",
    command: function(label, args, scope) {
		if(!scope.member) return;
		if(!scope.member.voiceChannel) {
			return {type: "reply", message: "You are not in a voice channel. :confused:"};
		}
		if(!scope.member.voiceChannel.joinable) {
			return {type: "reply", message: "I cannot join that channel. :slight_frown:"};
		}
		if(!scope.member.voiceChannel.speakable) {
			return {type: "reply", message: "I cannot speak in that channel. :slight_frown:"};
		}
		
		let dombot = scope.member.voiceChannel.guild.dombot;
		if(dombot.connection) {
			//Already in a channel
			//Why this way and not dombot.connection.channel ? Cuz if DomBot is moved (say by an admin) this wasn't working
			if(dombot.getMember().voiceChannel && dombot.getMember().voiceChannel.id === scope.member.voiceChannel.id) {
				return {type: "reply", message: "I'm already in that voice channel, dummy. :expressionless:"};
			}
			
			//Now switch channels.
			if(dombot.getMember().voiceChannel && dombot.getMember().voiceChannel.id !== dombot.connection.channel.id) {
				//This statement compares what channel the SERVER says the Bot is in, versus what the original VoiceConnection's channel says
				//Basically it means at some stage between joining the voice channel and now, the bot has swapped voice channels without ever disconnecting from the VoiceConnection
				//Likely moved by another user, such as an admin.
				//I want a way to replace this, but as of now there is no other way to join a channel after I have been moved.
				dombot.connection.channel.leave();
			}
			
			scope.member.voiceChannel.join().then(connection => {//Handle as normal
				connection.channel.guild.dombot.onChannelConnect(connection);
			});
		} else {
			//Not in a channel
			scope.member.voiceChannel.join().then(connection => {
				connection.channel.guild.dombot.onChannelConnect(connection);
			});
		}
    }
};