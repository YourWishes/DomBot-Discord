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

import Styles from './App.scss';


import PageBoundary from '@objects/page/boundary/PageBoundary';
import {Title, SubTitle, Paragraph} from '@objects/typography/Typography';
import Button, { ButtonGroup } from '@objects/button/Button';
import DiscordAuthButton from '@objects/discord/DiscordAuthButton';
import Image from '@objects/image/Image';

import Footer from '@sections/footer/Footer';
import SplitSection, {Split} from '@sections/split/SplitSection';

import Favicon from './Favicon';

//Main App Wrapper
export default props => {
  let {className} = props;

  //Generate base clazzes
  let clazz = "c-app";
  if (className)
    clazz += ` ${className}`;

  return (
    <main {...props} className={clazz}>
      <Favicon/>

      <PageBoundary>
        <SplitSection className="c-app__inner">
          <Split>
            <Image loadable src={ require('@assets/images/dombot-large.png') } className="c-app__image" />
          </Split>

          <Split>
            <Title>DomBot</Title>
            <SubTitle>Discord Music Bot for everyone.</SubTitle>

            <Paragraph>
              DomBot is a Discord Music Bot written in Node.JS for you to add to your Discord server.
            </Paragraph>

            <Paragraph>
              This bot was programmed by <a href="//domsplace.com">
              Dominic Masters </a> so that he could play dank 80's tunes in the
              community Discord server, which you may want join by clicking
              the link below.
            </Paragraph>

            {/* Buttons */}
            <ButtonGroup>
              <DiscordAuthButton style="primary">
                Add to Server
              </DiscordAuthButton>

              <Button style="secondary" href="//discord.gg/rpWyTp">
                Join the Community
              </Button>

              <Button style="github" href="//github.com/YourWishes/DomBot-Discord">
                View Source
              </Button>
            </ButtonGroup>
          </Split>
        </SplitSection>

        <Footer />
      </PageBoundary>
    </main>
    );
};
