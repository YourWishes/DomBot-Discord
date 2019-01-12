/*import { PlayCommand } from './PlayCommand';
import { DomBotApp } from './../../app/';
import { CommandTests, MakeDummyApp, MakeFakeMessage, MakeFakeVoiceChannel } from '../../discord';

const app = new DomBotApp();
//const app = MakeDummyApp();

describe('PlayCommand', () => {
  it('should construct without throwing', () => {
    expect(() => new PlayCommand(app.discord)).not.toThrow();
  });
});


describe('onCommand', () => {
  let command = new PlayCommand(app.discord);
  let message = MakeFakeMessage();


  it('should create a dm channel if there is none', async () => {
    expect(message.author.dmChannel || null).toBeNull();
    await command.onCommand(message, 'play', []);
    expect(message.author.dmChannel || null).not.toBeNull();
  });


  it('should tell the user to join a voice channel if they are not in one', async () => {
    expect(message.member.voiceChannel || null).toBeNull();
    let replyCb = message.author.dmChannel['send'] = jest.fn();
    await command.onCommand(message, 'play', []);
    expect(replyCb).toHaveBeenCalledWith('You are not in a voice channel.');
  });


  it('should delete the original message', async () => {
    //Inject delete CB
    let deleteCb = message['delete'] = jest.fn();

    //Call command
    await command.onCommand(message, 'play', []);
    expect(deleteCb).toHaveBeenCalled();
  });


  CommandTests(command, message);

  it('should attempt to connect to the voice channel of the user that attempts to play a song', async () => {
    //First we need to setup the voice channel
    let voice = MakeFakeVoiceChannel('1234567890123', message.member.guild);
    message.member.voiceChannelID = voice.id;

    //Now when the command is called
    await command.onCommand(message, 'play', []);
  });
});
*/
