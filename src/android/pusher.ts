import { PusherOptions } from '../interfaces/PusherOptions';
import { ConnectionEventListeners } from '../interfaces/ConnectionEventListeners';
declare let com;

export class Pusher {
  _pusher;
  _options;
  _pusherDidSubscribeToChannelPromiseResolve;
  _pusherDidSubscribeToChannelPromiseReject;

  constructor (appKey: String, options: PusherOptions = { encrypted: true }) {

    if (typeof appKey !== "string") {
      throw(new Error('pusher-nativescript package error: appKey parameter must be a string'))
    }

    if (typeof options !== "object" && typeof options !== "undefined") {
      throw(new Error('pusher-nativescript package error: options parameter must be an object'))
    }

    this._options = new com.pusher.client.PusherOptions();

    if (options.activityTimeout) {
      this._options.setActivityTimeout(options.activityTimeout);
    }

    if (typeof options.authorizer !== 'undefined') {
      if (typeof options.authorizer !== 'string') {
        throw(new Error('pusher-nativescript package error: options.authorizer property must be a string'));
      }

      let _authorizer = new com.pusher.client.util.HttpAuthorizer(options.authorizer);
      this._options.setAuthorizer(_authorizer);
    }

    if (typeof options.cluster !== 'undefined') {
      if (typeof options.cluster !== 'string') {
        throw(new Error('pusher-nativescript package error: options.cluster property must be a string'));
      }

      this._options.setCluster(options.cluster);
    }

    if (typeof options.encrypted !== 'undefined') {
      if (typeof options.encrypted !== 'boolean') {
        throw(new Error('pusher-nativescript package error: options.encrypted property must be a boolean'));
      }

      this._options.setEncrypted(options.encrypted);
    }

    if (options.host) {
      this._options.setHost(options.host);
    }

    if (options.pongTimeout) {
      this._options.setPongTimeout(options.pongTimeout);
    }

    if (options.wsPort) {
      this._options.setWsPort(options.wsPort);
    }

    if (options.wssPort) {
      this._options.setWssPort(options.wssPort);
    }

    this._pusher = new com.pusher.client.Pusher(appKey, this._options);
    
  }

  connect () {
    return new Promise((resolve, reject) => {
      let listeners:ConnectionEventListeners  = {
        onConnectionStateChange: function (change: Object) {
          let connectionCurrentState = change.getCurrentState().name();

          if (connectionCurrentState === "CONNECTED") {
            resolve();
          }
        },

        onError: function (message: String, code: String, exception: Object) {
          reject(message);
        }
      }

      let connectionEventListener = new com.pusher.client.connection.ConnectionEventListener(listeners);

      let connectionStates = [];

      this._pusher.connect(connectionEventListener, connectionStates);
    });

  }

  disconnect () {
    this._pusher.disconnect();
  }

  subscribe (channelTypeAndName: String, eventName: String, listener: Function) {
    let channelTypes = ['public', 'private', 'presence'];
    let [publicType, privateType, presenceType] = channelTypes;

    return new Promise((resolve, reject) => {

      if (typeof channelTypeAndName === 'undefined') {
        reject('The channelTypeAndName parameter is required');
      }

      if (typeof channelTypeAndName !== 'string') {
        reject('The channelTypeAndName parameter must be a string');
      }

      if (typeof eventName === "undefined") {
        reject('The eventName parameter is required');
      }

      if (typeof eventName !== "string") {
        reject('The eventName parameter must be a string');
      }

      if (eventName.length === 0) {
        reject('The eventName parameter can not be empty');
      }

      let [channelType, channelName] = channelTypeAndName.split('-');

      if (channelTypes.indexOf(channelType) === -1) {
        reject('The channelTypeAndName parameter must has the type of the channel');
      }

      if (typeof channelName === 'undefined' || channelName.length === 0) {
        reject('The channelTypeAndName parameter must has the name of the channel');
      }

      if (typeof listener === 'undefined') {
        reject('The listener parameter is required');
      }

      if (typeof listener !== 'function') {
        reject('The listener parameter must be a function');
      }

      let pusherDidSubscribeToChannelPromise = new Promise((resolve, reject) => {
        this._pusherDidSubscribeToChannelPromiseResolve = resolve;
        this._pusherDidSubscribeToChannelPromiseReject = reject;
      })

      let eventNames = [eventName];

      if (channelType === publicType) {
        this._pusher.subscribe(channelName, new com.pusher.client.channel.ChannelEventListener({
          onEvent: (channelName, eventName, data) => {
            listener({ channel: channelName, eventName: eventName, data: JSON.parse(data) });
          },
          onSubscriptionSucceeded: (channelName) => {
            resolve();
          }
        }), eventNames);
      }

      if (channelType === privateType) {
        this._pusher.subscribePrivate(channelType + '-' + channelName, new com.pusher.client.channel.PrivateChannelEventListener({
          onEvent: (channelName, eventName, data) => {
            listener({ channel: channelName, eventName: eventName, data: JSON.parse(data) });
          },
          onSubscriptionSucceeded: (channelName) => {
            resolve();
          },
          onAuthenticationFailure: (message: String, exception: Object) => {
            reject(message);
          }
        }), eventNames);
      }

      if (channelType === presenceType) {
        console.log('presence')

        this._pusher.subscribePresence(channelType + '-' + channelName, new com.pusher.client.channel.PresenceChannelEventListener({
          onEvent: (channelName, eventName, data) => {
            listener({ channel: channelName, eventName: eventName, data: JSON.parse(data) });
          },
          onSubscriptionSucceeded: (channelName) => {
            resolve();
          },
          onAuthenticationFailure: (message: String, exception: Object) => {
            reject(message);
          },
          onUsersInformationReceived: (channelName: String, users: Array <any>) => {
            console.log('onUsersInformationReceived')
          },
          userSubscribed: (channelName: String, user: String) => {
            console.log('userSubscribed')
          },
          userUnsubscribed: (channelName: String, user: String) => {
            console.log('userUnsubscribed')
          }
        }), eventNames)
      }

    });
  }

}