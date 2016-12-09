# Pusher Nativescript
Pusher client library for NativeScript

## Table of contents

This README covers the following topics:

- [Installation](#installation)
- [API Overview](#api-overview)
- [The Pusher constructor](#the-pusher-constructor)
- [Connecting](#connecting)
- [Disconnecting](#disconnecting)
- [Subscribing to channels and binding-handling events](#subscribing-to-channels-and-binding-handling-events)
  - [Public channels](#public-channels)
  - [Private channels](#private-channels)
  - [Presence channels](#presence-channels)
    - [The Member object](#the-member-object)
- [Triggering events](#triggering-events)

## Installation

### Npm

```bash
npm install pusher-nativescript --save
```

## API Overview

```typescript
// Importing Pusher's dependencies
import { Pusher } from 'pusher-nativescript';
import { IPublicChannelEventListener } from 'pusher-nativescript/interfaces';

// Creating a new Pusher instance
let pusher = new Pusher(YOUR_APP_KEY);

// Establishing a connection with Pusher
pusher.connect().then(() => {
  // Connected successfully
}).catch(error => {
  // Handling connection errors
  console.log(error);
});

// Listeners to listen for public specific events
let publicChannelEventsListeners:IPublicChannelEventListener = {
  onEvent (data: Object) {
    console.log('Handling new arriving data from my_event');
    console.log(JSON.stringify(data));
  },

  onSubscriptionSucceeded (channelName: String) {
    console.log(`${channelName} subscription has been succeeded`);
  }
}

let channelTypeAndName = 'public-my_public_channel';
let eventName = 'my_event';

// Subscribing to a public channel and listening for events called "my_event" sent to "my_public_channel"
pusher.subscribe(channelTypeAndName, eventName, publicChannelEventsListeners).then(() => {
  console.log('Channel subscription and event binding succeeded');
}).catch(error => {
  // Some errors have occurred when subscribing and/or binding the event
  console.log(error);
})


// Disconnecting from the service
pusher.disconnect();
```

More information in reference format can be found below.

## The Pusher constructor

The standard constructor take an application key which you can get from the app's API Access section in the Pusher dashboard.

```typescript
import { Pusher } from 'pusher-nativescript';

let pusher = new Pusher(YOUR_APP_KEY);
```

If you are going to use [private](http://pusher.com/docs/private_channels) or [presence](http://pusher.com/docs/presence_channels) channels then you will need to provide an `Authorizer` to be used when authenticating subscriptions. In order to do this you need to pass in a `IPusherOptions` object which has had an `authorizer` set.

```typescript
import { Pusher } from 'pusher-nativescript';
import { IPusherOptions } from 'pusher-nativescript/interfaces';

let pusherOptions:IPusherOptions = {
  authorizer: 'http://127.0.0.1:5000/pusher/auth'
}

let pusher = new Pusher(YOUR_APP_KEY, pusherOptions);
```

See the documentation on [Authenticating Users](http://pusher.com/docs/authenticating_users) for more information.

You can also specify the Pusher cluster you wish to connect to on the IPusherOptions, e.g.

```typescript
pusherOptions.cluster = 'eu';
```

If you need finer control over the endpoint then the host, wsPort and wssPort properties can be employed.
## Connecting

In order to send and receive messages you need to connect to Pusher.

```typescript
import { Pusher } from 'pusher-nativescript';

let pusher = new Pusher(YOUR_APP_KEY);

// Returns a promise
pusher.connect();
```

## Disconnecting

```typescript
pusher.disconnect();
```

After disconnection the Pusher instance will release any internally allocated resources (threads and network connections)

## Subscribing to channels and binding-handling events

Pusher uses the concept of [channels](http://pusher.com/docs/channels) as a way of subscribing to data. They are identified and subscribed to by a simple name. Events are bound to on a channels and are also identified by name. To listen to an event you need to implemented the `IPublicChannelEventListener` or `IPrivateChannelEventListener` or `IPresenceChannelEventListener` interface depending of the channel type you have subscribed to.

Channel subscriptions need only be registered once per `Pusher` instance. They are preserved across disconnection and re-established with the server on reconnect. They should NOT be re-registered. They may, however, be registered with a `Pusher` instance before the first call to `connect` - they will be completed with the server as soon as a connection becomes available.

There are two types of events that occur on channel subscriptions.

1. Protocol related events such as those triggered when a subscription succeeds
2. Application events that have been triggered by code within your application

The `IPublicChannelEventListener` is an interface that is informed of both protocol related events and application data events. A `IPublicChannelEventListener` can be used when initially subscribing to a public channel.

### Public channels

```typescript
import { Pusher } from 'pusher-nativescript';
import { IPublicChannelEventListener } from 'pusher-nativescript/interfaces';

let pusher = new Pusher(YOUR_APP_KEY);
pusher.connect();
  
let publicChannelEventsListeners:IPublicChannelEventListener = {
  onEvent (data: Object) {
    // Called for incoming events name 'my_event'
  },

  onSubscriptionSucceeded (channelName: String) {
    console.log(`${channelName} subscription has been succeeded`);
  }
}

let channelTypeAndName = 'public-my_public_channel';
let eventName = 'my_event';

pusher.subscribe(channelTypeAndName, eventName, publicChannelEventsListeners);
```

### Private channels

It's possible to subscribe to [private channels](http://pusher.com/docs/private_channels) that provide a mechanism for [authenticating channel subscriptions](http://pusher.com/docs/authenticating_users). In order to do this you need to provide an `Authorizer` when creating the `Pusher` instance (see [The Pusher constructor](#the-pusher-constructor) above).

The library makes an HTTP `POST` request to an authenticating endpoint you have set in a IPusherOptions object.

In addition to the events that are possible on public channels, a private channel exposes an `onAuthenticationFailure`. This is called if the `Authorizer` does not successfully authenticate the subscription:

Private channels are subscribed to as follows:

```typescript
let privateChannelEventsListeners:IPrivateChannelEventListener = {
  onAuthenticationFailure (error: String) {
    // Authentication failure due to ${ error }
  },

  // Other PublicChannelEventsListeners methods
}

let channelTypeAndName = 'private-my_private_channel';
let eventName = 'my_event';

pusher.subscribe(channelTypeAndName, eventName, privateChannelEventsListeners);
```

The `IPrivateChannelEventListener` interface extends the `IPublicChannelEventListener` interface.

### Presence channels

[Presence channels](http://pusher.com/docs/presence_channels) are private channels which provide additional events exposing who is currently subscribed to the channel. Since they extend private channels they also need to be authenticated (see [authenticating channel subscriptions](http://pusher.com/docs/authenticating_users)).

Presence channels provide additional events relating to users joining (subscribing) and leaving (unsubscribing) the presence channel. It is possible to listen to these events by implementing the `IPresenceChannelEventListener`.

Presence channels can be subscribed to as follows:

```typescript
let presenceChannelEventsListeners:IPresenceChannelEventListener = {
  onMemberInformationReceived (channelName: String, members: Array <Object>) {
    // Called when the subscription has succeeded and an initial list of subscribed users has been received from Pusher.
  },
  
  memberSubscribed (channelName: String, member: Object) {
  // A new user with userID: ${ member.userID } and userInfo: ${ member.userInfo } has joined to channel ${ channelName }
  },
  
  memberUnsubscribed (channelName: String, member: Object) {
  // A user with userID: ${ member.userID } has left the channel ${ channelName }
  }

  // Other IPrivateChannelEventListener methods
}

let channelTypeAndName = 'presence-my_presence_channel';
let eventName = 'my_event';

pusher.subscribe(channelTypeAndName, eventName, presenceChannelEventsListeners);
```

The `IPresenceChannelEventListener` interface extends the `IPrivateChannelEventListener` interface.

#### The Member object

The `member` object has two main properties.

`userID` contains a unique identifier for the user on the presence channel.

`userInfo` contains an object representing arbitrary additional information about the user.

The following example shows you the structure of a random member subscribed to a presence channel:

```typescript
let member = {
  userID: '1234',
  userInfo: {
    name: `User's name`,
    twitter_id: `User's twitter id`
  }
}
```

For more information on defining the user id and user info on the server see [Implementing the auth endpoint for a presence channel](http://pusher.com/docs/authenticating_users#implementing_presence_endpoints) documentation.

### Unbinding event listeners

You can unbind from an event or events:

```typescript
pusher.unsubscribe('public-my_public_channel', ['my_event']);
```

### Example

```typescript
import { Pusher } from 'pusher-nativescript';
import { IPublicChannelEventListener } from 'pusher-nativescript/interfaces';

class Example {
  _pusher;
  
  connectingToPusher () {
    this._pusher = new Pusher(YOUR_APP_KEY);
    this._pusher.connect();
  }
  
  listeningToMyEvent () {
    let publicChannelEventsListeners:IPublicChannelEventListener = {
      onEvent (data: Object) {
        console.log('Handling new arriving data from my_event');
        console.log(JSON.stringify(data));
      },

      onSubscriptionSucceeded (channelName: String) {
        console.log(`${channelName} subscription has been succeeded`);
      }
    }

    let channelTypeAndName = 'public-my_public_channel';
    let eventName = 'my_event';

    this._pusher.subscribe(channelTypeAndName, eventName, publicChannelEventsListeners);
  }
  
  stopingListeningToMyEvent () {
    this._pusher.unsubscribe('public-my_public_channel', ['my_event']);
  }

}
```

## Triggering events

Once a [private](http://pusher.com/docs/private_channels) or [presence](http://pusher.com/docs/presence_channels) subscription has been authorized (see [authenticating users](http://pusher.com/docs/authenticating_users)) and the subscription has succeeded, it is possible to trigger events on those channels.

```typescript
let channelTypeAndName = 'presence-my_presence_channel';
let eventName = 'my_event';
let data = { message: 'Hello guys :)' };

pusher.trigger(channelTypeAndName, eventName, data).then(() => {
  console.log('triggering succeeded');
}).catch(error => {
  console.log('triggering error');
  console.log(error)
});
```

Events triggered by clients are called [client events](http://pusher.com/docs/client_events). Because they are being triggered from a client which may not be trusted there are a number of enforced rules when using them. Some of these rules include:

* Event names must have a `client-` prefix (The trigger method adds it for you, so you only need to pass in the event name without the client- prefix)
* Rate limits
* You can only trigger an event when the subscription has succeeded (However you can trigger an event do not knowing it, and the trigger method is going to delivered it as soon as the subscription has been succeded)

For full details see the [client events documentation](http://pusher.com/docs/client_events).
