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

import Styles from './LoadableImage.scss';

import Image from './Image';
import Loader from './../loading/Loader';
import BoxSizer from './../layout/BoxSizer';

export default class LoadableImage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true
    };
  }

  componentDidMount() {}
  componentWillUnmount() {}

  onLoad() {
    let { onLoad } = this.props;
    if(onLoad) onLoad();

    this.setState({
      loading: false
    });
  }

  onError() {
    let { onError } = this.props;
    if(onError) onError();

    this.setState({
      loading: false
    });
  }

  render() {
    let newProps = {...this.props};
    let { loading } = this.state;
    let { className, width, height } = this.props;

    ["loadable"].forEach(e => delete newProps[e]);

    let loader,imageSizer;
    let image = <Image
      {...newProps}
      className={`o-loadable-image__image ${className||""}`}
      onLoad={() => this.onLoad()}
      onError={() => this.onError()}
    />;

    let clazz = "o-loadable-image";

    if(loading) {
      clazz += " is-loading";
      loader = <Loader />;
      if(width && height) {
        imageSizer = <BoxSizer ratioWidth={width} ratioHeight={height} />
      }
    } else {
      clazz += " is-loaded";
    }

    if(className) clazz += ` ${className}`;

    return (
      <div className={className}>
        { loader }
        { imageSizer }
        <div className="o-loadable-image__image-container">
          { image }
        </div>
      </div>
    );
  }
}
