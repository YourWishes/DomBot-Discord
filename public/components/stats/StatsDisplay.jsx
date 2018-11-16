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

import { Paragraph } from '@objects/typography/Typography';

export default class StatsDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { stats: null };
  }

  componentDidMount() {
    this.fetchStats();
  }

  componentWillUnmount() {
    if(this.fetchTimeout) {
      clearTimeout(this.fetchTimeout);
    }
  }

  async fetchStats() {
    clearTimeout(this.fetchTimeout);

    //Fetch
    let x = await fetch('/api/discord/get_stats');
    let stats = await x.json();

    this.setState({ stats });

    this.fetchTimeout = setTimeout(() => this.fetchStats(), 3000);
  }

  render() {
    let { stats } = this.state;

    let content = "Please Wait...";
    if(stats) {
      content = `
        Currently playing ${stats.songs} songs to ${stats.users} users in
        ${stats.connections} channels in ${stats.guilds} servers.
      `;
    }

    return (
      <Paragraph {...this.props}>
        { content }
      </Paragraph>
    );
  }
};
