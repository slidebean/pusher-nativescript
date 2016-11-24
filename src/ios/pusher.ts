declare let NSObject, NSDictionary, PTPusherDelegate, PTPusher;
import { PusherOptions } from '../interfaces/PusherOptions';
import { Observable } from 'rxjs/Rx';

NSDictionary.prototype.toJSON = function () {
  var result = {};
  for ( var key of this ) {
    result[key] = this.objectForKey(key);
  }
  return result;
};

export class Pusher {
  _pusher;
  _options;
  _connectionPromiseResolve;
  _connectionPromiseReject;

  constructor (appKey: String, options: PusherOptions = { encrypted: true }) {

    if (typeof appKey !== 'string') {
      throw(new Error('pusher-nativescript package error: appKey parameter must be a string'))
    }

    if (typeof options !== 'object' && typeof options !== 'undefined') {
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
      },

      pusherWillAuthorizeChannelWithAuthOperation: (pusher, channel, operation) => {
        console.log('pusherWillAuthorizeChannelWithAuthOperation');
      },

      pusherDidSubscribeToChannel: (pusher, channel) => {
        console.log('pusherDidSubscribeToChannel');
      },

      pusherDidUnsubscribeFromChannel: (pusher, channel) => {
        console.log('pusherDidUnsubscribeFromChannel');
      },

      pusherDidFailToSubscribeToChannelWithError: (pusher, channel, error) => {
        console.log('pusherDidFailToSubscribeToChannelWithError');
      },

      pusherDidReceiveErrorEvent: (pusher, errorEvent) => {
        console.log('pusherDidReceiveErrorEvent');
      }
    }, {
      protocols: [PTPusherDelegate]
    });

    let delegate = Delegate.alloc().init();


    if (options.cluster !== undefined) {
      if (typeof options.cluster !== 'string') {
        throw(new Error('pusher-nativescript package error: options.cluster property must be a string'));
      }

      this._pusher = PTPusher.pusherWithKeyDelegateEncryptedCluster(appKey, delegate, options.encrypted, options.cluster);
    } else {
      this._pusher = PTPusher.pusherWithKeyDelegateEncrypted(appKey, delegate, options.encrypted);
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

  subscribe (channelName: String, eventName: String) {
    return new Promise((resolve, reject) => {

      if (typeof channelName !== 'string') {
        reject('channelName parameter must be a string');
      }

      let channelType = channelName.split('-')[0];

      

    });
  }

}