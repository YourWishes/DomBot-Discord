const DomBotConnection = require('./../../dombot/DomBotConnection');

module.exports = {
  label: "skip",
  aliases: ["s", "next", "no"],
  command: async function(discord, message, label, args) {
    //Get the voice channel the user is in, if any
    let voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return 'You must be in a voice channel!';

    //Are we in the guild?
    let connection = discord.getConnectionForGuild(voiceChannel.guild);
    if(!connection) return `Nothing is currently playing.`;

    //Trigger a queue update.
    await connection.checkQueue();

    //Find the currently playing song
    let current;
    for(let i = 0; i < connection.queue.length; i++) {
      let stream = connection.queue[i];
      if(!stream.isPlaying()) continue;
      current = stream;
    }

    if(!current) {
      return `Nothing is currently playing.`;
    }

    current.stop();
    return `Skipped ${current.getName()}.`;
  }
}
