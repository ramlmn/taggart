'use strict';

const crypto = require('crypto');

/**
 * An ETag header middleware for express like apps
 *
 * @param {Object} req http IncomingMessage
 * @param {Object} res http ServerReponse
 * @param {Function} next next middleware to call
 */
const addEtag = (req, res, next = _ => {}) => {
  const write = res.write;
  const end = res.end;
  const send = res.send;

  const onData = (...args) => {
    if (!res.headersSent
      && !res.getHeader('Transfer-Encoding')
      && !res.getHeader('TE')
      && res.getHeader('Content-Length')) {
      // we are in luck
      const body = args[0];

      // @TODO: allow weak etags

      // genarate the etag
      const etag = crypto.createHash('sha1')
        .update(body)
        .digest('hex');

      res.setHeader('ETag', etag);
    }
  };

  // override the default methods and collect response buffer

  res.write = (...args) => {
    onData(...args);
    write.apply(res, [...args]);
  };

  res.end = (...args) => {
    onData(...args);
    end.apply(res, [...args]);
  };

  res.send = (...args) => {
    onData(...args);
    send.apply(res, [...args]);
  };

  next();
};


module.exports = addEtag;
