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
  APIHandler = require('./../../APIHandler'),
  sanitizeHtml = require('sanitize-html')
;

const ERRORS = {
  name: "Invalid name",
  email: "Invalid email",
  message: "Invalid message",
  sending: "An unknown error occured"
};

module.exports = class Send extends APIHandler {
  constructor(api) {
    super(api, ['GET', 'POST'], '/contact/send');
  }

  async handle(request) {
    let form = request.getFormData("contact");
    let name,email,message;

    if(form.name.required && !request.hasString('name', form.name.maxLength)) return {ok: false, data: ERRORS.name};
    name = request.getString('name', form.name.maxLength);

    if(form.email.required) {
      if(!request.hasString('email', form.email.maxLength)) return { ok: false, data: ERRORS.email };
      email = request.getString('email', form.email.maxLength);
      if(!form.email.regex.test(email)) return { ok: false, data: ERRORS.email };
    }

    if(form.message.required && !request.hasString('message', form.message.maxLength)) return {ok: false, data: ERRORS.message};
    message = request.getString('message', form.name.maxLength);

    //Now let's create our message, we're gonna have to do some rudementry HTML...
    let textMessage = '';
    let htmlMessage = '';

    //First the name
    textMessage += 'Name: ' + name;
    htmlMessage += '<p><strong>Name: </strong>' + sanitizeHtml(name) + '</p>';

    //Now the response Email
    textMessage += '\nEmail: ' + email;
    htmlMessage += '<p><strong>Email: </strong>' +  sanitizeHtml(email) + '</p>';

    //Message!
    textMessage += '\nMessage: ' + message;
    htmlMessage += '<p><strong>Message:</strong></p>';
    htmlMessage += '<p>' + sanitizeHtml(message) + '</p>';

    htmlMessage += '<hr />';
    htmlMessage += '<p>Reply: <a href="mailto:'+email+'">'+email+'</a></p>';

    //Now we can send it!
    try {
      await request.getEmail().sendMailClean(
        request.getEmail().getDestinationEmail(),
        request.getEmail().getSourceName(),
        request.getEmail().getSourceEmail(),
        "domsPlace Contact Enquiry",
        htmlMessage,
        textMessage
      );

      return {
        ok: true,
        data: true
      };
    } catch(e) {
      console.error('Failed to send contact message');
      console.error(e);
      return {
        ok: false,
        data: ERRORS.sending
      };
    }
  }
}
