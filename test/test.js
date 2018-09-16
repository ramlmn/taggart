'use strict';

const path = require('path');

const tape = require('tape');
const tapSpec = require('tap-spec');
const fetch = require('node-fetch');
const express = require('express');

const taggart = require('../index.js');

tape
  .createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);


tape('ETags test in express', async t => {
  t.plan(5);

  const app = express();
  app.set('etag', false);
  app.use(taggart());
  app.use(express.static(path.resolve(__dirname, 'static')));

  const server = app.listen(0, async _ => {
    const {port} = server.address();

    try {
      const res = await fetch(`http://localhost:${port}/large-text.txt`);
      const resETag = res.headers.get('ETag');
      const testTag = 'W/"6281-165de617a21"';

      if (resETag && testTag === resETag.toLowerCase()) {
        t.pass(`Large text - got valid ETag ${resETag}`);
      } else {
        t.fail(`Large text - got invalid ETag ${resETag}`);
      }
    } catch (e) {
      t.fail('Large text - Failed: ', e);
    }

    try {
      const res = await fetch(`http://localhost:${port}/small-text.txt`);
      const resETag = res.headers.get('ETag');
      const testTag = '691544a391db46480b9a425ae3126fe2a0ec22fa';

      if (resETag && testTag === resETag.toLowerCase()) {
        t.pass(`Small text - got valid ETag ${resETag}`);
      } else {
        t.fail(`Small text - got invalid ETag ${resETag}`);
      }
    } catch (e) {
      t.fail('Small text - Failed: ', e);
    }

    try {
      const res = await fetch(`http://localhost:${port}/sample.json`);
      const resETag = res.headers.get('ETag');
      const testTag = 'b13764e8ffd613c4734f67fe51e47afd6bd903f2';

      if (resETag && testTag === resETag.toLowerCase()) {
        t.pass(`JSON request - got valid ETag ${resETag}`);
      } else {
        t.fail(`JSON request - got invalid ETag ${resETag}`);
      }
    } catch (e) {
      t.fail('JSON request: Failed: ', e);
    }

    try {
      const res = await fetch(`http://localhost:${port}/trailer_400p.ogg`);
      const resETag = res.headers.get('ETag');
      const testTag = 'b13764e8ffd613c4734f67fe51e47afd6bd903f2';

      if (resETag && testTag === resETag.toLowerCase()) {
        t.pass(`Video request - got valid ETag ${resETag}`);
      } else {
        t.fail(`Video request - got invalid ETag ${resETag}`);
      }
    } catch (e) {
      t.fail('Video request: Failed: ', e);
    }

    try {
      const res = await fetch(`http://localhost:${port}/atari-adventure.jpg`);
      const resETag = res.headers.get('ETag');
      const testTag = 'b13764e8ffd613c4734f67fe51e47afd6bd903f2';

      if (resETag && testTag === resETag.toLowerCase()) {
        t.pass(`Video request - got valid ETag ${resETag}`);
      } else {
        t.fail(`Video request - got invalid ETag ${resETag}`);
      }
    } catch (e) {
      t.fail('Video request: Failed: ', e);
    }

    server.close();
  });
});
