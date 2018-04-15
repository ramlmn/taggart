# taggart

An ETag header middleware for express like apps. It is a zero dependency
middleware which generates `ETags` accurately.

## Installation

``` bash
$ npm install --save @ramlmn/taggart
```

## Usage

``` js
const express = require('express');
const taggart = require('@ramlmn/taggart');

const app = express();

app.use(taggart);

app.use(...);
...
```

# Working

`taggart` simply overrides the `write`, `end` and `send` methods of the `res`
(`ServerResponse` object) and tries to gather around the response content
being sent to the client, at the end, `taggart` adds the `ETag` header to the
response if it is't buffered or tansfered in chunks.

## License
[MIT](LICENSE)
