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
const fs = require('fs');
const path = require('path');
const YouTube = require('better-youtube-api/out/util/util');

module.exports = class YouTubeStream extends MusicStream {
  static getIdFromUrl(url) {
    url = url || "";
    let x = YouTube.parseUrl(url);
    return x ? x.video : null;
  }

  static async getSearchResults(discord, query) {
    //Returns a common format object of valid results from a given query
    let results = [];
    let base = { stream: YouTubeStream };

    //First, is this a youtube ID? maybe
    let id = YouTubeStream.getIdFromUrl(query);
    if(id) results.push({...base, match: 100, param: id });

    //Not an id, maybe a search?
    let search = await discord.getApp().getYouTube().searchVideos(query);
    search.forEach(e => {
      if(id && id === e.id) return;
      let match = query === e.id ? 100 : null;//Matches perfect?
      //TODO Add imperfect matches
      results.push({...base, param: e.id, match })
    });

    return results;
  }


  constructor(domBotConnection, youtubeId) {
    super(domBotConnection);
    this.id = youtubeId;
  }

  getYouTubeURL() { return `https://youtube.com/watch?v=${this.id}`; }
  getCacheDir() { return `private/data/cache/youtube`; }
  getCacheFile() { return `${this.getCacheDir()}/${this.id}.mp3`; }

  async queue() {
    //Fetch metadata about this video.
    this.info = await ytdl.getInfo(this.getYouTubeURL(), { filter: 'audioonly' });

    //Create each dir
    let dir = this.getCacheDir();
    let dirs = dir.split('/');

    let prev = '';
    for(let i = 0; i < dirs.length; i++) {
      prev = `${prev}${dirs[i]}/`;
      let d = path.resolve(prev);
      if(!fs.existsSync(d)) fs.mkdirSync(d);
    }

    //Resolve Now
    dir = path.resolve(this.getCacheFile());

    //Check the cache.
    if(!fs.existsSync(dir)) {
      //Not cached, let's get the youtube stream here.
      this.youtubeStream = await ytdl.downloadFromInfo(this.info, { filter: 'audioonly' });
      await new Promise((resolve, reject) => {
        this.youtubeStream.pipe(fs.createWriteStream(dir));
        this.youtubeStream.on('finish', e => resolve(e));
        this.youtubeStream.on('error', e => reject(e));
      });
    }

    //Push to the queue
    this.getDomBotConnection().queue.push(this);

    //Update the queue (Will automatically start this playing hopefully)
    this.getDomBotConnection().checkQueue();
  }

  getName() { return this.info.title; }

  async play() {
    console.log('Playing stream');

    //Now create a read stream from the cache
    let dir = path.resolve(this.getCacheFile());
    let stream = fs.createReadStream(dir);

    //Create a voice dispatcher. In future we need to be able to actually
    //re-seek if the playing state is interrupted (paused, disconnected etc)
    let dispatcher = this.getDomBotConnection().getConnection().playStream(stream, {
      volume: 0.5,
      seek: 0
    });

    //Setup some common events
    this.useStream(stream);
    this.useDispatcher(dispatcher);

    //Finally, return the dispatcher.
    return dispatcher;
  }
}