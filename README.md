# oauth2orize-google

Facebook token exchange middleware for OAuth2 server toolkit [oauth2orize][oauth2orize-url].

Inspired from [oauth2orize][oauth2orize-url]'s built-in exchanger
[password](https://github.com/jaredhanson/oauth2orize/blob/master/lib/exchange/password.js).

## Installation

```sh
npm i oauth2orize-google --save
```

## Usage

Then, you can have fun

```js
var oauth2orize = require('oauth2orize');
var oauth2orizeFacebook = require('oauth2orize-google');

var server = oauth2orize.createServer();

var option = {
  googleConfig: {
    grant_type: 'xxx',
    client_id: 'xxx',
    client_secret: 'xxx',
    redirect_uri: 'xxx'
  }
}
server.exchange(oauth2orizeFacebook(option, function (client, profile, scope, cb) {
  // Get access token from client and Facebook profile information.
  var accessToken = 'access token';

  // Refresh token could be returned if it is supported by your OAuth2 server.
  // If not available, just pass `null` as argument.
  var refreshToken = 'optional refresh token';

  // Additional parameters to return in response. Pass `null` if not available.
  var params = {
    'welcome_to': 'our OAuth2 server',
    'glad_to': 'meet you'
  };

  cb(null, accessToken, refreshToken, params);
  // Or just `cb(null, accessToken);` is enough.
}));
```

## License

MIT licensed.

[oauth2orize-url]: https://www.npmjs.com/package/oauth2orize
