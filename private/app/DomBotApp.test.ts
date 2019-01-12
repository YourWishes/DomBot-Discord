import { DomBotApp } from './DomBotApp';
import { ChannelConnection } from './../dombot/';
import { Channel, Guild, VoiceChannel, Client } from 'discord.js';


const makeFakeGuild = (id:string) => {
  let fakeGuild = new Guild(null, {
    emojis: []
  });
  fakeGuild.id = id;
  return fakeGuild;
};

const makeFakeClient = (guild:Guild, id:string='1234567890123') => {
  let fakeClient = new Client({
  });
};

const makeFakeVoiceChannel = (guild:Guild, id:string) => {
  let fakeChannel = new VoiceChannel(guild, {

  });
  fakeChannel.id = id;
  return fakeChannel;
};


describe('DomBotApp', () => {
  it('should be constructable', () => {
    expect(() => new DomBotApp()).not.toThrow();
  });

  it('should have the necessary modules', () => {
    let app = new DomBotApp();
    expect(app.youtube).toBeDefined();
    expect(app.discord).toBeDefined();
    expect(app.connections).toBeDefined();
    expect(app.musicSearch).toBeDefined();
  });

  it('should load at least one command', () => {
    let app = new DomBotApp();
    expect(app.discord.commands.length).toBeGreaterThan(0);
  });
});

describe('getConnectionForChannel', () => {
  it('should require a real channel object', () => {
    let app = new DomBotApp();
    expect(() => app.getConnectionForChannel(null)).toThrow();

    let guild = makeFakeGuild('3066359953133404');
    let channel = makeFakeVoiceChannel(guild, '3066359953133404');
    expect(() => app.getConnectionForChannel(channel)).not.toThrow();
  });

  it('should find the connection in the array', () => {
    let app = new DomBotApp();
    let channelToFind = null;
    let connectionToFind = null;

    for(let i = 0; i < 25; i++) {
      let connection = new ChannelConnection(app);
      let guild = makeFakeGuild('3066359953133404'+i);
      let channel = makeFakeVoiceChannel(guild, '3066359953133404'+i);
      connection.channel = channel;
      app.connections.push(connection);

      if(i != 13) continue;
      channelToFind = channel;
      connectionToFind = connection;
    }

    expect(app.getConnectionForChannel(channelToFind)).toEqual(connectionToFind);
  });

  it('should return null if it cannot find the connection', () => {
    let app = new DomBotApp();
    let channelToFind = null;

    for(let i = 0; i < 25; i++) {
      let connection = new ChannelConnection(app);
      let guild = makeFakeGuild('3066359953133404'+i);
      let channel = makeFakeVoiceChannel(guild, '3066359953133404'+i);
      connection.channel = channel;

      if(i != 13) {
        app.connections.push(connection);
        continue;
      }
      channelToFind = channel;
    }

    expect(app.getConnectionForChannel(channelToFind)).toBeNull();
  });
});


describe('getConnectionForGuild', () => {
  it('should require a real guild', () => {
    let app = new DomBotApp();
    expect(() => app.getConnectionForGuild(null)).toThrow();

    let guild = makeFakeGuild('3066359953133404');
    expect(() => app.getConnectionForGuild(guild)).not.toThrow();
  });

  it('should find the guild in the array', () => {
    let app = new DomBotApp();
    let guildToFind = null;
    let connectionToFind = null;

    for(let i = 0; i < 25; i++) {
      let connection = new ChannelConnection(app);
      let guild = makeFakeGuild('3066359953133404'+i);
      let channel = makeFakeVoiceChannel(guild, '3066359953133404'+i);
      connection.channel = channel;
      app.connections.push(connection);

      if(i != 13) continue;
      guildToFind = guild;
      connectionToFind = connection;
    }

    expect(app.getConnectionForGuild(guildToFind)).toEqual(connectionToFind);
  });


  it('should return null if it cannot find the guild', () => {
    let app = new DomBotApp();

    for(let i = 0; i < 25; i++) {
      let connection = new ChannelConnection(app);
      let guild = makeFakeGuild('3066359953133404'+i);
      let channel = makeFakeVoiceChannel(guild, '3066359953133404'+i);
      connection.channel = channel;
      app.connections.push(connection);
    }

    let g = makeFakeGuild('306635995313340488');

    expect(app.getConnectionForGuild(g)).toBeNull();
  });
});
