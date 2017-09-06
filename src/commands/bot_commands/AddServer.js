const config = require('./../../../config/config.json');

module.exports = {
    label: "addserver",
    aliases: ["joinserver", "invite"],
	description: "Provides a URL that a server administrator can use to add this bot to their server!",
    command: function(label, args, scope) {
		return {type: "reply", message: "You can add me to your server by using this link: <https://discordapp.com/oauth2/authorize?scope=bot&client_id=" + config.tokens.discord.client+">"};
    }
};