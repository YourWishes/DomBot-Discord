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

const NodeCache = require('node-cache');

class CacheStore {
  constructor(app, ttl) {
    if(!ttl) ttl = 60*60;

    this.app = app;
    this.store = new NodeCache({
      stdTTL: ttl,
      checkperiod: ttl * 0.2,
      useClones: false
    });
  }

  getApp() {return this.app;}
  getStore() {return this.store;}
  getDatabase() {return this.app.getDatabase();}

  async get(key, prom) {
    let value = this.store.get(key);
    if(typeof value !== typeof undefined) return value;

    value = await prom();
    this.store.set(key, value);
    return value;
  }

  del(keysOrKey) {
    let keys = keysOrKey;
    if(!Array.isArray(keysOrKey)) keys = [keys];
    this.store.del(keys);
  }

  flush() {
    this.store.flushAll();
  }

  //Database related stores
  async getFromDatabase(key, query, params, method) {
    if(typeof params === typeof undefined) params = {};
    if(typeof method === typeof undefined) method = "any";

    return await this.get(key, async () => {
      return await this.getDatabase()[method](query, params);
    });
  }
}

module.exports = CacheStore;
