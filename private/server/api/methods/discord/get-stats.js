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

const APIHandler = require('./../../APIHandler');

const TARGET_PERMISSION_LEVEL = 36924672;

module.exports = class GetStats extends APIHandler {
  constructor(api) {
    super(api, ['GET'], '/discord/get_stats');
  }

  async handle(request) {
    let discord = request.getAPI().getApp().getDiscord();
    let { client } = discord;

    let songs = 0;
    let connections = 0;
    let users = 0;

    discord.connections.forEach(connection => {
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


    return {ok: true, data: stats };
  }
}
