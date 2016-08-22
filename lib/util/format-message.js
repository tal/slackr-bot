'use strict';

var _ = require('lodash');

var ME_PREFIX = '/me ';

module.exports = function formatMessage(msg) {
  var newMsg;

  if (_.isString(msg)) {
    newMsg = {
      text: msg
    };
  } else {
    newMsg = msg;
  }

  if (newMsg.txt && newMsg.text.slice(0,ME_PREFIX.length) === ME_PREFIX) {
    newMsg.text = newMsg.text.slice(ME_PREFIX.length);
    newMsg.subtype = 'me_message';
  }

  newMsg.type || (newMsg.type = 'message');

  return newMsg;
};
