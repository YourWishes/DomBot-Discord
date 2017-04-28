const commands = require('./../index.js');

module.exports = {
    label: "help",
    aliases: ["?"],
	description: "Gets help about the bot, or a specific command!",
	args: [
		{
			name: "command",
			optional: true,
			description: "Get help for a specific command."
		}
	],
    command: function(label, args, scope) {
		//Generic Help, print all the available commands
		if(args.length < 1) {		
			let message = ":nerd: The following commands are available:```\n";
			let cmds = commands.getCommands();
			for(var i = 0; i < cmds.length; i++) {
				message += commands.getCommandPrefix() + cmds[i].label + (i < cmds.length-1 ? ", " : "");
			}
			message += "```Type `!help` followed by the name of a command, e.g. `!help play` to get help for a specific command.\n";
			message += "\nFor additional help with the bot visit the github page: <https://github.com/YourWishes/DomBot-Discord>";
			return {type: "reply", message: message};
		}
		
		//Complicated help?
		let cmdFind = args[0];
		let helpCommand = commands.findCommand(cmdFind);
		
		if(!helpCommand) return {type:"reply", message: "Couldn't find that command :thinking: try just `"+commands.getCommandPrefix()+"help` instead."};
		
		let message = "Help available for " + commands.getCommandPrefix() + helpCommand.label + ": \n```";
		let msgArgs = "";
		if(helpCommand.description) message += helpCommand.description + "\n";
		message += "Usage: " + commands.getCommandPrefix() + cmdFind;
		if(helpCommand.args && helpCommand.args.length > 0) {
			message += " ";
			msgArgs += "Parameters: \n";
			for(var i = 0; i < helpCommand.args.length; i++) {
				let arg = helpCommand.args[i];
				msgArgs += commands.getTab() + arg.name;;
				if(arg.optional) {
					message += "(" + arg.name + ")";
					msgArgs += " (Optional)";
				} else {
					message += "[" + arg.name + "]";
					msgArgs + " (Required)";
				}
				if(i < helpCommand.length-1) { message += " ";msgArgs +="\n";}
				if(arg.description) msgArgs += " - " + arg.description;
			}
		}
		message += "\n";
		if(msgArgs.length > 0) message += msgArgs + "\n";
		message += "\n";
		
		if(helpCommand.aliases && helpCommand.aliases.length > 0) message += "Aliases: " + commands.getCommandPrefix() + helpCommand.aliases.join(", " + commands.getCommandPrefix()) + "\n";
		
		message += "```";
		
		return {type: "reply", message: message};
    }
};