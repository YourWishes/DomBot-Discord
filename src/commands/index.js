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
		
        let cmdLower = command.toLowerCase();
        
        //First try to find the command that matches this label
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
        
        if(!tryCommand) return;
        
        //Update Scope
        let response = tryCommand.command(command, args, scope);
        if(!response) return;//The string is empty
		if(typeof response === typeof "" || response.type == "message") {//Response is a string
			if(response.length < 1) return;
			let message = response;
			if(response.type == "message") message = response.message;
			scope.channel.sendMessage(message);
		} else {
			if(!response.message || response.message.length < 1) return;
			
			if(response.type == "reply") {
				scope.reply(response.message);
			}
		}
    }
}