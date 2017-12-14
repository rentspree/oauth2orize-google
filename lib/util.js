'use strict';

var request = require('request');

exports.getGoogleProfile = function (config, code, cb) {
  var options = { 
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    headers: { 
      'content-type': 'application/x-www-form-urlencoded' 
    },
    form: { 
      code: code,
      grant_type: config.grant_type,
      client_id: config.client_id,
      client_secret: config.client_secret,
      redirect_uri: config.redirect_uri
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) return cb(error);
   
    if (body && body.error) {
      var msg = body.error.message || 'Could not get google code';
      return cb(new Error(msg));
    }

    var ops = { 
      method: 'GET',
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      qs: { access_token: body.access_token },
      json: true
    };
  
    request(ops, function (err, res, data) {
      if (err) {
        return cb(err);
      }

      if (data && data.error) {
        var msg = data.error.message || 'Could not get google profile.';
        return cb(new Error(msg));
      }
      
      cb(null, data);
    });
  });

};