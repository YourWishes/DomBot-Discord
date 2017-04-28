module.exports = {
    label: "restart",
    aliases: ["shutdown"],
	description: "Shuts down, and restarts the bot.",
    command: function(label, args, scope) {
		let member = scope.member;
		
		//Is an admin?
		if(!member.isDomBotAdmin()) {
			return {type: "permission"};
		}
		
		let guild = scope.channel.guild;
		let dombot = guild.dombot;
		
		//We're going to make a future.
		let simpleRestartFunction = function(dombot) {
			try {
				dombot.getDiscordClient().destroy();
				console.log("Bot was requested to restart.");
			} catch(e) {
				//Failed to restart? Since this is a future the bot may've already disconnected.
			}
		}
		setTimeout(simpleRestartFunction.bind(null, dombot), 1000);
		return {type:"reply",message:"BRB! :wave:"};
    }
};