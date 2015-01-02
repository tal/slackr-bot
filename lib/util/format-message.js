'use strict';

var _ = require('lodash');

module.exports = function formatMessage(msg) {
  var newMsg;

  if (_.isString(msg)) {
    newMsg = {
      text: msg
    };
  } else {
    newMsg = msg;
  }

  newMsg.type || (newMsg.type = 'message');

  return newMsg;
};
