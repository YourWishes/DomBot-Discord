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

module.exports = class DomBotConnection {
  constructor(discord) {
    this.discord = discord;

    this.queue = [];
  }

  getDiscord() {return this.discord;}
  getConnection() {return this.connection;}

  addToQueue(stream) { this.queue.push(stream); }

  async connect(channel) {
    this.channel = channel;

    //Connect
    this.connection = await channel.join();

    //Now setup the event handlers
    this.connection.on('error', error => this.onError(error));
    this.connection.on('disconnect', disconnect => this.onDisconnect(disconnect));

    //Connected!
    this.discord.connections.push(this);
    console.log(`Joined channel ${channel.name} in ${channel.guild.name}`);

    //Now that we're connected let's begin checking that queue
    this.checkQueue();

    return this;
  }

  async checkQueue() {
    if(!this.queue.length) return;

    let toPlay = this.queue[0];
    if(toPlay.isPlaying()) return;

    await toPlay.play();
  }


  //Events
  async onError(error) {
    console.error(`Voice Error`);
    console.error(error);
  }

  async onDisconnect(disconnect) {
    console.log(`Disconnected!`);
    if(disonnect) console.log(disconnect);
  }
}
