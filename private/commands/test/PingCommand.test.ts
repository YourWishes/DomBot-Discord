/*import { PingCommand } from './PingCommand';
import {
  CommandTests, MakeDummyApp, MakeFakeMessage
} from '../../discord';

const app = MakeDummyApp();

describe('PingCommand', () => {
  it('should construct without throwing', () => {
    expect(() => new PingCommand(app.discord)).not.toThrow();
  });
});

describe('onCommand', () => {
  let command = new PingCommand(app.discord);
  let message = MakeFakeMessage();

  it('should create a dm channel if there is none', async () => {
    expect(message.author.dmChannel || null).toBeNull();
    await command.onCommand(message);
    expect(message.author.dmChannel || null).not.toBeNull();
  });


  it('should send a dm to the authors dmchannel', async () => {
    //Due to a chance of a small async issue we're going to test for non null dmChannel
    expect(message.author.dmChannel || null).not.toBeNull();

    //Inject Reply CB
    let replyCb = message.author.dmChannel['send'] = jest.fn();

    //Call command
    await command.onCommand(message);
    expect(replyCb).toHaveBeenCalledWith('Pong!');
  });


  it('should delete the original message', async () => {
    //Inject delete CB
    let deleteCb = message['delete'] = jest.fn();

    //Call command
    await command.onCommand(message);
    expect(deleteCb).toHaveBeenCalled();
  });

  //It should survive the standard command tests.
  CommandTests(command, message);
});
*/
