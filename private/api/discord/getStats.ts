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

import { DomBotApp } from './../../app/';
import { APIHandler, APIRequest, APIResponse, RESPONSE_OK } from '@yourwishes/app-server';

export class getStats extends APIHandler {
  constructor() {
    super('GET', '/discord/get_stats');
  }

  async onRequest(request:APIRequest):Promise<APIResponse> {
    let app = request.server.app as DomBotApp;
    let { client } = app.discord;

    let songs = 0;
    let connections = 0;
    let users = 0;

    app.connections.forEach(connection => {
      connections++;

      connection.queue.forEach(stream => {
        if(!stream.isPlaying()) return;
        songs++;
      });

      users += (connection.channel.members.size - 1) || 0;
    });

    //Build our stats object here
    let stats = {
      guilds: client.guilds.size,
      songs,
      connections,
      users
    };


    return { code: RESPONSE_OK, data: stats };
  }
}
