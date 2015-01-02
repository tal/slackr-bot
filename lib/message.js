'use strict';

var _ = require('lodash');

var formatMessage = require('./util/format-message.js');

function readOnlyEnumerable(obj, key, value) {
  Object.defineProperty(obj, key, {
    value: value,
    writeable: false,
    configurable: false,
    enumerable: true
  });
}

function Message(session, data) {
  readOnlyEnumerable(this, 'data', data);
  readOnlyEnumerable(this, 'session', session);
}

Message.prototype = {
  reply: function(str) {
    var reply = formatMessage(str);

    reply.channel || (reply.channel = this.channelId);

    this.session.sendMessage(reply);
  },

  replyToSession: function(str) {
    this.session.sendMessage(str);
  },

  get channelId() {
    return this.data.channel;
  },

  get channelName() {
    var id = this.channelId;

    var channel = _.find(this.rootSession.data.channels, function(channel) {
      return channel.id === id;
    });

    return channel && channel.name;
  },

  get rootSession() {
    if (this.session.testMessage) {
      return this.session.session;
    } else {
      return this.session;
    }
  },

  get text() {
    return this.data.text;
  }
};

module.exports = Message;
