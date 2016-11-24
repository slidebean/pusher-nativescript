import { PusherOptions } from '../interfaces/PusherOptions';
import { ConnectionEventListeners } from '../interfaces/ConnectionEventListeners';
declare let com;

export class Pusher {
  _pusher;
  _options;

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

    if (options.authorizer) {
      let _authorizer = new com.pusher.client.util.HttpAuthorizer(options.authorizer);
      this._options.setAuthorizer(_authorizer);
    }

    if (options.cluster) {
      this._options.setCluster(options.cluster);
    }

    if (options.encrypted) {
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

}