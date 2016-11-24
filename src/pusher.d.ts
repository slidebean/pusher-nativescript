import { PusherOptions } from './interfaces/PusherOptions';
import { Promise } from 'es6-promise';

export declare class Pusher {
  _pusher: Object;
  _options: PusherOptions;

  /**
   * Creates a new instance of Pusher.
   *
   * @param AppKey An string with your Pusher API key.
   * @param Options An Object of options for the Pusher client library to use.
   *
   * @return A Pusher instance.
   */

  constructor (appKey: String, options?: PusherOptions);

  /**
   * Connects to Pusher.
   *
   * Calls are ignored (a connection is not attempted) if the Connection State is not DISCONNECTED.
   *
   * @return A promise with the connection.
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
   * @param channelName The name of the channel to subscribe to.
   * @param eventName The name of the event to listen to.
   * @param listener The listener to be notified when an event is raised.
   *
   * @return A Promise ...
   */

  subscribe (channelName: String, eventName: String, listener?: Function): Promise<any>;

  /**
   * Unsubscribes from a channel using via the name of the channel.
   *
   * @param channelName The name of the channel to be unsubscribed from.
   * @param eventName The name of the event to be listened.
   *
   * @return A promise ...
   */

  unsubscribe (channelName: String): Promise<any>;

  /**
   * Triggers an event on the specified channel.
   * 
   * The data will be converted to JSON format so needs to be any object that can be
   * transformed into JSON (typically any plist-compatible object).
   *
   * @param channelName The channel the event should be triggered on.
   * @param eventName The name of the event to trigger.
   * @param eventData The JSON-compatible data object for the event.
   * 
   * @return A promise ...
   */

  trigger (channelName: String, eventName: String, eventData: Object): Promise<any>;

}
