// Copyright (c) 2019 Dominic Masters
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
import { DomBotApp } from './../../app/';

export class SkipCommand extends DiscordCommand {
  constructor(module:DiscordModule) {
    super(module, 'skip', ['s', 'next', 'no']);
  }

  async onCommand(message:Message) {
    //Shorthands
    let app = this.discord.app as DomBotApp;

    try {
      //Try and delete the original message
      await message.delete();
    } catch(e) { }

    //Short Hand Reply
    let reply = async (s:string) => { await message.reply(s); };

    //Get the voice channel the user is in, if any
    let voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return await reply('You must be in a voice channel!');

    //Are we in the guild?
    let connection = app.getConnectionForGuild(voiceChannel.guild);
    if(!connection) return await reply(`Nothing is currently playing.`);

    //Trigger a queue update.
    await connection.checkQueue();

    //Find the currently playing song
    let current;
    for(let i = 0; i < connection.queue.length; i++) {
      let stream = connection.queue[i];
      if(!stream.isPlaying()) continue;
      current = stream;
    }

    if(!current) {
      return await reply(`Nothing is currently playing.`);
    }

    current.stop();
    await reply(`Skipped ${current.getName()}.`);
  }
}
