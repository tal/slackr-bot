## 0.0.4

- Fixed bug when sending message with no text
- Added `Message#replyToUser(msg)` to message, this allows you to easily reply to a user via direct
message regardless of where you recieve the message.

## 0.0.3

- Added `startHealthCheckServer(port)` to Session. It starts a server for any monitoring
that an app runner would need to do to ensure the app is working ok.

## 0.0.2

- add userId, userData, and userName to message object
- add future support for me messages to `reply()` (currently the bot api doesn't support)
