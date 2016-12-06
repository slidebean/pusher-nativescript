import { PublicChannelEventListener, PrivateChannelEventListener, PresenceChannelEventListener, PusherOptions } from '../interfaces';
import { Promise } from 'es6-promise';

export declare class Pusher {
  _pusher: Object;
  _options: PusherOptions;

  /**
   * Creates a new instance of Pusher.
   *
   * @param appKey The string with your Pusher API key.
   *
   * @param options The object of options for the Pusher client library to use.
   * See PusherOptions interface for more information
   *
   * @return A Pusher instance.
   */

  constructor (appKey: String, options?: PusherOptions);

  /**
   * Connects to Pusher.
   *
   * Calls are ignored (a connection is not attempted) if the Connection State is not DISCONNECTED.
   *
   * @return A promise.
   */

  connect (): Promise<any>;

  /**
   * Disconnect from Pusher.
   *
   * Calls are ignored if the Connection State is not CONNECTED.
   */

  disconnect (): void;

  /**
   * Subscribes to a public, presence or private channel.
   *
   * @param channelTypeAndName The type and name of the channel to subscribe to.
   *
   * @param eventName The name of the event to listen to.
   *
   * @param channelEventsListeners The listeners to be notified when events are raised.
   *
   * @return A Promise.
   */

  subscribe (channelTypeAndName: String, eventName: String, channelEventsListeners: PublicChannelEventListener | PrivateChannelEventListener | PresenceChannelEventListener): Promise<any>;

  /**
   * Unsubscribes from a channel using via the name of the channel.
   *
   * @param channelTypeAndName The type and name of the channel to be unsubscribed from.
   *
   * @param eventNames The optional event or events names to be unsubscribed.
   */

  unsubscribe (channelTypeAndName: String, eventNames?: Array <string>): void;

  /**
   * Triggers an event on the specified channel.
   * 
   * The data will be converted to JSON format so needs to be any object that can be
   * transformed into JSON (typically any plist-compatible object).
   *
   * @param channelTypeAndName The type and name of the channel the event should be triggered on.
   *
   * @param eventName The name of the event to be triggered.
   *
   * @param eventData The JSON-compatible data object for the event.
   * 
   * @return A promise.
   */

  trigger (channelTypeAndName: String, eventName: String, eventData: Object): Promise<any>;

}
