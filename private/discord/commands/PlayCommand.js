const DomBotConnection = require('./../../dombot/DomBotConnection');

module.exports = {
  label: "play",
  aliases: ["pl", "p", "music", "yt", "youtube"],
  command: async function(discord, message, label, args) {
    //Did they give me a url?
    if(!args.length) return `Please put the type the song you want to play.`;

    //Is the user in a voice channel?
    let voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return 'You are not in a voice channel.';

    //Check to see if the user is in my channel.
    let connection = discord.getConnectionForGuild(voiceChannel.guild);
    if(!connection) {
      //I'm not in his/her channel, or the guild, join the channel.
      connection = new DomBotConnection(discord);
      await connection.connect(voiceChannel);

    } else if(connection.channel.id != voiceChannel.id) {
      //Am I playing anything in the channel that I'm in?
      if(connection.queue.length) {
          //I'm in the guild, in different channel and playing something.
          return `I'm busy playing for others right now.`;
        }
    }

    //Determine the ID
    let searchResults = await discord.getSearchResults(args.join(' '));
    if(!searchResults.length) return `Could not find what you were looking for.`;


    //Everything seems fine, let's attempt to queue the song.
    let result = searchResults[0];
    let stream = result.create(connection);
    stream.setRequestMessage(message);
    try {
      await stream.queue();
    } catch(e) {
      //For debugging, let's log the error
      console.error(e);
      return 'I could not find that video! Try a different URL.';
    }

    return `${stream.getName()} was added as #${stream.getQueuePosition()+1} in the queue.`;
  }
}
