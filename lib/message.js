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

  typing: function() {
    this.rootSession.send({
      type: 'typing',
      channel: this.channelId
    });
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
    var session = this.session;

    while (session.session) {
      session = session.session;
    }

    return session;
  },

  get text() {
    return this.data.text;
  }
};

module.exports = Message;
