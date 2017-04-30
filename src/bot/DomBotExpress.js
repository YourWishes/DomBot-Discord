'use srtict';

const express = require('express');
const server = require('./../server');

module.exports = class DomBotExpress {
	constructor(client, config) {
		this.client = client;//Parent DomBotClient
		let ip = "localhost";
		let port = 9090;
		if(!config.server.ip) console.warn("Missing IP in server on configuration, assuming "+ip);
		if(!config.server.port) console.warn("Missing Port in server on configuration, assuming "+port);
		
		let funcConnected = function(domBotExpress) {domBotExpress.onServerReady();}
		this.express = express();
		let o = this.express.listen(port, funcConnected.bind(null, this));
	}
	
	getHeader(title) {
		let x = '<!DOCTYPE HTML>';
		x += '<html lang="en">';
		x += '<head>';
		x += '<meta charset="utf-8" />';
		x += '<title>' +  title + '</title>';
		x += '</head>';
		
		x += '<body>';
		return x;
	}
	
	getFooter() {
		return '</body></html>';
	}
	
	registerPage(page) {
		if(!page) throw new Error("Invalid Page data.");
		if(!page.title) throw new Error("Missing Page title.");
		if(!page.handlePage) throw new Error("Need a Page handler.");
		if(!page.paths) throw new Error("Missing Page paths.");
		
		let cmdBasic = function(domBot, page, req, res) {
			domBot.onPage(page, req, res);
			let result = page.handlePage(domBot, req, res);
			if(!result || typeof result !== typeof "") return;
			
			let title = "Untitled";
			if(typeof page.title === "") {
				title = page.title;
			} else {
				title = page.title();
			}
			
			res.send(domBot.getHeader(title)+result+domBot.getFooter());
		}
		
		for(let i = 0; i < page.paths.length; i++) {
			this.express.get(page.paths[i], cmdBasic.bind(null, this, page));
		}
	}
	
	disconnect() {
		this.express.close();
	}
	
	onPage(page, res, req) {
		
	}
	
	onServerReady() {
		console.log(" == Express Server Online == ");
		server.loadPages(this);
		
		//Create our Page Handlers here
		
		/*let handleHome = function(domBotExpres, req, res) {
			let x = 'Testing';
			res.send(x);
		}
		
		this.express.get('/', handleHome.bind(null, this));*/
	}
}