const DomBotConnection = require('./../../dombot/DomBotConnection');

module.exports = {
  label: "queue",
  aliases: ["np", "q", "nowplaying"],
  command: async function(discord, message, label, args) {
    //Get the voice channel the user is in, if any
    let voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return 'You must be in a voice channel!';

    //Are we in the guild?
    let connection = discord.getConnectionForGuild(voiceChannel.guild);
    if(!connection) return `Nothing is currently playing.`;

    //Trigger a queue update.
    await connection.checkQueue();

    //Let's get the queue
    if(!connection.queue.length) {
      //Empty queue
      return `Nothing is currently playing.`
    }

    //We are playing, build our message
    let msg = '```';

    //Get the currently playing song (first hopefully)
    let hasFirst = false;
    let pIndex = 0;
    for(let i = 0; i < connection.queue.length; i++) {
      let q = connection.queue[i];
      if(!hasFirst && !q.isPlaying()) continue;

      pIndex++;

      if(!hasFirst) {
        msg += `Currently playing ${q.getName()}`;
        let queuee = q.getQueuee();
        if(queuee) msg += ` requested by ${queuee.user.username}`;

        hasFirst = true;
        continue;
      }

      if(pIndex >= 5) {
        msg += `\n... +${connection.queue.length-pIndex} more`;
        break;
      }

      msg += `\n  #${pIndex} - ${q.getName()}`;
    }
    msg += '```';

    return msg;
  }
}
