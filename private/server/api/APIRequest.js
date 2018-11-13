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

const Forms = require('./../../../common/Forms.js');

class APIRequest {
  constructor(handler, req, res) {
    this.handler = handler;
    this.req = req;
    this.res = res;
  }

  getHandler() {return this.handler;}
  getRequest() {return this.req;}
  getResponse() {return this.res;}
  getHandleFunction() {return this.getHandler().handle;}
  getFormData(name) {return Forms[name];}

  //Some nice shorthands
  getAPI() {return this.getHandler().getAPI();}
  getConfig() {return this.getAPI().getConfig();}
  getServer() {return this.getAPI().getServer();}
  getExpress() {return this.getAPI().getExpress();}
  getEmail() {return this.getAPI().getEmail();}
  getApp() {return this.getAPI().getApp();}

  //Our process method
  process() {
    if(typeof this.processPromise !== typeof undefined) return;//Woops, already processing?
    this.processPromise = this.processHandler();
    this.processPromise.then(this.onResult.bind(this)).catch(this.onError.bind(this));
  }

  async processHandler() {
    //Awesome, now we have a nice async function!
    let response = { ok: false };
    if(typeof this.getHandleFunction() === "function") {
      try {
        response = await this.getHandleFunction()(this);
      } catch(e) {
        console.error(e);
        response = { ok: 500, data: "An unknown error occured" };
      }
    }

    if(typeof response.data === typeof undefined || typeof response.ok === typeof undefined) {
      throw new Error("Invalid response object.");
    }

    if(response.ok !== true) {
      response.code = typeof response.ok === "number" ? response.ok : 400;
    }

    this.res.status(response.code || 200).json(response.data);
  }

  onResult(result) {
  }

  onError(error) {
    this.res.status(500).json("An unexpected error occured");
  }

  //Some really nice API handlers
  get(key) {
    if(typeof this.req === typeof undefined) return null;
    let data = this.req.body ||  {};
    if(this.req.method == "GET") {
      data = this.req.query || {};
    }
    if(typeof data === typeof undefined) return null;
    if(typeof key === typeof undefined) return data;

    return this.getRecursive(key.split("."), data);
  }

  getRecursive(key_array, data_obj) {
    if(typeof data_obj === typeof undefined) return null;

    let k = key_array[0];
    let o = data_obj[k];
    if(typeof o === typeof undefined) return null;

    //Awesome
    if(key_array.length > 1) {
      if(typeof o !== typeof {}) return null;
      key_array.shift();
      return this.getRecursive(key_array, o);
    }
    return o;
  }

  getInteger(key) {
    if(!this.hasInteger(key)) throw new Error("Invalid Data Type!");
    return parseInt(this.get(key));
  }

  getDouble(key) {
    if(!this.hasDouble(key)) throw new Error("Invalid Data Type!");
    return parseFloat(this.get(key));
  }

  getBool(key) {
    if(!this.hasBool(key)) throw new Error("Invalid Type");
    let t = this.get(key);
    if(t === true || t === "true" || t === 1 || t === "1") return true;
    return false;
  }

  getString(key, maxLength, allowBlank) {
    if(typeof allowBlank === typeof undefined) allowBlank = true;
    if(!this.hasString(key, maxLength, allowBlank)) throw new Error("Missing Data");
    return this.get(key)+"";
  }

  has(key) {
    if(typeof this.req === typeof undefined) return false;
    if(typeof this.req === typeof undefined) return false;
    let data = this.req.body ||  {};
    if(this.req.method == "GET") {
      data = this.req.query || {};
    }
    if(typeof data === typeof undefined) return false;
    if(typeof key === typeof undefined) return data;
    return this.hasRecursive(key.split("."), data);
  }

  hasRecursive(key_array, data_obj) {
    if(typeof data_obj === typeof undefined) return false;

    let k = key_array[0];
    let o = data_obj[k];
    if(typeof o === typeof undefined) return false;
    //Awesome
    if(key_array.length > 1) {
      if(typeof o !== typeof {}) return false;
      key_array.shift();
      return this.hasRecursive(key_array, o);
    }
    return true;
  }

  hasInteger(key) {
    if(!this.has(key)) return false;
    let t = parseInt(this.get(key));
    if(typeof t !== "number" || isNaN(t) || !isFinite(t)) return false;
    let tf = parseFloat(this.get(key));
    if(tf !== t) return false;
    return true;
  }

  hasDouble(key) {
    if(!this.has(key)) return false;
    let t = parseFloat(this.get(key));
    return typeof t === typeof 1.00 && !isNaN(t) && isFinite(t);
  }

  hasBool(bool) {
    if(!this.has(bool)) return false;
    let t = this.get(bool);
    return (
      t === true || t === false ||
      t === "true" || t === "false" ||
      t === 1 || t === 0 ||
      t === "1" || t === "0"
    );
  }

  hasString(str, maxLength, allowBlank) {
    if(typeof maxLength === typeof undefined) throw new Error("MaxLength check missing.");
    if(typeof allowBlank === typeof undefined) allowBlank = false;
    if(!this.has(str)) return false;
    let t = this.get(str);
    let v = typeof t === typeof "" && t.length <= maxLength;
    if(!v) return false;
    if(!allowBlank) {
      t = t.replace(/\s/g, "");
      if(!t.length) return false;
    }
    return typeof t === typeof "" && (t.length <= maxLength ? true : false);
  }

  //Files (if supported)
  hasFiles() {
    if(typeof this.req === typeof undefined) return false;
    if(typeof this.req.files === typeof undefined) return false;
    if(!this.req || !this.req.files) return false;
    return Object.keys(this.req.files).length ? true : false;
  }

  hasFile(name) {
    if(!this.hasFiles()) return false;
    if(typeof this.req.files[name] === typeof undefined) return false;
    return true;
  }

  getFile(name) {
    if(!this.hasFile(name)) return false;
    return this.req.files[name];
  }

  //Headers
  hasHeader(header) {
    return this.req && typeof this.req.get(header) !== typeof undefined
  }

  getHeader(header) {
    return this.req.get(header);
  }
}

module.exports = APIRequest;
