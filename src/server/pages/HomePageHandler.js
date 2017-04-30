'use strict';

module.exports = {
	paths: ['/', '/index', '/home'],
	title: function(domBotExpress) {return "Home"},
	handlePage(domBotExpress, req, res) {
		let x = " = DomBot Status Panel =<br />";
		if(domBotExpress.client.ytAuthURL) {
			let ytOauth = domBotExpress.client.ytOauth;
			if(ytOauth.isDomBotReady()) {
				x += 'YouTube has been authorized.<br />';
			} else {
				console.log(ytOauth);
				x += '<a href="'+domBotExpress.client.ytAuthURL+'" target="_blank">Authorize YouTube API</a><br />';
			}
		}
		return x;
	}
}