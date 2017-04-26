const SongRequest = require('./../../music/SongRequest');
const utils = require('./../../utils');

module.exports = {
    label: "skip",
    aliases: [],
    command: function(label, args, scope) {
		let guild = scope.channel.guild;
		if(!guild.dombot.playing || !guild.dombot.playing.isPlaying()) {
			return {type: "reply", message: "Not playing anything."};
		}
		
		//TODO: Vote Skips
		guild.dombot.playing.skip();
		return {type: "reply", message: "Skipping song."};
    }
};