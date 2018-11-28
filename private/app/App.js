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

//Imports
const
  Configuration = require('./../config/Configuration'),
  DiscordApp = require('./../discord/DiscordApp'),
  Server = require('./../server/Server'),
  YouTube = require('better-youtube-api')
;

class App {
  constructor() {
    this.config = new Configuration(this);
    this.discord = new DiscordApp(this);
    this.server = new Server(this);
  }

  getConfig() { return this.config; }
  getDiscord() { return this.discord; }
  getYouTube() {return this.youtube; }
  getServer() { return this.server; }

  async init() {
    this.log('Starting App...');

    //Load configuration...
    this.log('Reading Configuration...');
    try {
      await this.config.loadConfig();
    } catch(e) {
      this.error('Failed to load configuration!');
      this.error(e);
      return;
    }

    //Connect to YouTube
    try {
      if(!this.config.has('youtube.api')) throw new Error("Missing YouTube API Key in config!");
      this.youtube = new YouTube.YouTube(this.config.get('youtube.api'));
    } catch(e) {
      this.error('Failed to connect to YouTube');
      this.error(e);
      return;
    }

    //Setup the Discord App.
    this.log('Connecting to Discord...');
    try {
      await this.discord.init();
    } catch(e) {
      this.error('Failed to connect to discord!');
      this.error(e);
      return;
    }

    //Start the server
    this.log('Starting Server...');
    try {
      await this.server.init();
    } catch(e) {
      this.error('Failed to start server!');
      this.error(e);
      return;
    }

    this.log('App ready');
  }

  // Logging Functions //
  log(e) {
    //Will allow for extra logging
    console.log(e)
  }

  error(e) {
    console.error(e);
  }
}

module.exports = App;
