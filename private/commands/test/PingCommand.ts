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

import { Message } from 'discord.js';
import { DiscordModule, DiscordCommand } from '@yourwishes/app-discord';

export class PingCommand extends DiscordCommand {
  constructor(module:DiscordModule) {
    super(module, 'ping', ['pong']);
  }

  async onCommand(message:Message) {
    //Try and delete the original message
    try {
      await message.delete();
    } catch(e) {

    }


    //Now respond to the user with a pong.
    try {
      let dmChannel = message.author.dmChannel;
      if(!dmChannel) dmChannel = await message.author.createDM();

      await dmChannel.send('Pong!');
    } catch(e) {
      this.discord.logger.error('Failed to send pong reply!');
      this.discord.logger.error(e);
    }

  }
}
