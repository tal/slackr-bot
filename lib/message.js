'use strict';

// var _ = require('lodash');

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
    return this.channelData && this.channelData.name;
  },

  get channelData() {
    if (!this._channelData) {
      this._channelData = this.rootSession.channelOrImData(this.channelId);
    }

    return this._channelData;
  },

  get isIm() {
    return this.channelData && this.channelData.is_im;
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
  },

  get textWithImPrefix() {
    if (!this._textWithImPrefix) {
      var prefix;

      if (this.isIm && this.session.imPrefix && this.text.indexOf(this.session.imPrefix) !== 0) {
        prefix = this.session.imPrefix;
      } else {
        prefix = '';
      }

      if (this.text) {
        this._textWithImPrefix = prefix + this.text;
      } else {
        this._textWithImPrefix = true;
      }
    }

    if (this._textWithImPrefix !== true) {
      return this._textWithImPrefix;
    }
  }
};

module.exports = Message;
