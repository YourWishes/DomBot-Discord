'use strict';

const utils = require('./../utils/index.js');
const fs = require('fs');
const path = require('path');
const config = require('./../../config/config.json');

const pagesDir = './pages/';

module.exports = {
    loadPages: function(domBotExpress) {
		var dir = path.resolve(__dirname,pagesDir);
        
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        
        let pageFiles = fs.readdirSync(dir);
        for(var i = 0; i < pageFiles.length; i++) {
            let pageFile = pageFiles[i];
            let page = require(pagesDir+pageFile.replace(".js", ""));
			try {
				domBotExpress.registerPage(page);
			} catch(e) {
				console.error(e);
			}
        }
    },
}