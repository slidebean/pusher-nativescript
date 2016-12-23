import { IPublicChannelEventListener, IPrivateChannelEventListener, IPresenceChannelEventListener, IPusherOptions } from '../interfaces';
import { Promise } from 'es6-promise';

export declare class Pusher {

  /**
   * Creates a new instance of Pusher.
   *
   * @param appKey The string with your Pusher API key.
   *
   * @param options The object of options for the Pusher client library to use.
   * See IPusherOptions interface for more information
   *
   * @return A Pusher instance.
   */

  constructor (appKey: String, options?: IPusherOptions);

  /**
   * Connects to Pusher.
   *
   * Calls are ignored (a connection is not attempted) if the Connection State is not DISCONNECTED.
   *
   * @return A promise.
   */

  public connect (): Promise<any>;

  /**
   * Disconnect from Pusher.
   *
   * Calls are ignored if the Connection State is not CONNECTED.
   */

  public disconnect (): void;

  /**
   * Subscribes to a public, presence or private channel.
   *
   * @param channelName The type and name of the channel to subscribe to.
   *
   * @param eventName The name of the event to listen to.
   *
   * @param channelEventsListener The listeners to be notified when events are raised.
   *
   * @return A Promise.
   */

  public subscribe (channelName: String, eventName: String, channelEventsListener: IPublicChannelEventListener | IPrivateChannelEventListener | IPresenceChannelEventListener): Promise<any>;

  /**
   * Unsubscribes from a channel using via the name of the channel.
   *
   * @param channelName The type and name of the channel to be unsubscribed from.
   *
   * @param eventBindingIDs The optional eventBindingID or events eventBindingIDs to stop listen.
   */

  public unsubscribe (channelName: String, eventBindingIDs?: Array <Number>): void;

  /**
   * Triggers an event on the specified channel.
   * 
   * The data will be converted to JSON format so needs to be any object that can be
   * transformed into JSON (typically any plist-compatible object).
   *
   * @param channelName The type and name of the channel the event should be triggered on.
   *
   * @param eventName The name of the event to be triggered.
   *
   * @param eventData The JSON-compatible data object for the event.
   * 
   * @return A promise.
   */

  public trigger (channelName: String, eventName: String, eventData: Object): Promise<any>;

}
