const commands = require('./../index.js');

module.exports = {
    label: "help",
    aliases: ["?"],
    command: function(label, args, scope) {
		let message = "```The following commands are available:\n";
		let cmds = commands.getCommands();
		for(var i = 0; i < cmds.length; i++) {
			message += commands.getCommandPrefix() + cmds[i].label + (i < cmds.length-1 ? ", " : "");
		}
		message += "```";
		return {type: "reply", message: message};
    }
};