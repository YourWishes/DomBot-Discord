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

import { App } from '@yourwishes/app-base';
import { DiscordModule, DiscordCommand, IDiscordApp } from '@yourwishes/app-discord';
import { IYouTubeApp, YouTubeModule } from '@yourwishes/app-youtube';
import { IReactApp, ReactModule } from '@yourwishes/app-react';
import { VoiceChannel, Channel, Guild } from 'discord.js';
import { ChannelConnection, MusicSearch } from './../dombot/';

import { APIHandler } from '@yourwishes/app-server';

import * as Commands from './../commands/';
import * as APIs from './../api/';

export class DomBotApp extends App implements IDiscordApp, IYouTubeApp, IReactApp {
  youtube:YouTubeModule;
  discord:DiscordModule;
  server:ReactModule;

  connections:ChannelConnection[]=[];
  musicSearch:MusicSearch;

  constructor() {
    super();

    //Load the Discord Module
    this.discord = new DiscordModule(this);
    this.addModule(this.discord);

    //Load the YouTube Module
    this.youtube = new YouTubeModule(this);
    this.addModule(this.youtube);

    //Load the React Server Module
    this.server = new ReactModule(this);
    this.addModule(this.server);

    //Prepare the music search
    this.musicSearch = new MusicSearch(this);

    //Load Commands
    Object.keys(Commands).forEach((cmd:string) => {
      let cmdConstructor = Commands[cmd];
      let command:DiscordCommand = new cmdConstructor(this.discord);
      this.discord.addCommand(command);
    });

    //Load APIs
    Object.keys(APIs).forEach(key => {
      let apiHandlerClass = APIs[key];
      let t:APIHandler = new apiHandlerClass();
      this.server.addAPIHandler(t);
    });
  }

  getConnectionForChannel(channel:Channel):ChannelConnection {
    if(channel == null) throw new Error("Invalid Channel");

    for(let i = 0; i < this.connections.length; i++) {
      let c = this.connections[i];
      if(c.channel.id === channel.id) return c;
    }

    return null;
  }

  getConnectionForGuild(guild:Guild):ChannelConnection {
    if(guild == null) throw new Error("Invalid Guild");

    for(let i = 0; i < this.connections.length; i++) {
      let c = this.connections[i];
      if(c.channel.guild.id == guild.id) return c;
    }

    return null;
  }

  async init():Promise<void> {
    await super.init();

    //For the sake of testing, and as a "oh cool it is working" for me I have
    //given DomBot a home where he will always live, even if there is no one
    //to talk to.
    let { client } = this.discord;
    client.guilds.forEach(guild => {
      guild.channels.forEach(async channel => {
        if(channel.id != '306635995313340417') return;
        let connection = new ChannelConnection(this);
        await connection.connect(channel as VoiceChannel);
      });
    });
  }
}
