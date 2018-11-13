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
  http = require('http'),
  express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  webpack = require('webpack'),
  WebpackCompiler = require('./../webpack/WebpackCompiler'),
  API = require('./api/API')
;

const SERVE_FOLDER = path.resolve(`${__dirname}/../../dist`);

class Server {
  constructor(app) {
    this.app = app;

    //Server settings
    this.ip =
      app.getConfig().get("IP") ||
      app.getConfig().get("server.ip") ||
      process.env.ip ||
      process.env.IP ||
      null
    ;

    this.port =
      app.getConfig().get("PORT") ||
      app.getConfig().get("port") ||
      app.getConfig().get("server.port") ||
      process.env.port ||
      process.env.PORT ||
      80
    ;

    //Setup the express wrapper.
    this.express = express();

    //Setup Express Middleware
    this.express.use(bodyParser.json({
      type:'application/json' // to support JSON-encoded bodies
    }));

    this.express.use(bodyParser.urlencoded({
      extended: true
    }));

    //Serve Static Files
    this.express.use(express.static(SERVE_FOLDER));

    //Register API Handlers
    this.api = new API(this);
    this.api.loadHandlers();

    //Setup fallback GET request
    this.express.get('*', (req,res) => this.onGetRequest(req,res));

    //Setup our webpack compiler
    this.compiler = webpack(WebpackCompiler());
  }

  getExpress() {return this.express;}
  getApp() {return this.app;}
  getHTTP() {return this.http;}

  async init() {
    //Create our HTTP and (if needed HTTPS) server(s)
    this.http = http.createServer(this.express);
    this.http.on('error', e => this.onServerError(e));

    //Start the compiler watching
    this.watcher = this.compiler.watch({}, (e,s) => this.onWatchChange(e,s));

    //Start Listening
    this.http.listen({
      host: this.ip,
      port: this.port
    }, e => this.onServerStart(e));
  }

  //Events
  onServerStart(e) {
    this.boundAddress = this.http.address();
  }

  onServerError(e) {
    console.error('Error');
    console.error(e);
  }

  onGetRequest(req, res) {
    let file = path.resolve(`${SERVE_FOLDER}/index.html`);
    res.sendFile(file);
  }

  onWatchChange(error,stats) {
    if(error || (stats.compilation.errors && stats.compilation.errors.length)) {
      return this.app.error(error || stats.compilation.errors);
    }

    this.app.log("Server Compiled!");
  }
}

module.exports = Server;
