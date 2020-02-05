# Pusher Nativescript

[![](https://img.shields.io/badge/-git--secrets-blue?logo=amazon-aws)](#)

Pusher NativeScript adds [Pusher][pusher] support to [{N}][nativescript] applications.

There is not official support for NativeScript in [pusher-js][pusher-js] sdk, but the Pusher team made a great work designing the JS library to target multiple platforms (react-native, node, browser, etc), while reusing a lot of code in the process. Taking advantage of that architecture, we were able to create a version of the [pusher-js sdk][pusher-js] that maintains the original API and provides support for NativeScript.

## Usage

You can install the library using any npm compatible package manager, like npm or yarn:

```bash
$ npm install --save pusher-nativescript
```

Or use NativeScript CLI:

```bash
$ tns plugin add pusher-nativescript
```

Once the package has been installed, you can import it

As a CommonJS module:

```javascript
const Pusher = require('pusher-nativescript');
```

Or ES6 module:

```javascript
import Pusher from 'pusher-nativescript';
```

If you are using Typescript you might have to import it like this:

```typescript
import * as Pusher from 'pusher-nativescript';
```

This build of `pusher-js` uses [NativeScript's Connectivity API][nativescript-connectivity] to detect changes on connectivity state. It will use this to automatically reconnect.

On Android, to access any connection related information we will need explicit permission from the user. To enable the permission request add the follwing in `app/App_Resources/Android/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
```

NativeScript do not have official support for WebSockets. We are relying on [nativescript-websockets][nativescript-ws] plugin to add that support. That is why the plugin is a peer dependency.

As it was mentioned above, `pusher-nativescript` shares the same API as the official `pusher-js` library. To see how the library is used and configured checkout [pusher-js repository][pusher-js].

# Credits

- [pusher-js][pusher-js] team, for their great work designing the pusher-js sdk.
- [NathanaelA][nathanaela], for his [nativescript-websockets][nativescript-ws] plugin.

[pusher]: https://pusher.com/
[pusher-js]: https://github.com/pusher/pusher-js
[nativescript]: https://www.nativescript.org/
[nathanaela]: https://github.com/NathanaelA
[nativescript-ws]: https://github.com/NathanaelA/nativescript-websockets
[nativescript-connectivity]: https://docs.nativescript.org/cookbook/connectivity
