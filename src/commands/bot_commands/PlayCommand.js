const SongRequest = require('./../../music/SongRequest');
const utils = require('./../../utils');

module.exports = {
    label: "play",
    aliases: ["sr", "p", "song", "request"],
    command: function(label, args, scope) {
		let guild = scope.channel.guild;
		if(!guild.dombot.connection) {
			return {type: "reply", message: "Not in a voice channel."};
		}
		
		if(args.length < 1) {
			return {type: "reply", message: "Please enter a YouTube URL or ID"};
		}
		
		let connection = guild.dombot.connection;
		
		//Alright let's try to queue the YouTube video
		let id = args[0];
        if(id.startsWith("http") || id.startsWith("www")) {
            id = utils.getQueryVariable("v", id);
        }
		
		let request = new SongRequest(id, scope);
		request.queue();
    }
};