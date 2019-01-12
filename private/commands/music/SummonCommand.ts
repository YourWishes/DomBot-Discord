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
import { ChannelConnection } from './../../dombot/';

export class SummonCommand extends DiscordCommand {
  constructor(module:DiscordModule) {
    super(module, 'summon', [ 'join', 'connect', 'here'] );
  }

  async onCommand(message:Message) {
    let app = this.discord.app as DomBotApp;

    //Delete the message
    try {
      await message.delete();
    } catch(e) {}

    //Short Hand Reply
    let reply = async (s:string) => { await message.reply(s); };

    //Get the voice channel the user is in, if any
    let voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return await reply('You must be in a voice channel!');

    //Can we join the channel?
    if(!voiceChannel.joinable || !voiceChannel.speakable) return await reply(`I can't join that channel!`);

    //Are we already in the channel?
    if(app.getConnectionForChannel(voiceChannel)) return await reply(`I'm already in this channel?`);

    //Seems like we can join the channel. Setup a connection
    let connection = new ChannelConnection(app);
    connection.connect(voiceChannel);
  }
}
