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
  API = require('./API'),
  APIRequest = require('./APIRequest')
;

class APIHandler {
  constructor(api, methods, paths) {
    if(!(api instanceof API)) throw new Error('Invalid API Supplied!');
    if(typeof methods === typeof undefined) methods = ['GET'];
    if(typeof paths === typeof undefined) paths = [];
    if(typeof methods === "string") methods = [ methods ];
    if(typeof paths === "string") paths = [ paths ];
    this.api = api;
    this.methods = methods;
    this.paths = paths;
  }

  getAPI() {return this.api;}
  getMethods() {return this.methods;}
  getPaths() {return this.paths;}

  onMethod(req, res) {
    //Now that we have a request we need to create a nice wrapper for it, pass
    //it to our method, and then expect a nice JSON object to send back to the
    //client.
    let request = new APIRequest(this, req, res);
    request.process();
  }
}

module.exports = APIHandler;
