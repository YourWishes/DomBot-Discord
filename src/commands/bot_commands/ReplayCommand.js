const SongRequest = require('./../../music/SongRequest');
const utils = require('./../../utils');

module.exports = {
    label: "replay",
    aliases: ["replay", "requeue"],
	description: "Simply requeues the last played song, if it is not playing.",
    command: function(label, args, scope) {
		let guild = scope.channel.guild;
		if(!guild.dombot.connection) {
			return {type: "reply", message: "Not in a voice channel."};
		}
		if(!guild.dombot.playing || guild.dombot.playing.isPlaying()) {
			return {type: "reply", message: "Cannot replay song!"};
		}
		guild.dombot.playing.queue();
    }
};