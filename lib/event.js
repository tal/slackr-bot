'use strict';

var Message = require('./message');

var regExRegEx = /^\/(.+)\/([gimy]*)$/;

function Event(session, selector, callback) {
  this.session = session;
  this.selector = selector;
  this.callback = callback;
}

Event.prototype = {
  get selector() {
    return this._selector;
  },

  set selector(selector) {
    var type;

    Object.defineProperty(this, '_selector', {
      value: selector,
      writeable: false,
      configurable: true,
      enumerable: false
    });

    var match;

    if (selector instanceof RegExp) {
      type = 'regex';

      Object.defineProperty(this, 'regex', {
        value: selector,
        writeable: false,
        configurable: false,
        enumerable: true
      });
    } else {
      match = selector.match(regExRegEx);
    }

    if (match) {
      type = 'regex';

      Object.defineProperty(this, 'regex', {
        value: new RegExp(match[1], match[2]),
        writeable: false,
        configurable: false,
        enumerable: true
      });
    } else if (selector[selector.length - 1] === '*') {

      if (selector[0] === '*') {
        type = 'stringAnywhere';

        Object.defineProperty(this, 'stringAnywhere', {
          value: selector.slice(0, -1),
          writeable: false,
          configurable: false,
          enumerable: true
        });
      } else {
        type = 'prefix';

        Object.defineProperty(this, 'prefix', {
          value: selector.slice(0, -1),
          writeable: false,
          configurable: false,
          enumerable: true
        });
      }
    } else if (!type) {
      type = 'text';
    }

    this.type = type;
  },

  get type() {
    return this._type;
  },

  set type(type) {
    Object.defineProperty(this, '_type', {
      value: type,
      writeable: false,
      configurable: true,
      enumerable: false
    });

    var matcher;

    switch (type) {
      case 'text':
        matcher = matchText;
        break;
      case 'prefix':
        matcher = prefixMatch;
        break;
      case 'stringAnywhere':
        matcher = stringAnyWhereMatch;
        break;
      case 'regex':
        matcher = regexMatch;
        break;
      default:
        matcher = function() {};
    }

    Object.defineProperty(this, 'match', {
      value: matcher,
      writeable: false,
      configurable: true,
      enumerable: true
    });
  }
};

function matchText(message) {
  /*jshint validthis:true */

  if (!(message && message.text)) {
    return;
  }

  var matched = message.text === this.selector;

  if (matched) {
    var msg = new Message(this.session, message);
    this.callback(msg, this.selector);
  }

  return matched;
}

function prefixMatch(message) {
  /*jshint validthis:true */

  if (!(message && message.text)) {
    return;
  }

  var matched = message.text.indexOf(this.prefix) === 0;

  if (matched) {
    var rest = message.text.slice(this.prefix.length);

    var msg = new Message(this.session, message);
    this.callback(msg, this.prefix, rest);
  }

  return matched;
}

function stringAnyWhereMatch(message) {
  /*jshint validthis:true */

  if (!(message && message.text)) {
    return;
  }

  var matched = message.text.indexOf(this.stringAnywhere) >= 0;

  if (matched) {
    var msg = new Message(this.session, message);
    this.callback(msg, this.selector);
  }

  return matched;
}

function regexMatch(message) {
  /*jshint validthis:true */

  if (!(message && message.text)) {
    return;
  }

  var match = message.text.match(this.regex);

  if (match) {
    var msg = new Message(this.session, message);

    this.callback(msg, match);
  }

  return !!match;
}

module.exports = Event;
