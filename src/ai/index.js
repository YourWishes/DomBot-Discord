'use strict';

const SongRequest = require('./../music/SongRequest');

/*
Alright, so here we are, I have had a blast trying to think of cool ways to do
AI. I think I just need the concept of a sentence structure, just means that
anything non-english will be weird.

So the bot really only needs one or two commands that MUST work and I listened
to how people were trying to queue music, doing it in many different ways but
it usually went something like this:

The Quick 'n Easy - Showing the ideal way we want them to ask
"Discord, Play Bat outa hell"

The Polite - Little bit extra, should return an accurateish result
"Hey Discord, can you play Bat outa hell please?"

The Jerk - Accurate, but maybe some choice words that we aren't expecting
"Oi Discord, queue the bat outa hell song"

The Specific - What is all this rubbish, just give me the song name
"Excuse me discord, add the song bat outa hell by Meatloaf to the song queue"

The unresponsive - You talkin' to me?
"play bat outa hell"

The false positive - Yeah I can, watch I'll prove it.
"Do you think Discord can play bat outa hell?"

Sorted pretty much by usage...
So I came up with a pseudo format
[useless stuff]Discord[maybe useful stuff][a keyword (play, queue etc)][maybe stuff][IMPORTANT SONG STUFF][stupid extra stuff]

Let's break apart the hardest sentence here, The Specific
"Excuse me discord, add the song bat outa hell by Meatloaf to the song queue"

Alright, in pieces it's like this:
	1 - "Excuse me" - Useless, we don't need this, it MAY be there like in the specific (two words) or like in the polite (one word "Hey") or maybe not at all!
	2 - "Discord" - VERY important, we kinda want to know that we as a bot are being talked to, people may omit this but... we're gonna want this
	3 - "Add the song" - PSEUDO important, it's an instruction but it's going to be vague... Basically this is the hardest part to figure out...
						So they may something easy to guess like "play" "queue" or a bit harder like "add the song", but then they may not.. like "add the song . . ." and the instruction may come much later?
						We need a way to treat this as either JUNK or INSTRUCTIONs
	4 - "Bat outa hell by meatloaf" - This is the most important part, what the user actually wants, we know what he wants us to do but this is what he wants us to do it with
									This is also very vague, but luckily it's probably not for us, maybe for another engine like YouTube's search API
	5 - "to the song queue" - Ok so this is frustrating, ideally we don't want this, but it may also be important...
							Like.. how do we know this isn't part of the song title? What if it's an instruction? what if it's a set of seperate details? SOO FRUSTRATING THEM HUMANS
							
So you can see it gets very hard to predict.. plus the pieces are sometimes there, sometimes not, and can be almost any size..

Alright so let's start figuring out how we do this.
First let's say we want to "play" a song, then here are some keywords in order of usefulness (descending)
	"play"
	"queue"
	"add", -- this word is important, it usually needs another word to go with it
	"song"

*/

module.exports = {
	handleRequest(user, message, data, dombot) {
		let messageLower = message.toLowerCase();
		let words = messageLower.replace(/[^a-z0-9\s]/g,'').split(' ');
		
		console.log(words);
		
		let me = false;
		let target = null;
		let action = null;
		let polite = false;
		
		let expecting = null;
		let expectingWord = null;
		
		let last = null;
		
		for(let i = 0; i < words.length; i++) {
			let word = words[i];
			let firstWord = i == 0;
			let lastWord = i == words.length-1;
			
			if(word == "discord") {
				console.log("Hey, that's me!");
				me = true;
				last = "me";
			} else if(word == "play") {
				action = "play";
				last = "action";
			} else if(word == "queue") {
				action = "play";
				last = "action";
			} else if(word == "say") {
				action = "say";
				last = "action";
			} else if(word == "skip") {
				action = "skip";
				last = "action";
			} else if(word == "hey") {
				action = "hey";
				last = "action";
			} else if(word == "hello") {
				action = "hey";
				last = "action";
			} else if(word == "konichiwa") {
				action = "hey";
				last = "action";
			} else if(word == "replay") {
				action = "replay";
				last = "action";
			} else if(word == "volume") {
				action = "volume";
				last = "action";
			} else if(word == "turn") {
				action = "volume";
				last = "action";
			} else if(word == "please") {
				if(last != "target" || lastWord) {
					polite = true;
					last = "word";
				}
			} else if(word == "add") {
				expecting = "action";
				expectingWord = "add";
				last = "expecting";
			} else if(word == "thinking") {
				action = "thinking";
				last = "action";
			} else if(word == "think") {
				action = "thinking";
				last = "action";
			} else {
				if(last == "action") {
					if(!target) target = "";
					target += word + " ";
					last = "target";
				} else if(last == "target") {
					if(!target) target = "";
					
					target += word + " ";
					last = "target";
				}
			}
		}
		
		let logging = "";
		if(me && action && target) "I am to... " + action + " the target " + target;
		if(me && action && !target) "I am to... " + action;
		if(me && !action && target) "I target " + target;
		if(me && !action && !target) "I was mentioned.";
		//if(!me) return;
		
		if(action) {
			if(action == "play" && target && me) {
				let client = dombot.getDomBotClient();
				if(client && client.ytOauth && client.ytOauth.isDomBotReady()) {
					let Youtube = require("youtube-api");
					
					let scope = {
						dombot: dombot,
						me: me,
						action: action,
						target: target,
						message: message,
						speechData: data,
						user:user
					};
					
					let searchFunc = function(scope, err, data) {
						if(err) {
							console.log(err);
							console.log(data);
							scope.dombot.reply(scope.user, ":confounded: I couldn't find the song `"+scope.target+"`... I may've misheard you. ```"+err+"```");
							return;
						}
						
						let valid = data && data.items && typeof data.items === typeof [] && data.items.length > 0 && data.items[0].id && data.items[0].id.videoId;
						if(!valid) {
							scope.dombot.reply(scope.user, ":confounded: I couldn't find the song `"+scope.target+"`... I may've misheard you.");
							return;
						}
						
						let id = data.items[0].id.videoId;
						let request = new SongRequest(id, null, scope.dombot, scope.user);
						request.queue();
					}
					
					Youtube.search.list({
						q: target,
						part: 'snippet',
						maxResults:1,
						type: 'video',
						
					},searchFunc.bind(null, scope));
					
					console.log("Searching YouTube");
				} else {
					dombot.reply(user, "Can't do that right now (No YouTube is available)");
				}
			} else if(action == "say" && target && me) {
			} else if(action == "replay" && me) {		
				if(!dombot.playing || dombot.playing.isPlaying()) {
					dombot.reply(user, "Cannot replay song :thinking:");
				}
				dombot.playing.queue();
			} else if(action == "hey" && me) {
				dombot.reply(user, "Hello! :wave:");
			} else if(action == "skip" && me) {
				if(dombot.playing && dombot.playing.isPlaying()) {
					dombot.reply(user, "Skipping song.");
					dombot.playing.skip();
				} else {
					dombot.reply(user, "I'm not playing anything? :thinking:");
				}
			} else if(action == "thinking") {
				dombot.reply(user, ":thinking:");
			} else if(action == "volume" && me) {
				
			}
		} else {
		}
	}
};