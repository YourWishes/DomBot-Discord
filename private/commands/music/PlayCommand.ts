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

import { DiscordModule, DiscordCommand } from '@yourwishes/app-discord';
import { Message } from 'discord.js';

import { ChannelConnection } from './../../dombot/';
import { DomBotApp } from './../../app/DomBotApp';

export class PlayCommand extends DiscordCommand {
  constructor(module:DiscordModule) {
    super(module, 'play', ['addqueue', 'add', 'p']);
  }

  async onCommand(message:Message, label:string, args:string[]) {
    //Shorthands
    let app = this.discord.app as DomBotApp;

    try {
      //Try and delete the original message
      await message.delete();
    } catch(e) {

    }

    //Create a DM Channel
    let dmChannel = message.author.dmChannel;
    if(!dmChannel) dmChannel = await message.author.createDM();

    //Shorthand reply
    let reply = async (message:string) => {
      await dmChannel.send(message);
    };

    //Is the user in a voice channel?
    let voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return await reply(`You are not in a voice channel.`);

    //Check to see if the user is in my channel.
    let connection = app.getConnectionForGuild(voiceChannel.guild);
    if(!connection) {
      //I'm not in his/her channel, or the guild, join the channel.
      connection = new ChannelConnection(app);
      await connection.connect(voiceChannel);

    } else if(connection.channel.id != voiceChannel.id) {
      //Am I playing anything in the channel that I'm in?
      if(connection.queue.length) {
          //I'm in the guild, in different channel and playing something.
          return await reply(`I'm busy playing for others right now.`);
        }
    }

    //Now search by the args
    let songSearch = args.join(' ');
    let search = await app.musicSearch.searchMusic(songSearch);

    //Anything?
    if(!search.length) return await reply(`Couldn't find any song by that name.`);

    //Everything seems fine, let's attempt to queue the song.
    let result = search[0];
    let stream = result.create(connection);
    stream.setRequestMessage(message);
    try {
      await stream.queue();
    } catch(e) {
      //For debugging, let's log the error
      console.error(e);
      return await reply(`I could not find that video! Try a different URL.`);
    }

    await message.reply(`${stream.getName()} was added as #${stream.getQueuePosition()+1} in the queue.`);
  }
}
