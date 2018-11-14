module.exports = {
  label: "ping",
  aliases: ["pong", "test"],
  command: async function(discord, message, label, args) {
    return "Pong";
  }
}
