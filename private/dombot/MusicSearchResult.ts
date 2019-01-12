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

import { ICacheable, CacheStore } from '@yourwishes/app-base';
import { ChannelConnection } from './ChannelConnection';
import { MusicStream } from './stream/';
import { DomBotApp } from './../app/DomBotApp';
import { YouTubeStream } from './stream/';

export type MusicSearchResult = {
  match?:number,
  create?(connection:ChannelConnection):MusicStream,
  stream?:{ new(connection:ChannelConnection, param:string) },
  param?:any
};

export class MusicSearch implements ICacheable<MusicSearchResult[]> {
  app:DomBotApp;
  cacheStore:CacheStore<MusicSearchResult[]>;

  constructor(app:DomBotApp) {
    this.app = app;
    this.cacheStore = new CacheStore(this);
  }

  async searchMusic(query:string) {
    return await this.cacheStore.get(`searchMusic_${query}`, async () => {
      //Allows a user to supply a raw string to have the various API's poll and
      //attempt to find the song for.
      let results:MusicSearchResult[] = [];

      //Fetch results from all the various streams
      let proms:MusicSearchResult[][] = await Promise.all([
        YouTubeStream.getSearchResults(this.app, query)
      ]);

      //Flatten the promise array
      proms.forEach(r => results = [...results, ...r]);

      //Now sort by match, and setup the create function
      results.forEach((result) => {
        result.match = result.match || 0;
        result.create = (connection:ChannelConnection) => {
          //Simply accepts a connection and returns a new isntance of stream
          return new result.stream(connection, result.param);
        }
      });

      //Sort, the higher the match the earlier in the list, 100 should be "perfect"
      results.sort((a,b) => b.match - a.match);
      return results;
    });
  }
}
