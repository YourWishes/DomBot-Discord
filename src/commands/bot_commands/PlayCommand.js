const SongRequest = require('./../../music/SongRequest');
const utils = require('./../../utils');

module.exports = {
    label: "play",
    aliases: ["sr", "p", "song", "request"],
	description: "Allows you to add a song to the queue to play in the voice channel.",
	args: [
		{
			name: "song",
			optional: false,
			description: "The song you wish to queue, either a YouTube video's ID, or URL."
		}
	],
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
			//Remove HTTP
			let k = id.replace("https", "").replace("http", "").replace("://", "");
			if(k.startsWith("youtu.be")) {//Fix youtu.be links
				//Converts it to be http://youtube.com/watch?v=[id]&t=2 (example, the user may also do a dumb URL)
				id = "http://youtube.com/watch?v=" + k.replace("youtu.be/", "").replace("?", "&");
			}
			
			//Extract the V variable from the query.
			id = utils.getQueryVariable("v", id);
			
			if(!id) {
				//Missing ID? Maybe a playlist (or one wasn't supplied...?)
				//Will add handling here properly
				return {type: "reply", message: "Invalid video link :thinking: I can only queue YouTube videos at the moment, sorry."};
			}
        }
		
		let request = new SongRequest(id, scope);
		request.queue();
    }
};