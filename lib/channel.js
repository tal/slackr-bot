'use strict';

var _ = require('lodash');

var Event   = require('./event');
var Message = require('./message');

var formatMessage = require('./util/format-message.js');

function Channel(session, name) {
  this.session = session;

  var names = _.isArray(name) ? name : [name];

  this.channelNames = names;

  this.handlers = [];

  _.bindAll(this, 'testMessage');
}

Channel.prototype = {
  send: function() {
    this.sendMessage.apply(this, arguments);
  },

  eachChannelName: function(cb) {
    _.each(this.channelNames, cb, this);
  },

  sendMessage: function(msg) {
    msg = formatMessage(msg);

    if (msg.channel) {
      this.session.sendMessage(msg);
    } else {
      this.eachChannelName(function(channelName) {
        var msgToSend = _.clone(msg);

        msgToSend.channel = channelName;

        this.session.sendMessage(msgToSend);
      });
    }
  },

  on: function(selector, callback) {
    if (callback) {
      this.handlers.push(new Event(this, selector, callback));
    } else {
      for (var key in selector) {
        if (selector.hasOwnProperty(key)) {
          this.on(key, selector[key]);
        }
      }
    }
  },

  testMessage: function(data) {
    var msg = new Message(this, data);

    for (var i = this.handlers.length - 1; i >= 0; i--) {
      this.handlers[i].match(msg);
    }
  },

  setChannels: function() {
    this.channels = {};

    _.each(this.channelNames, function(channelName) {
      var data = this.session.channelData(channelName);
      this.channels[channelName] = data;

      this.session.onChannelMessage(channelName, this.testMessage);
    }, this);
  }
};

Object.defineProperties(Channel.prototype, {
});

module.exports = Channel;
