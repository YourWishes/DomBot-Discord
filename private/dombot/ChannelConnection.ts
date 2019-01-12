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

import { Logger } from '@yourwishes/app-base';
import { DomBotApp } from './../app/DomBotApp';
import { MusicStream } from './stream/MusicStream';
import { VoiceChannel, VoiceConnection } from 'discord.js';

export class ChannelConnection {
  app:DomBotApp;
  logger:Logger;
  queue:MusicStream[]=[];

  //Information about how this connection was made originally.
  channel:VoiceChannel;
  connection:VoiceConnection;

  constructor(app:DomBotApp) {
    this.app = app;
    this.logger = new Logger(app.logger);
  }

  async connect(channel:VoiceChannel):Promise<void> {
    this.channel = channel;

    //Connect
    this.connection = await channel.join();

    //Now setup the event handlers
    this.connection.on('error', error => this.onError(error));
    this.connection.on('disconnect', () => this.onDisconnect());

    //Connected!
    this.app.connections.push(this);
    this.logger.info(`Joined channel ${channel.name} in ${channel.guild.name}`);

    //Now that we're connected let's begin checking that queue
    this.checkQueue();
  }

  async checkQueue():Promise<void> {
    if(!this.queue.length) return;

    let toPlay = this.queue[0];
    if(toPlay.isPlaying()) return;

    await toPlay.play();
  }

  onError(error:Error) {
    this.logger.error(`Voice Error`);
    this.logger.error(error);
  }

  onDisconnect() {
    this.logger.info(`Disconnected from ${this.channel.name} in ${this.channel.guild.name}`);
  }
}
