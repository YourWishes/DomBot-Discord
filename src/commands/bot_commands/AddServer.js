const config = require('./../../../config/config.json');

module.exports = {
    label: "addserver",
    aliases: ["joinserver"],
    command: function(label, args, scope) {
		return {type: "reply", message: "You can add me to your server by using this link: <https://discordapp.com/oauth2/authorize?scope=bot&client_id=" + config.credentials.client+">"};
    }
};