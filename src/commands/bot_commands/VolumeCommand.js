module.exports = {
    label: "volume",
    aliases: ["vol", "setvolume", "setvol"],
    command: function(label, args, scope) {
		let guild = scope.channel.guild;
		let dombot = guild.dombot;
		
		if(args.length == 0) {
			return {type:"reply", message: "Current volume is `" + parseInt(dombot.volume*100.0) + "%`"};
		}
		
		let vol = parseFloat(args[0]);
		if(!vol) {
			return {type: "reply", message: "Volume must be a valid number."}
		}
		
		if(vol < 0 || vol > 100) {
			return {type:"reply", message:"Volume must be a number between 0 and 100"};
		}
		dombot.volume = vol/100.0;
		
		if(dombot.playing) dombot.playing.setVolume(dombot.volume);
		
		return {type:"reply",message:"Volume set to `" + parseInt(dombot.volume*100.0) + "%`"};
    }
};