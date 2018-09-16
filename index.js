'use strict';

const crypto = require('crypto');

const noop = _ => {};

/**
 * An ETag header middleware for express like apps
 *
 * @param {Object} opts options
 * @param {Boolean} opts.weak weak tags?
 * @return {Function}
 */
const addEtag = opts => {
  const weak = (opts !== undefined) ? !!opts.weak : false;

  return (req, res, next = noop) => {
    const write = res.write;
    const end = res.end;

    // sha1 ain't that bad
    const hash = crypto.createHash('sha1');

    // keep track, for content-length
    let length = 0;

    let onData = (chunk, encoding) => {
      const TE = (res.getHeader('Transfer-Encoding') || res.getHeader('TE') || '').toLowerCase();

      // if (chunk) {
      //   console.log(Buffer.byteLength(chunk, 'utf8'), res.headersSent, TE);
      // } else {
      //   console.log(undefined, res.headersSent, TE);
      // }

      if (res.headersSent || TE === 'chunked') {
        // bail
        onData = noop;
        return;
      }

      // convert chunk to buffer
      chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);

      hash.update(chunk);
      length += Buffer.byteLength(chunk, 'utf8');
    };

    const onEnd = (chunk, encoding) => {
      onData(chunk, encoding);

      // generate tag
      const l = length.toString(16);
      const h = hash.digest('hex');

      const tag = weak ? `W/${l}-${h}` : `${l}-${h}`;

      // check if headers can be sent, ignore TE
      if (!res.headersSent) {
        res.setHeader('Content-Length', length);

        if (res.getHeader('ETag')) {
          res.removeHeader('ETag');
        }

        res.setHeader('ETag', tag);
      }
    };

    // override the default methods
    res.write = (...args) => {
      onData(...args);
      write.apply(res, [...args]);
    };

    res.end = (...args) => {
      onEnd(...args);
      end.apply(res, [...args]);
    };

    // non standard, express like
    res.send = (...args) => {
      onEnd(...args);
      end.apply(res, [...args]);
    };

    if (typeof next === 'function') {
      next();
    }
  };
};


module.exports = addEtag;
