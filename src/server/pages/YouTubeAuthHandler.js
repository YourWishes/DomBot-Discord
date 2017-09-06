'use strict';

const fs = require('fs');
const tokens_dir = './tokens';
const tokens_file = tokens_dir+'/youtube.json';

module.exports = {
	paths: ['/yt_auth'],//Set this to be whatever you defined in your configuration
	title: function(domBotExpress) {return "Authenticating..."},
	handlePage(domBotExpress, req, res) {
		if(req.query.code) {
			let tokenFunc = function(domBotExpress, err, tokens) {
				if (err) {
					//console.log("Invalid tokens.");
					//yt_valid = false;
					return;
				}
				domBotExpress.client.ytOauth.setCredentials(tokens);
				console.log("Valid YouTube tokens obtained.");
				
				//We are going to save these tokens for later now, make sure you do your own security on these tokens!!
				if(!fs.existsSync(tokens_dir)) fs.mkdirSync(tokens_dir);
				if(fs.existsSync(tokens_file)) fs.unlinkSync(tokens_file);
				fs.writeFile(tokens_file, JSON.stringify(tokens));
			}
			
			domBotExpress.client.ytOauth.getToken(req.query.code, tokenFunc.bind(null, domBotExpress));
		}
		return '<script type="text/javascript">window.close();</script>';
	}
}