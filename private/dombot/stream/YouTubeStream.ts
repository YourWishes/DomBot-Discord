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

import * as ytdl from 'ytdl-core';
import { Readable } from 'stream';

import { StreamDispatcher } from 'discord.js';
import { IYouTubeApp } from '@yourwishes/app-youtube';

import { MusicStream } from './MusicStream';
import { ChannelConnection } from './../ChannelConnection';
import { MusicSearchResult } from './../MusicSearchResult';

export class YouTubeStream extends MusicStream {
  static async getSearchResults(youtubeApp:IYouTubeApp, query:string):Promise<MusicSearchResult[]> {
    //Returns a common format object of valid results from a given query
    let results:MusicSearchResult[] = [];
    let base:MusicSearchResult = { stream: YouTubeStream };

    //First, is this a youtube ID? maybe
    let id = youtubeApp.youtube.getVideoIdFromUrl(query);
    if(id) results.push({...base, match: 100, param: id });

    //Not an id, maybe a search?
    let search = await youtubeApp.youtube.youtube.searchVideos(query);

    //Now check search results
    search.forEach(e => {
      if(id && id === e.id) return;
      let match = query === e.id ? 100 : null;//Matches perfect?
      //TODO Add imperfect matches
      results.push({...base, param: e.id, match })
    });

    //Finally return the searched results
    return results;
  }


  //Instance
  id:string;
  info:ytdl.videoInfo;
  youtubeStream:Readable;

  constructor(connection:ChannelConnection, youtubeId?:string) {
    super(connection);
    this.id = youtubeId;
  }

  getYouTubeURL():string { return `https://youtube.com/watch?v=${this.id}`; }

  async queue():Promise<void> {
    //Fetch metadata about this video.
    this.info = await ytdl.getInfo(this.getYouTubeURL(), { filter: 'audioonly' });

    //Push to the queue
    this.connection.queue.push(this);

    //Update the queue (Will automatically start this playing hopefully)
    this.connection.checkQueue();
  }

  getName():string { return this.info.title; }

  async play():Promise<StreamDispatcher> {
    this.connection.logger.info('Playing stream');

    //Fetch the youtube stream
    this.youtubeStream = await ytdl.downloadFromInfo(this.info, { filter: 'audioonly' });

    //Create a voice dispatcher. In future we need to be able to actually
    //re-seek if the playing state is interrupted (paused, disconnected etc)
    let dispatcher = this.connection.connection.playStream(this.youtubeStream, {
      volume: 0.5,
      seek: 0
    });

    //Setup some common events
    this.useStream(this.youtubeStream);
    this.useDispatcher(dispatcher);

    //Finally, return the dispatcher.
    return dispatcher;
  }
}
