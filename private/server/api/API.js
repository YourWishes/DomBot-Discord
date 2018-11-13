// Copyright (c) 2018 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const
  path = require('path'),
  fs = require('fs')
;

const API_BASE = path.resolve(__dirname, 'methods');
const API_URL_BASE = '/api';

module.exports = class API {
  constructor(server) {
    this.server = server;
    this.handlers = [];
  }

  getHandlers() {return this.handlers;}
  getServer() {return this.server;}
  getApp() {return this.getServer().getApp();}
  getExpress() {return this.getServer().getExpress();}
  getConfig() {return this.getApp().getConfig();}
  getEmail() {return this.getApp().getEmail();}

  addHandler(handler) {this.handlers.push(handler);}

  registerHandlers() {
    this.handlers.forEach(handler => {
      handler.getMethods().forEach(method => {
        method = method.toLowerCase();

        //For each method, there's perhaps multiple paths (e.g. post /test, get /test, post /ayy, get /ayy)
        handler.getPaths().forEach(path => {
          let url = API_URL_BASE;
          if(!path.startsWith('/')) url += '/';
          url += path;

          this.getExpress()[method](url, handler.onMethod.bind(handler));
          console.log('Registering ' + url + '...');
        });
      });
    });
  }

  loadHandlers() {
    this.loadHandlersInDirectory(API_BASE);
    this.registerHandlers();
  }

  loadHandlersInDirectory(dir) {
    let assets = fs.readdirSync(dir);
    assets.forEach(asset => {
      let assetPath = path.join(dir, asset);
      let stats = fs.statSync(assetPath);
      if(stats.isDirectory()) {
        this.loadHandlersInDirectory(assetPath  );
        return;
      }

      let method = require(assetPath);
      let instance = new method(this);

      this.addHandler(instance);
    });
  }
}
