const SongRequest = require('./../../music/SongRequest');
const utils = require('./../../utils');

module.exports = {
    label: "shuffle",
    aliases: [],
	description: "Shuffles the song queue.",
    command: function(label, args, scope) {
		let guild = scope.channel.guild;
		let dombot = guild.dombot;
		let queue = dombot.getSongQueue();
		if(queue.length < 1) return {type: "reply", message: "No songs to shuffle. :thinking:"};
		if(queue.length == 1) return {type: "reply", message: "Can't shuffle one song? :thinking:"};
		
		dombot.shuffleQueue();
		//TODO: Maybe vote shuffles?
		
		return {type: "reply", message: "*shuffle shuffle shuffle* :game_die:"};
    }
};