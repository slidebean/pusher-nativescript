declare let NSObject, NSDictionary, NSURL, PTPusherDelegate, PTPusherPresenceChannelDelegate, PTPusher;
import { PusherOptions } from '../interfaces/PusherOptions';
import { Observable } from 'rxjs/Rx';

NSDictionary.prototype.toJSON = function () {
  let result = {};
  for ( let index = 0; index < this.allKeys.count; index ++ ) {
    let key = this.allKeys[index];
    result[key] = this.allValues[index];
  }
  return result;
};

export class Pusher {
  _pusher;
  _options;
  _connectionPromiseResolve;
  _connectionPromiseReject;
  _pusherDidSubscribeToChannelPromiseResolve;
  _pusherDidSubscribeToChannelPromiseReject;

  constructor (appKey: String, options: PusherOptions = { encrypted: true }) {

    if (typeof appKey === 'undefined') {
      throw(new Error('pusher-nativescript package error: appKey parameter is required'))
    }

    if (typeof appKey !== 'string') {
      throw(new Error('pusher-nativescript package error: appKey parameter must be a string'))
    }

    if (typeof options !== 'object') {
      throw(new Error('pusher-nativescript package error: options parameter must be an object'))
    }

    let Delegate = NSObject.extend({
      pusherConnectionWillConnect: (pusher: Object, connection: Object) => {
        return true;
      },

      pusherConnectionDidConnect: (pusher: Object, connection: Object) => {
        console.log('pusherConnectionDidConnect');
        let connectionEstablished = connection.connected;

        if (connectionEstablished) {
          this._connectionPromiseResolve();
        }
      },

      pusherConnectionDidDisconnectWithErrorWillAttemptReconnect: (pusher: Object, connection: Object, error: Object, willAttemptReconnect: Boolean) => {
        console.log('pusherConnectionDidDisconnectWithErrorWillAttemptReconnect');
        let errorReason = error.userInfo.objectForKey('reason');

        this._connectionPromiseReject(errorReason);
      },

      pusherConnectionFailedWithError: (pusher, connection, error) => {
        console.log('pusherConnectionFailedWithError');
      },

      pusherConnectionWillAutomaticallyReconnectAfterDelay: (pusher, connection, delay) => {
        console.log('pusherConnectionWillAutomaticallyReconnectAfterDelay');
        return true;
      },

      pusherWillAuthorizeChannelWithAuthOperation: (pusher, channel, operation) => {
        console.log('pusherWillAuthorizeChannelWithAuthOperation');
      },

      pusherDidSubscribeToChannel: (pusher, channel) => {
        console.log('pusherDidSubscribeToChannel');
        this._pusherDidSubscribeToChannelPromiseResolve(channel);
      },

      pusherDidUnsubscribeFromChannel: (pusher, channel) => {
        console.log('pusherDidUnsubscribeFromChannel');
      },

      pusherDidFailToSubscribeToChannelWithError: (pusher, channel, error) => {
        console.log('pusherDidFailToSubscribeToChannelWithError');
        let subscriptionError = error.userInfo.objectForKey('NSUnderlyingError').userInfo.objectForKey('NSLocalizedDescription');
        this._pusherDidSubscribeToChannelPromiseReject(subscriptionError);
      },

      pusherDidReceiveErrorEvent: (pusher, errorEvent) => {
        console.log('pusherDidReceiveErrorEvent');
      }
    }, {
      protocols: [PTPusherDelegate]
    });

    let delegate = Delegate.alloc().init();

    if (typeof options.cluster !== 'undefined') {
      if (typeof options.cluster !== 'string') {
        throw(new Error('pusher-nativescript package error: options.cluster property must be a string'));
      }

      this._pusher = PTPusher.pusherWithKeyDelegateEncryptedCluster(appKey, delegate, options.encrypted, options.cluster);
    } else {
      this._pusher = PTPusher.pusherWithKeyDelegateEncrypted(appKey, delegate, options.encrypted);
    }

    if (typeof options.authorizer !== 'undefined') {
      if (typeof options.authorizer !== 'string') {
        throw(new Error('pusher-nativescript package error: options.authorizer property must be a string'));
      }

      this._pusher.authorizationURL = NSURL.URLWithString(options.authorizer);
    }

  }

  connect () {

    this._pusher.connect();

    return new Promise((resolve, reject) => {
      this._connectionPromiseResolve = resolve;
      this._connectionPromiseReject = reject;
    });
  }

  disconnect () {
    this._pusher.disconnect();
  }

  subscribe (channelTypeAndName: String, eventName: String, listener: Function) {
    let channelTypes = ['public', 'private', 'presence'];
    let [publicType, privateType, presenceType] = channelTypes;

    return new Promise((resolve, reject) => {
      let channel;

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

      if (channelType === publicType) {
        this._pusher.subscribeToChannelNamed(channelName);
      }

      if (channelType === privateType) {
        this._pusher.subscribeToPrivateChannelNamed(channelName);
      }

      if (channelType === presenceType) {
        this._pusher.subscribeToPresenceChannelNamed(channelName);
      }
      
      pusherDidSubscribeToChannelPromise.then((channel: Object) => {
        channel.bindToEventNamedHandleWithBlock(eventName, channelEvent => {
          let eventData = { channel: channelEvent.channel, eventName: channelEvent.name, data: channelEvent.data.toJSON() };
          listener(eventData);
        }) 
        resolve();
      }).catch((error) => {
        reject(error);
      });

    });
  }

}