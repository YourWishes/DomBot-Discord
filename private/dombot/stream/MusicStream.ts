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

import { Message, GuildMember, StreamDispatcher } from 'discord.js';
import { Readable } from 'stream';
import { ChannelConnection } from './../ChannelConnection';

export abstract class MusicStream {
  connection:ChannelConnection;
  playing:boolean;

  requestMessage:Message;
  dispatcher:StreamDispatcher;
  stream:Readable;

  constructor(connection:ChannelConnection) {
    if(connection == null) throw new Error("Invalid Connection");
    this.connection = connection;
    this.playing = false;
  }

  abstract getName():string;
  getQueuePosition() { return this.connection.queue.indexOf(this); }
  getQueuee():GuildMember {
    if(this.requestMessage) return this.requestMessage.member;
    //TODO: Have extra methods.
  }

  isPlaying():boolean {return this.playing;}

  //Reasons, sets what requested this stream
  setRequestMessage(message:Message):void {
    //This specific message caused a connect.
    this.requestMessage = message;
  }

  //Now some methods
  abstract async queue():Promise<void>;
  abstract async play():Promise<StreamDispatcher>;

  async unqueue():Promise<void> {
    //Always "stop playing"
    this.playing = false;

    //Where am I in the queue?
    let index = this.getQueuePosition();
    if(index === -1) return;//Not in the queue?

    this.connection.queue.splice(index, 1);//Remove!

    //Force the discord to check the queue
    await this.connection.checkQueue();
  }

  async stop():Promise<void> {
    if(!this.playing) return;

    //Before we can unqueue we need to do some little cleanup duties so that
    //the next stream can start playing.
    if(this.dispatcher && !this.dispatcher.destroyed) {
      this.dispatcher.end('Stop Requested');
    }

    if(this.stream) {
      this.stream.destroy();
    }

    //Now we can get the next stream to start playing.
    this.unqueue();
  }

  //Common event handlers
  useDispatcher(dispatcher:StreamDispatcher):void {
    this.dispatcher = dispatcher;

    //Attaches common events to this dispatcher, save some double up for ya'
    dispatcher.on('start', () => this.onSpeakingStart());
    dispatcher.on('speaking', e => this.onSpeaking(e));
    dispatcher.on('error', e => this.onSpeakingError(e));
    dispatcher.on('end', e => this.onSpeakingEnd(e));
  }

  //Common Dispatcher events
  async onSpeakingStart():Promise<void> {
    this.playing = true;
    this.connection.logger.info(`Now playing ${this.getName()} in ${this.connection.channel.name}`);
  }

  async onSpeaking(isSpeaking:boolean):Promise<void> {
    //Curently not needed.
  }

  async onSpeakingError(error:Error):Promise<void> {
    this.stop();
    this.connection.logger.error(`Speaking Error:`);
    this.connection.logger.error(error);
  }

  async onSpeakingEnd(reason:string) {
    this.stop();
    this.connection.logger.debug(`Finished Speaking ${reason}`);
  }

  //

  useStream(stream:Readable) {
    this.stream = stream;

    stream.on('close', () => this.onStreamClose());
    stream.on('end', () => this.onStreamEnd());
    stream.on('error', e => this.onStreamError(e));
  }

  onStreamClose():void {
    this.connection.logger.debug('Stream Closed');
  }

  onStreamEnd():void {
    this.stop();
    this.connection.logger.debug('Stream Ended');
  }

  onStreamError(e:Error):void {
    this.stop();

    this.connection.logger.error('Stream Error');
    this.connection.logger.error(e);
  }
}
