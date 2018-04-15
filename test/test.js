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

tape('ETag test', async t => {
  t.plan(2);

  const app = express();
  app.set('etag', false);
  app.use(taggart);
  app.use(express.static(path.resolve(__dirname, 'public')));

  const server = app.listen(0, async _ => {
    const {port} = server.address();

    try {
      const res = await fetch(`http://localhost:${port}/garble.txt`);
      const resETag = res.headers.get('ETag');
      const testTag = '691544a391db46480b9a425ae3126fe2a0ec22fa';

      if (resETag && testTag === resETag.toLowerCase()) {
        t.pass(`Test 1: Got valid ETag: ${resETag}`);
      } else {
        t.fail(`Test 1: Got invalid ETag: ${resETag}`);
      }
    } catch (e) {
      t.fail('Test 1: Failed: ', e);
    }

    try {
      const res = await fetch(`http://localhost:${port}/sample.json`);
      const resETag = res.headers.get('ETag');
      const testTag = 'b13764e8ffd613c4734f67fe51e47afd6bd903f2';

      if (resETag && testTag === resETag.toLowerCase()) {
        t.pass(`Test 2: Got valid ETag: ${resETag}`);
      } else {
        t.fail(`Test 2: Got invalid ETag: ${resETag}`);
      }
    } catch (e) {
      t.fail('Test 2: Failed: ', e);
    }

    server.close();
  });
});
