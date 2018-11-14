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

  //REQUIRED Supers
  getName() {throw new Error("Custom Stream missing getName");}

  isPlaying() {return this.playing;}

  getQueuePosition() { return this.connection.queue.indexOf(this); }

  //Now some methods
  async queue() {
    //Super this method, called when something is meant to be queued.
    //This method may throw if there was a problem trying to queue it, be sure
    //to catch any exceptions.
  }

  unqueue() {
    //Where am I in the queue?
    let index = this.connection.queue.indexOf(this);
    if(index === -1) return;//Not in the queue?
    this.connection.queue.splice(index, 1);//Remove!
  }

  async play() {
    //Called when the queued song is meant to start playing.
  }

  //Common event handlers
  useDispatcher(dispatcher) {
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

  }

  async onSpeakingError(error) {
    this.unqueue();

    this.playing = false;
    console.error(error);

    this.connection.checkQueue();
  }

  async onSpeakingEnd(reason) {
    this.unqueue();

    this.playing = false;
    console.log(reason);

    this.connection.checkQueue();
  }
}
