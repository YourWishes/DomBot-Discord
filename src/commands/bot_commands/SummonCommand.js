const SongRequest = require('./../../music/SongRequest');
const utils = require('./../../utils');

module.exports = {
    label: "summon",
    aliases: ["join"],
    command: function(label, args, scope) {
		if(!scope.member) return;
		if(!scope.member.voiceChannel) {
			return {type: "reply", message: "You are not in a voice channel."};
		}
		if(!scope.member.voiceChannel.joinable) {
			return {type: "reply", message: "I cannot join that channel."};
		}
		if(!scope.member.voiceChannel.speakable) {
			return {type: "reply", message: "I cannot speak in that channel."};
		}
		
		scope.member.voiceChannel.join().then(connection => {
			connection.channel.guild.dombot.onChannelConnect(connection);
		});
    }
};