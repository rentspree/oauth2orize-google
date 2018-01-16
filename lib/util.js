'use strict';

var axios = require('axios');

function parseError(err) {
  try {
    return new Error(err.response.data.error_description)
  } catch (e) {
    return err
  }
}

exports.getGoogleProfile = function (config, code, cb) {
  var options = { 
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    params: { 
      code: code,
      grant_type: config.grant_type,
      client_id: config.client_id,
      client_secret: config.client_secret,
      redirect_uri: config.redirect_uri
    }
  };

  axios.request(options)
    .then(function(response) {
      if (response && response.data) {
        var ops = { 
          method: 'GET',
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
          params: { access_token: response.data.access_token }
        };
      
        axios.request(ops)
          .then((res = {}) => {
            cb(null, res.data);
          })
          .catch((err) => {
            cb(parseError(err))
          })
      } else {
        cb(new Error('Could not get google code'))
      }
    })
    .catch((err) => {
      cb(parseError(err))
    })

};