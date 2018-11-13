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

import React from 'react';
import Helmet from 'react-helmet';
const prefix = '@assets/images/favicon/';

export default (props) => {
  return (
    <Helmet>
      <link rel="apple-touch-icon" sizes="57x57" href={ require('@assets/images/favicon/apple-icon-57x57.png').src } />
      <link rel="apple-touch-icon" sizes="60x60" href={ require('@assets/images/favicon/apple-icon-60x60.png').src } />
      <link rel="apple-touch-icon" sizes="72x72" href={ require('@assets/images/favicon/apple-icon-72x72.png').src } />
      <link rel="apple-touch-icon" sizes="76x76" href={ require('@assets/images/favicon/apple-icon-76x76.png').src } />
      <link rel="apple-touch-icon" sizes="114x114" href={ require('@assets/images/favicon/apple-icon-114x114.png').src } />
      <link rel="apple-touch-icon" sizes="120x120" href={ require('@assets/images/favicon/apple-icon-120x120.png').src } />
      <link rel="apple-touch-icon" sizes="144x144" href={ require('@assets/images/favicon/apple-icon-144x144.png').src } />
      <link rel="apple-touch-icon" sizes="152x152" href={ require('@assets/images/favicon/apple-icon-152x152.png').src } />
      <link rel="apple-touch-icon" sizes="180x180" href={ require('@assets/images/favicon/apple-icon-180x180.png').src } />

      <link rel="icon" type="image/png" sizes="192x192"  href={ require('@assets/images/favicon/android-icon-192x192.png').src } />
      <link rel="icon" type="image/png" sizes="32x32" href={ require('@assets/images/favicon/favicon-32x32.png').src } />
      <link rel="icon" type="image/png" sizes="96x96" href={ require('@assets/images/favicon/favicon-96x96.png').src } />
      <link rel="icon" type="image/png" sizes="16x16" href={ require('@assets/images/favicon/favicon-16x16.png').src } />

      <link rel="manifest" href={ require('@assets/images/favicon/favicon-16x16.png').src } />

      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content={ require('@assets/images/favicon/ms-icon-144x144.png').src } />

      <meta name="theme-color" content="#ffffff" />*/}
    </Helmet>
  );
};
