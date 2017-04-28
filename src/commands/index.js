'use strict';

const utils = require('./../utils/index.js');
const fs = require('fs');
const path = require('path');
const config = require('./../../config/config.json');

const commandsDir = './bot_commands/';
const botCommands = [];

module.exports = {
    loadCommands: function() {
        botCommands.clear();

		var dir = path.resolve(__dirname,commandsDir);
        
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        
        let commandFiles = fs.readdirSync(dir);
        for(var i = 0; i < commandFiles.length; i++) {
            let cmdFile = commandFiles[i];
            let cmd = require(commandsDir+cmdFile.replace(".js", ""));
            //Validate command
            if(!cmd || !cmd.label || !cmd.command || typeof cmd.command !== 'function') {
                console.log("Invalid Command " + cmdFile + "!");
                continue;
            }
			console.log('Registered command "' + cmd.label + '"');
            botCommands.push(cmd);
        }
    },
    
    getCommands: function() {
        return botCommands;
    },
	
	getCommandPrefix: function() {
		return config.chat.commandPrefix;
	},
	
	getTab: function() {
		return "    ";
	},
	
	findCommand: function(command) {
        let cmdLower = command.toLowerCase();
        let tryCommand = undefined;
        
        for(var i = 0; i < botCommands.length; i++) {
            let cmd = botCommands[i];
            if(cmd.enabled == false) continue;
            
            if(cmd.label.toLowerCase() == cmdLower) {
                tryCommand = cmd;
                break;
            }
            
            if(!cmd.aliases) continue;
            for(var x = 0; x < cmd.aliases.length; x++) {
                let alias = cmd.aliases[x];
                if(alias.toLowerCase() != cmdLower) continue;
                tryCommand = cmd;
                break;
            }
        }
		return tryCommand;
	},
	
	prettyCommand: function(command, args) {
		return this.getCommandPrefix() + command + (args.length > 0 ? " " : "") + args.join(' ');
	},
    
    handleCommand: function(scope, message, command, args) {
		//Check if this is an allowed channel...
		if(!config || !config.chat || !config.chat.textChannels) return;
		let allowedChannel = false;
		for(let i = 0; i < config.chat.textChannels.length; i++) {
			if(config.chat.textChannels[i] != scope.channel.id) continue;
			allowedChannel = true;
			break;
		}
		if(!allowedChannel) return;
        
        //First try to find the command that matches this label
        let tryCommand = this.findCommand(command);
        if(!tryCommand) return;
		
		console.log("$"+scope.guild.name+"#"+scope.channel.name+"@"+scope.member.displayName+" "+this.prettyCommand(command, args));
        
        //Update Scope
        let response = tryCommand.command(command, args, scope);
        if(!response) return;//The string is empty
		if(typeof response === typeof "" || response.type == "message") {//Response is a string
			if(response.length < 1) return;
			let message = response;
			if(response.type == "message") message = response.message;//If response is an object it's response.message we need to use.
			scope.channel.sendMessage(message);
		} else {
			if(response.type == "permission") {
				scope.reply("Sorry you don't have permission to do this. :worried:");
				return;
			}
			if(!response.message || response.message.length < 1) return;
			
			if(response.type == "reply") {
				scope.reply(response.message);
			}
		}
    }
}