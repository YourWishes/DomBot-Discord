const YoutubeStream = require('./../../dombot/stream/YoutubeStream');
const DomBotConnection = require('./../../dombot/DomBotConnection');

module.exports = {
  label: "play",
  aliases: ["queue", "pl", "p", "music", "yt", "youtube"],
  command: async function(discord, message, label, args) {
    //Did they give me a url?
    if(!args.length) return `Please put the YouTube video you want to play.`;

    //Determine the ID
    let id = args.length ? args[0] : "";
    if(id.startsWith("http") || id.startsWith("www")) {
      let k = id.replace("https", "").replace("http", "").replace("://", "");
      if(k.startsWith("youtu.be")) {//Fix youtu.be links
        //Converts it to be http://youtube.com/watch?v=[id]&t=2 (example, the user may also do a dumb URL)
        id = "http://youtube.com/watch?v=" + k.replace("youtu.be/", "").replace("?", "&");
      }

      //Split by query params
      id = id.split('?');
      if(id.length > 1) {
        //Has query params, search array
        id = id[1];
        let queryArray = id.split('&');
        id = "";//default
        for(let i = 0; i < queryArray.length; i++) {
          let x = queryArray[i].split('=');
          if(x[0] != 'v') continue;//IS not v=blah
          id = x[1];//Set ID
          break;
        }
      } else {
        id = id[0];
      }
    }

    if(!id.length) return 'Please enter a valid Youtube URL';

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
      //I'm in the guild, but a different channel
      return `You must be in the same channel as me.`;
    }

    //Everything seems fine, let's attempt to queue the song.
    let stream = new YoutubeStream(connection, id);
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
