const DomBotConnection = require('./../../dombot/DomBotConnection');

module.exports = {
  label: "summon",
  aliases: ["join", "connect"],
  command: async (discord, message, label, args) => {
    //Get the voice channel the user is in, if any
    let voiceChannel = message.member.voiceChannel;
    if(!voiceChannel) return 'You must be in a voice channel!';

    //Can we join the channel?
    if(!voiceChannel.joinable || !voiceChannel.speakable) return `I can't join that channel!`;

    //Are we already in the channel?
    if(discord.getConnectionForChannel(voiceChannel)) return `I'm already in this channel?`;

    //Seems like we can join the channel. Setup a connection
    let connection = new DomBotConnection(discord);
    connection.connect(voiceChannel);
  }
}
