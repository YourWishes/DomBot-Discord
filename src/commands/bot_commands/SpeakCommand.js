module.exports = {
    label: "speak",
    command: function(label, args, scope) {
		let guild = scope.channel.guild;
		let dombot = guild.dombot;
		dombot.sendMessage(args.join(' '));
    }
};