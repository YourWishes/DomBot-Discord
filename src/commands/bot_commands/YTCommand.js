module.exports = {
    label: "yt",
    aliases: ["youtube"],
	description: "DEBUG COMMAND",
	args: [
	],
    command: function(label, args, scope) {
		return {
            type:"reply",
            message: "THIS IS A DEBUG COMMAND ONLY!"
        };
    }
};