import { App } from '@yourwishes/app-base';
import { DomBotApp } from './../../app/DomBotApp';
import { ChannelConnection } from './../';
import { YouTubeStream } from './';

const app = new DomBotApp();
const connection = new ChannelConnection(app);
const sampleId = 'dQw4w9WgXcQ';
const urlPrefix = 'https://youtube.com/watch?v=';

describe('YouTubeStream', () => {
  it('should construct with or without a youtube id', () => {
    expect(() => new YouTubeStream(connection)).not.toThrow();
    expect(() => new YouTubeStream(connection, sampleId)).not.toThrow();
  });
});

describe('getYouTubeURL', () => {
  it('should take the youtube id and append it to the end of a valid youtube url', () => {
    let stream = new YouTubeStream(connection, sampleId);
    expect(stream.getYouTubeURL()).toEqual(urlPrefix + sampleId);
  });
});

describe('getSearchResults', () => {
  //Untestable since it requires third party as well as valid API key.
});

describe('queue', () => {
  /*it('should fetch the info for the item in the queue', async () => {
    let app = new DomBotApp();
    let connection = new ChannelConnection(app);
    let stream = new YouTubeStream(connection, sampleId);
    stream.playing = true;//This should stop the stream from actually buffering.
    await expect(stream.queue()).resolves.not.toThrow();
    expect(stream.info).toBeDefined();
  });*/
  //Disabled this block since the 3rd party calls are timing out.
});
