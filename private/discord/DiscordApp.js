// Copyright (c) 2018 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const Discord = require('discord.js');
const fs = require('fs');

const DomBotConnection = require('./../dombot/DomBotConnection');
const YouTubeStream = require('./../dombot/stream/YouTubeStream');
const CacheStore = require('./../cache/CacheStore');

const COMMANDS_DIRECTORY = 'commands';
const COMMAND_PREFIX = "!";

class DiscordApp {
  constructor(app) {
    this.app = app;

    //Commands
    this.commands = [];

    //DomBot voice Connections
    this.connections = [];

    //Discord Client
    this.client = new Discord.Client();

    //Various caching needs
    this.store = new CacheStore(app, 60 * 60 * 6); // Set TTL to 6 hours

    //Top Level Event Handlers...
    this.client.on('ready', () => this.onReady() );
    this.client.on('message', (msg) => {
      this.onMessage(msg).then(e => {}).catch((e) => {
        if(e) this.app.error(e);
      });
    });
  }

  getApp() { return this.app; }
  getClient() {return this.client;}
  getConfig() { return this.getApp().getConfig(); }
  getCommandPrefix() { return COMMAND_PREFIX; }

  getConnectionForChannel(channel) {
    for(let i = 0; i < this.connections.length; i++) {
      let c = this.connections[i];
      if(c.channel.id === channel.id) return c;
    }
  }

  getConnectionForGuild(guild) {
    for(let i = 0; i < this.connections.length; i++) {
      let c = this.connections[i];
      if(c.channel.guild.id == guild.id) return c;
    }
  }

  async init() {
    //Validate the config will be good for us.
    if(!this.getConfig().has('discord.client_id')) throw new Error('Missing Discord Client ID!');
    if(!this.getConfig().has("discord.token")) throw new Error("Missing Discord Token Configuration!");

    //Log in to the Discord Servers
    let x = await this.client.login(this.getConfig().get('discord.token'));

    //Load Commands
    let files = fs.readdirSync(__dirname + '/' + COMMANDS_DIRECTORY);
    files.forEach((file) => {
      let f = require('./' + COMMANDS_DIRECTORY + '/' + file);

      //Validate Command
      if(!f.label) throw new Error("Missing Command Label for " + file + "!");
      if(!f.command) throw new Error("Missing Command Function for " + file + "!");

      this.commands.push(f);
    });

    //For the sake of testing, and as a "oh cool it is working" for me I have
    //given DomBot a home where he will always live, even if there is no one
    //to talk to.
    this.client.guilds.forEach(guild => {
      guild.channels.forEach(channel => {
        if(channel.id != '306635995313340417') return;
        let connection = new DomBotConnection(this);
      });
    });
  }

  //Complex Gets
  getInviteURL(permissionLevel) {
    let base = 'https://discordapp.com/api/oauth2/authorize?';
    base += `client_id=${ encodeURIComponent(this.getConfig().get('discord.client_id')) }&`;
    base += 'scope=bot&';
    base += `permissions=${permissionLevel}`;
    return base;
  }

  getCommand(label) {
    label = label.toLowerCase();
    for(let i = 0; i < this.commands.length; i++) {
      let command = this.commands[i];
      if(command.label.toLowerCase() == label) return command;
      if(!command.aliases || !command.aliases.length) continue;

      for(let x = 0; x < command.aliases.length; x++) {
        if(command.aliases[x].toLowerCase() == label) return command;
      }
    }

    return null;
  }

  async getSearchResults(query) {
    return this.store.get(`getSearchResults_${query}`, async e => {
      //Allows a user to supply a raw string to have the various API's poll and
      //attempt to find the song for.
      let results = [];

      //Fetch results from all the various streams
      let proms = await Promise.all([
        YouTubeStream.getSearchResults(this, query)
      ]);

      //Flatten the promise array
      proms.forEach(r => results = [...results, ...r]);

      //Now sort by match, and setup the create function
      results.forEach(result => {
        result.match = result.match || 0;
        result.create = connection => {
          //Simply accepts a connection and returns a new isntance of stream
          return new result.stream(connection, result.param);
        }
      });

      //Sort, the higher the match the earlier in the list, 100 should be "perfect"
      results.sort((a,b) => b.match - a.match);
      return results;
    });
  }

  //Event Callbacks
  async onReady() {
    this.getApp().log('Connected to Discord');
  }

  async onMessage(message) {
    if(!message.content.replace(/\s/g, '').length) return;

    if(message.content.startsWith(COMMAND_PREFIX)) {
      //Let's generate our command details
      let messageArray = message.content.split(' ');
      if(!messageArray.length) return;

      //Get Label (REAL Label)
      let label = messageArray[0];
      label = label.substring(1, label.length);;
      if(!label.length) return;

      //Find Command for label
      let command = this.getCommand(label);
      if(!command) return;//TODO: Show error message?

      //Determine args (raw string)
      let args = [];
      for(let i = 1; i < messageArray.length; i++) {
        args.push(messageArray[i]);
      }

      //Exec command.
      let result = await command.command(this, message, label, args);

      //The command did nothing?
      if(!result) return;

      //Now, depending on the result of the function do things
      if(typeof result === typeof "") {
        if(message.deleted) return message.author.send(result);
        return message.reply(result);
      }

      let { action, content } = result;
      if(!action) action = "";

      //Other common actions.
      if(action == "dm") {
        await message.author.send(content);
      }

    }
  }
}

module.exports = DiscordApp;
