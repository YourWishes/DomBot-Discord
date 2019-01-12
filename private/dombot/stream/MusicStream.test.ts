import { StreamDispatcher } from 'discord.js';
import { MusicStream } from './MusicStream';
import { ChannelConnection } from './../ChannelConnection';
import { DomBotApp } from './../../app/DomBotApp';

class TestMusicStream extends MusicStream {
  name:string="TestMusicStream";

  getName(): string {
    return this.name;
  }

  async queue():Promise<void> {

  }

  async play():Promise<StreamDispatcher> {
    this.playing = true;
    return null;
  }
}

const app = new DomBotApp();
const connection = new ChannelConnection(app);




describe('MusicStream', () => {
  it('should require a real connection', () => {
    expect(() => new TestMusicStream(null)).toThrow();
  });

  it('should be constructable', () => {
    expect(() => new TestMusicStream(connection)).not.toThrow();
  });
});




describe('getName', () => {
  it('should return the name from the subclass', () => {
    let stream = new TestMusicStream(connection);
    expect(stream.getName()).toEqual("TestMusicStream");

    stream.name = 'test';
    expect(stream.getName()).toEqual('test');

    stream.name = 'Rick Astley - Never Gonna Give You Up';
    expect(stream.getName()).toEqual('Rick Astley - Never Gonna Give You Up');
  });
});




describe('getQueuePosition', () => {
  it('should get the position of the music stream in the channel', () => {
    let connection = new ChannelConnection(app);
    let fifth = null;
    for(let i = 0; i < 25; i++) {
      let stream = new TestMusicStream(connection);
      connection.queue.push(stream);
      if(i == 4) fifth = stream;
    }
    expect(fifth.getQueuePosition()).toEqual(4);
  });

  it('should return -1 if the item is not in the queue', () => {
    let connection = new ChannelConnection(app);
    let notInQueue = new TestMusicStream(connection);
    for(let i = 0; i < 25; i++) {
      let stream = new TestMusicStream(connection);
      connection.queue.push(stream);
    }
    expect(notInQueue.getQueuePosition()).toEqual(-1);
  });
});




describe('isPlaying', () => {
  it('should return false by default', () => {
    let stream = new TestMusicStream(connection);
    expect(stream.isPlaying()).toStrictEqual(false);
  });

  it('should return true or false', () => {
    let stream = new TestMusicStream(connection);
    stream.playing = true;
    expect(stream.isPlaying()).toStrictEqual(true);
    stream.playing = false;
    expect(stream.isPlaying()).toStrictEqual(false);
  });
});




describe('unqueue', () => {
  it('should unqueue', () => {
    let connection = new ChannelConnection(app);
    let fifth = null;
    for(let i = 0; i < 25; i++) {
      let stream = new TestMusicStream(connection);
      connection.queue.push(stream);
      if(i == 4) fifth = stream;
    }
    fifth.playing = true;

    //First check it's "playing"
    expect(fifth.isPlaying()).toStrictEqual(true);
    expect(fifth.getQueuePosition()).toBeGreaterThan(0);

    expect(() => fifth.unqueue()).not.toThrow();

    //Now check it's no longer playing
    expect(fifth.isPlaying()).toStrictEqual(false);
    expect(fifth.getQueuePosition()).toStrictEqual(-1);
  });
});




describe('stop', () => {
  it('should do nothing if its not playing', () => {
    let connection = new ChannelConnection(app);
    let fifth = null;
    for(let i = 0; i < 25; i++) {
      let stream = new TestMusicStream(connection);
      connection.queue.push(stream);
      if(i == 4) fifth = stream;
    }

    //First check it's "playing"
    expect(fifth.isPlaying()).toStrictEqual(false);
    expect(() => fifth.stop()).not.toThrow();
  });

  it('should unqueue if its playing', () => {
    let connection = new ChannelConnection(app);
    let fifth = null;
    for(let i = 0; i < 25; i++) {
      let stream = new TestMusicStream(connection);
      connection.queue.push(stream);
      if(i == 4) fifth = stream;
    }
    fifth.playing = true;

    //First check it's "playing"
    expect(fifth.isPlaying()).toStrictEqual(true);
    expect(fifth.getQueuePosition()).toBeGreaterThan(0);

    expect(() => fifth.stop()).not.toThrow();

    //Now check it's no longer playing
    expect(fifth.isPlaying()).toStrictEqual(false);
    expect(fifth.getQueuePosition()).toStrictEqual(-1);
  });
});
