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
import LoadableImage from './LoadableImage';

const DPI_RATIOS = [1,2,4];

export default (props) => {
  let newProps = {...props};

  //Local Scope props
  let {
    loadable, image, src, alt, width, height, sources, onLoad, onError,
    maxWidth, maxHeight, images
  } = props;

  //Delete bad props
  [
    "loadable", "image", "src", "alt", "width", "height", "sources", "onLoad",
    "onError", "maxWidth", "maxHeight", "images"
  ].forEach(e => delete newProps[e]);

  width = parseInt(width) || undefined;
  maxWidth = parseInt(maxWidth) || undefined;
  height = parseInt(height) || undefined;
  maxHeight = parseInt(maxHeight) || undefined;

  if(loadable) return <LoadableImage {...props} />;

  //Has image prop? Image prop may be either an array of sources of a image.
  if(image) {
    if(Array.isArray(image)) {
      sources = sources || image;
    } else {
      src = src || image;
    }
  }

  if(src) {
    if(src.images) sources = sources || src.images;
    if(src.width) width = width || src.width;
    if(src.height) height = height || src.height;
  }

  //Image
  sources = sources || [];

  //Sort the sources by their size
  sources.sort((l,r) => {
    return (l.size||l.width) - (r.size||r.width);
  });

  let sourcesByWidth = {};
  let sourceElements = [];

  let defaultSrc = src;
  let defaultAlt = alt;
  let defaultWidth = width;
  let defaultHeight = height;

  //Iterate over supplied sources
  for(let i = 0; i < sources.length; i++) {
    let source = sources[i];
    let width = source.size || source.width;

    //Thanks to maxWidth prop we need to check if this iteration is the last.
    let maxWidthBreak = false;
    if(maxWidth && i > 0) {
      if(width >= maxWidth) maxWidthBreak = true;
    }


    DPI_RATIOS.forEach(ratio => {
      let scaledWidth = Math.round(width / ratio);

      //Don't scale less than the smallest image (i.e. 200px@1x shouldn't be 50@4x)
      if(scaledWidth < (sources[0].size||sources[0].width)) return false;

      let o = {...source};
      o.scale = ratio;//Inject scale (DPI ratio)

      //Create an array for this screen width
      let widthKey = `${scaledWidth}`;
      sourcesByWidth[widthKey] = sourcesByWidth[widthKey] || [];
      sourcesByWidth[widthKey].push(o);//Add this source
    });

    //Was this the last iteration?
    if(maxWidthBreak) break;
  }

  //Sort by size in ascending order
  let keys = Object.keys(sourcesByWidth);
  keys.sort((l, r) => {
    return parseInt(l) - parseInt(r);
  });

  //let breakNext = false;
  for(let i = 0; i < keys.length; i++) {
    let k = keys[i];//The pixel size

    let ss = sourcesByWidth[k];//Sources at this pixel resolution (array of sources)
    if(!ss.length) continue;

    let mediaQuery;//Media query
    let sss = [];

    //Try and make this media query be max width by the next key
    if(i+1 < keys.length) {
      let nextKey = keys[i+1];
      mediaQuery = `(max-width:${nextKey}px)`;
    } else {
      mediaQuery = `(min-width:${k}px)`;
    }

    for(let x = 0; x < ss.length; x++) {
      let scale = ss[x];
      let source = scale.src || scale.path;
      sss.push( source + (scale.scale && scale.scale!=1 ? " "+scale.scale+"x" : "") );
    }

    sourceElements.push(<source media={mediaQuery} srcSet={sss.join(", ")} key={i} />);
  }

  return (
    <picture>
      { sourceElements }
      <img
        {...newProps}
        onLoad={ onLoad }
        onError={ onError }
        src={ defaultSrc }
        alt={ defaultAlt }
        width={ defaultWidth }
        height={ defaultHeight }
      />
    </picture>
  );
}
