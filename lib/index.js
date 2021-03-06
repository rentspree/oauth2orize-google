'use strict';

var AuthorizationError = require('oauth2orize').AuthorizationError;
var objectAssign = require('object-assign');

var getGoogleProfile = require('./util').getGoogleProfile;

module.exports = function (opts, issue) {
  if (typeof opts === 'function') {
    issue = opts;
    opts = null;
  }

  if (typeof issue !== 'function') {
    throw new Error('OAuth 2.0 password exchange middleware ' +
      'requires an issue function.');
  }

  opts = opts || {};

  var userProperty = opts.userProperty || 'user';
  var separators = opts.scopeSeparator || ' ';
  var googleConfig = opts.googleConfig || {};

  if (!Array.isArray(separators)) {
    separators = [ separators ];
  }

  return function google(req, res, next) {
    if (!req.body) {
      return next(new Error('Request body not parsed. ' +
        'Use bodyParser middleware.'));
    }

    // The `user` property of `req` holds the authenticated user. In the case
    // of the token end-point, this property will contain the OAuth 2.0 client.
    var client = req[userProperty];

    var code = req.body.code;
    var scope = req.body.scope;

    if (!code) {
      return next(new AuthorizationError(
        'Missing Google code!', 'invalid_request'));
    }

    googleConfig.redirect_uri = req.get('origin') || googleConfig.redirect_uri

    getGoogleProfile(googleConfig, code, function (err, profile) {
      if (err) {
        return next(new AuthorizationError(
          err.message || 'Could not get Google profile using provided code.',
          'invalid_request'
        ));
      }

      if (scope) {
        for (var i = 0, len = separators.length; i < len; i++) {
          // Only separates on the first matching separator.
          // This allows for a sort of separator "priority"
          // (ie, favors spaces then fallback to commas).
          var separated = scope.split(separators[i]);

          if (separated.length > 1) {
            scope = separated;
            break;
          }
        }

        if (!Array.isArray(scope)) {
          scope = [ scope ];
        }
      }

      var issued = function (err, accessToken, refreshToken, params) {
        if (err) {
          return next(err);
        }

        if (!accessToken) {
          return next(new AuthorizationError(
            'Permissions was not granted.', 'invalid_grant'));
        }

        var json = { 'access_token': accessToken };

        if (refreshToken) {
          json['refresh_token'] = refreshToken;
        }

        if (params) {
          objectAssign(json, params);
        }

        json['token_type'] = json['token_type'] || 'bearer';
        json = JSON.stringify(json);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Pragma', 'no-cache');
        res.end(json);
      };

      issue(client, profile, scope, issued);
    });
  };
};