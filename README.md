# Slackr Bot

A node module for making bots that use the [slack rtm api](https://api.slack.com/rtm).

## Initializing

The object you require is a session, to create a session all you need is a bot token, or a user token if the
bot will be acting as that user.

```js
var Session = require('slackr-bot');

var session = new Session(token);
```

Unfortunately bot's currently cannot send attachments, so built in is the ability to use an incoming webhook to
send then automatically. You just have to configure it:

```js
var session = new Session({
  token: token,
  devChannel: '#bottest',
  webhookClient: {
    token: 'xxxxxxxxxxxxxxxxxxxx',
    team: 'tumblr',
    username: 'ghbot',
    icon_url: 'http://michaelsharman.com/static/images/github_metro.png'
  }
});
```

All the data in the webhook client can be used but the only required ones are token and team.

The other option seen in this session instantiation is the dev channel. With this the bot will ignore anything in
that channel unless `NODE_ENV=development` is set. In which case it will only listen to that channel.

### send

To send a message over rtm just call `session.send(obj)`. If you want to send a message there's a helper that allows
you to call

```js
session.sendMessage({
  channel: '#foo',
  text: 'omg'
});
```

## Responding

To react to messages there are some helper matchers to let you match only certain strings being passed.

```js
session.on('exact string match', cb);
session.on('.prefix *', cb);
session.on('*wildcard*', cb);
session.on(/regex/i, cb);
session.on('/regex string/i', cb);
```

### Exact string match

The callback receives these arguments:

1. [Message](#message) - message object see section describing
2. string - the matched string

### Prefix match

The callback receives these arguments:

1. [Message](#message) - message object see section describing
2. prefix - the prefix it matched on
3. rest - the string that comes after the prfix

`arguments[2] + arguments[3] === message.text`

### Wildcard match

The callback receives these arguments:

1. [Message](#message) - message object see section describing
2. string - the matched string


### Regex match

The callback receives these arguments:

1. [Message](#message) - message object see section describing
2. match - the match object that came back from the successufl regex match

## Message

The message object is passed to message callbacks. It has all the data passed in the message, as well as some helpers.

Simple usage:

```js
session.on('.gh help', function(msg) {
  msg.reply('.gh team( <team name>)( cnt), .gh <user> recent( cnt)');
});
```

The message has a reply method that can be used. It can take a string or an object like shown in the advanced object

Advanced usage

```js
session.on(/^.gh (\w+) recent(?: (\d+))?/, function(message, match) {
  var promise = getPersonsPr(match[1]);

  message.typing();

  var num = match[2] ? parseInt(match[2]) : 3;

  promise.then(function(prs) {
    var resp = {
      text: 'Pull Requests:'
      attachments: _(prs).first(num).map('attachment').value()
    };

    message.reply(resp);
  });
});
```

This shows many features of the response

1. you can call inside of another callback to reply
2. you can reply with advanced objects that contain [attachments](https://api.slack.com/docs/attachments)
3. you can signal in these async actions a typing indicator

## Todo

- [ ] Tests
- [ ] Update channels as new ones are created
- [ ] Implement connection checking to add ability to reconnect dynamically

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
