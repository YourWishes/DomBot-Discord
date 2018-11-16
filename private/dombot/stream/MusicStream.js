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

module.exports = class MusicStream {
  constructor(domBotConnection) {
    this.connection = domBotConnection;
    this.playing = false;
  }

  //Nicy handy methods
  getDomBotConnection() {return this.connection;}
  getDiscord() {return this.connection.getDiscord();}
  getQueuePosition() { return this.connection.queue.indexOf(this); }

  getQueuee() {
    if(this.requestMessage) return this.requestMessage.member;
  }

  isPlaying() {return this.playing;}

  //Reasons, sets what requested this stream
  setRequestMessage(message) {
    //This specific message caused a connect.
    this.requestMessage = message;
  }

  //REQUIRED Supers
  getName() {throw new Error("Custom Stream missing getName");}


  //Now some methods
  async queue() {
    //Super this method, called when something is meant to be queued.
    //This method may throw if there was a problem trying to queue it, be sure
    //to catch any exceptions.
  }

  async unqueue() {
    //Always "stop playing"
    this.playing = false;

    //Where am I in the queue?
    let index = this.connection.queue.indexOf(this);
    if(index === -1) return;//Not in the queue?

    this.connection.queue.splice(index, 1);//Remove!

    //Force the discord to check the queue
    await this.connection.checkQueue();
  }

  async play() {
    //Called when the queued song is meant to start playing.
  }

  async stop() {
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
  useDispatcher(dispatcher) {
    this.dispatcher = dispatcher;

    //Attaches common events to this dispatcher, save some double up for ya'
    dispatcher.on('start', e => this.onSpeakingStart());
    dispatcher.on('speaking', e => this.onSpeaking(e));
    dispatcher.on('error', e => this.onSpeakingError(e));
    dispatcher.on('end', e => this.onSpeakingEnd(e));
  }

  //Common Dispatcher events
  async onSpeakingStart() {
    this.playing = true;
    console.log(`Now playing ${this.getName()} in ${this.connection.channel.name}`);
  }

  async onSpeaking(isSpeaking) {
    //Curently not needed.
  }

  async onSpeakingError(error) {
    this.stop();
    console.log(`Speaking Error:`);
    console.error(error);
  }

  async onSpeakingEnd(reason) {
    this.stop();
    console.log(`Finished Speaking ${reason}`);
  }

  //

  useStream(stream) {
    this.stream = stream;

    stream.on('close', e => this.onStreamClose());
    stream.on('end', e => this.onStreamEnd());
    stream.on('error', e => this.onStreamError(e));
  }

  onStreamClose() {
    console.log('Stream Closed');
  }

  onStreamEnd() {
    console.log('Stream Ended');
  }

  onStreamError(e) {
    this.stop();

    console.log('Stream Error');
    console.error(e);
  }
}
