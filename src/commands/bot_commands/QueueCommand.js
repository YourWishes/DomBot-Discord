module.exports = {
    label: "queue",
    aliases: ["q", "songs", "list"],
    command: function(label, args, scope) {
		let guild = scope.channel.guild;
		
		let queue = guild.dombot.getSongQueue();
		
		let count = queue.length;
		if(guild.dombot.playing && guild.dombot.playing.isPlaying()) count ++;
		
		let message = "";
		if(count > 0) {
			message = "There "+(count >1?"are ":"is ")+count+" song"+(count>1?"s":"")+" in the list.\n";
			if(guild.dombot.playing && guild.dombot.playing.isPlaying()) {
				message += "Currently playing " + guild.dombot.playing.data.title;
			}
			for(var i = 0; i < queue.length; i++) {
				if(!queue[i].data.title) continue;
				message += queue[i].data.title + " - Requested by " + queue[i].message.member.displayName + "\n";
			}
		} else {
			message = "There are no songs in the queue. Add one with !play";
		}
		
		return {type:"reply",message:message};
    }
};