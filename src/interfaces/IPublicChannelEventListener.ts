/**
 * Used to listen for public specific events.
 */
export interface IPublicChannelEventListener {

  /**
   * Callback that is fired whenever an event is received.
   *
   * @param data An object with the event's information
   */
  onEvent (data: Object): void;

  /**
   * Callback that is fired when a subscription success acknowledgement
   * message is received from Pusher after subscribing to the channel.
   *
   * @param channelName The name of the channel that was successfully subscribed.
   */
  onSubscriptionSucceeded (channelName: String): void;

}
