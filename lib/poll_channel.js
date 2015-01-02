'use strict';

var _       = require('lodash');
var request = require('request');

var Event = require('./event');

function buildURL(token, channel, oldest) {
  var url = 'https://slack.com/api/channels.history?token='+token+'&channel='+channel;

  if (oldest) {
    url += '&oldest='+oldest;
  }

  return url;
}

function now() {
  return '' + (_.now()/1000);
}

function Channel(token, channel) {
  this.token = token;
  this.channel = channel;
  this.handlers = [];
  this.channelTimes = {};

  _.bindAll(this, 'handleMessageResponse', 'getMessages');
}

Channel.prototype.pollInterval = 2*1000;

Channel.prototype.on = function(selector, callback) {
  if (callback) {
    this.handlers.push(new Event(selector, callback));
  } else {
    for (var key in selector) {
      if (selector.hasOwnProperty(key)) {
        this.on(key, selector[key]);
      }
    }
  }
};

Channel.prototype.testMessage = function(message) {
  for (var i = this.handlers.length - 1; i >= 0; i--) {
    this.handlers[i].match(message);
  }
};

Channel.prototype.getMessages = function() {
  this.channelTimes[this.channel] || (this.channelTimes[this.channel] = now());
  var url = buildURL(this.token, this.channel, this.channelTimes[this.channel]);

  request.get(url, this.handleMessageResponse);
};

Channel.prototype.handleMessageResponse = function(err, response, body) {
  if (err) {
    return;
  }

  body = JSON.parse(body);

  if (body.messages.length) {
    this.channelTimes[this.channel] = body.messages[0].ts;

    for (var i = body.messages.length - 1; i >= 0; i--) {
      this.testMessage(body.messages[i]);
    }
  }

  this.queueRead();
};

Channel.prototype.queueRead = function() {
  return setTimeout(this.getMessages, this.pollInterval);
};

Channel.setup = function(token, channelId, events) {
  var channel = new Channel(token, channelId);

  channel.on(events || {});

  channel.getMessages();

  return channel;
};

module.exports = Channel;
