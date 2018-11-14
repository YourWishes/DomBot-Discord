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

const MusicStream = require('./MusicStream');
const ytdl = require('ytdl-core');

module.exports = class YoutubeStream extends MusicStream {
  constructor(domBotConnection, youtubeId) {
    super(domBotConnection);
    this.id = youtubeId;
  }

  getYoutubeURL() { return `https://youtube.com/watch?v=${this.id}`; }

  async queue() {
    //Fetch metadata about this video.
    this.info = await ytdl.getInfo(this.getYoutubeURL(), { filter: 'audioonly' });

    //Push to the queue
    this.getDomBotConnection().queue.push(this);

    //Update the queue (Will automatically start this playing hopefully)
    this.getDomBotConnection().checkQueue();
  }

  getName() { return this.info.title; }

  async play() {
    console.log('Playing stream');

    //First let's get the youtube stream here.
    this.stream = await ytdl(this.getYoutubeURL(), { filter: 'audioonly' });

    //Create a voice dispatcher. In future we need to be able to actually
    //re-seek if the playing state is interrupted (paused, disconnected etc)
    this.dispatcher = this.getDomBotConnection().getConnection().playStream(this.stream, {
      volume: 0.5,
      seek: 0
    });

    //Setup some common events
    this.useDispatcher(this.dispatcher);

    //Finally, return the dispatcher.
    return this.dispatcher;
  }
}
