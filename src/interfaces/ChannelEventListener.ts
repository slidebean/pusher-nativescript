export interface ChannelEventListener {

  onEvent (channelName: String): void;

  onSubscriptionSucceeded (channelName: String): void;

}



/*

---  pusher-websocket-java

Public channels

Channel channel = pusher.subscribe("my-channel", new ChannelEventListener() {
  public void onSubscriptionSucceeded(String channelName) {}
  public void onEvent(String channelName) {}

});


Private channels

PrivateChannel channel = pusher.subscribePrivate("private-channel",
  new PrivateChannelEventListener() {
    @Override
    public void onAuthenticationFailure(String message, Exception e) {}

    // Other ChannelEventListener methods
    public void onSubscriptionSucceeded(String channelName) {}
    public void onEvent(String channelName) {}
  });


Presence channels

PresenceChannel channel = pusher.subscribePresence("presence-channel",
  new PresenceChannelEventListener() {
    @Override
    public void onUserInformationReceived(String channelName, Set<User> users) {}

    @Override
    public void userSubscribed(String channelName, User user) {}

    @Override
    public void userUnsubscribed(String channelName, User user) {}

    // Other ChannelEventListener and PrivateChannelEventListener methods
    public void onAuthenticationFailure(String message, Exception e) {}
    public void onSubscriptionSucceeded(String channelName) {}
    public void onEvent(String channelName) {}
  });


Binding events

Channel channel = pusher.subscribe("my-channel");
channel.bind("my-event", new ChannelEventListener() {
    @Override
    public void onEvent(String channelName, String eventName, String data) {
        // Called for incoming events named "my-event"
    }
});


Capability to unbind events, not contemplated

channel.unbind("my_event", listener);






---  libPusher

Public channels

Subscribe
pusher.subscribeToChannelNamed("channelName"); // I need to split the name by "-", example: public-name


Private channels

Subscribe
This method will add the appropriate private- prefix to the channel name
pusher.subscribeToPrivateChannelNamed("channelName");


Presence channels

Subscribe
This method will add the appropriate presence- prefix to the channel name
pusher.subscribeToPresenceChannelNamedDelegate("channelName", delegate[PTPusherPresenceChannelDelegate]);


Accessing subscribed channels
// get the 'chat' channel that you've already subscribed to
pusher.channelNamed("channelName");

Unsubscribe from channels
pusher.channelNamed("channelName").unsubscribe();


Binding events

Binding to a channel
channel = pusher.subscribeToChannelNamed("channelName");
channel.bindToEventNamedHandleWithBlock("event-name", callbackOrListener) 

Binding directly to the client
pusher.bindToEventNamedHandleWithBlock("event-name", callbackOrListener)


Remove bindings

// _binding is a weak reference
_binding = [self.client bindToEventNamed:@"new-message" target:self action:@selector(handleEvent:)];

// check that nothing else has removed the binding already
if (_binding) {
  [self.client removeBinding:_binding];
}


*/