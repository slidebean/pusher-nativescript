import { IConnectionEventListeners , IPublicChannelEventListener, IPrivateChannelEventListener, IPresenceChannelEventListener, IPusherOptions } from '../../interfaces';
import { errorsHandler, channelTypes } from '../utils';
declare let com;

export class Pusher {
  _pusher;
  _options;
  _pusherEventBindings: Array <Object> = [];
  _pusherDidSubscribeToChannelPromiseResolve;
  _pusherDidSubscribeToChannelPromiseReject;

  constructor (appKey: String, options: IPusherOptions = { encrypted: true }) {

    let constructorInfo = errorsHandler('constructor', 'Android', appKey, options);

    if (! constructorInfo.isValid) {
      throw(new Error(constructorInfo.errorMessage));
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

    if (typeof options.host !== 'undefined') {
      if(typeof options.host !== 'string') {
        throw(new Error('pusher-nativescript package error: options.host property must be a string'));
      }

      this._options.setHost(options.host);
    }

    if (typeof options.pongTimeout !== 'undefined') {
      if(typeof options.pongTimeout !== 'number') {
        throw(new Error('pusher-nativescript package error: options.pongTimeout property must be a number'));
      }

      this._options.setPongTimeout(options.pongTimeout);
    }

    if (typeof options.wsPort !== 'undefined') {
      if(typeof options.wsPort !== 'number') {
        throw(new Error('pusher-nativescript package error: options.wsPort property must be a number'));
      }

      this._options.setWsPort(options.wsPort);
    }

    if (typeof options.wssPort !== 'undefined') {
      if(typeof options.wssPort !== 'number') {
        throw(new Error('pusher-nativescript package error: options.wssPort property must be a number'));
      }

      this._options.setWssPort(options.wssPort);
    }

    this._pusher = new com.pusher.client.Pusher(appKey, this._options);
    
  }

  connect () {
    return new Promise((resolve, reject) => {
      let listeners:IConnectionEventListeners  = {
        onConnectionStateChange (change: Object) {
          let connectionCurrentState = change.getCurrentState().name();

          if (connectionCurrentState === "CONNECTED") {
            resolve();
          }
        },

        onError (message: String, code: String, exception: Object) {
          console.log(exception)
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

  subscribe (channelTypeAndName: String, eventName: String, channelEventsListeners: IPublicChannelEventListener | IPrivateChannelEventListener | IPresenceChannelEventListener) {

    let subscribeInfo = errorsHandler('subscribe', channelTypeAndName, eventName, channelEventsListeners);

    return new Promise((resolve, reject) => {

      if (!subscribeInfo.isValid) {
        return reject(subscribeInfo.errorMessage);
      }

      let pusherDidSubscribeToChannelPromise = new Promise((resolve, reject) => {
        this._pusherDidSubscribeToChannelPromiseResolve = resolve;
        this._pusherDidSubscribeToChannelPromiseReject = reject;
      })

      let eventNames = [eventName];

      let subscriptionMethodNameAndChannelEventListenerName = {
        'public': 'subscribe-ChannelEventListener',
        'private': 'subscribePrivate-PrivateChannelEventListener',
        'presence': 'subscribePresence-PresenceChannelEventListener'
      }[subscribeInfo.channelInfo.channelType];

      let [subscriptionMethodName, channelEventListenerName] = subscriptionMethodNameAndChannelEventListenerName.split('-');

      let channelName = (subscribeInfo.channelInfo.channelType === channelTypes.publicChannelType) ? subscribeInfo.channelInfo.channelName : `${ subscribeInfo.channelInfo.channelType }-${ subscribeInfo.channelInfo.channelName }`;

      let pusherEventBinding = new com.pusher.client.channel[channelEventListenerName]({
        onEvent (channelName, eventName, data) {
          channelEventsListeners.onEvent({ channel: channelName, eventName: eventName, data: JSON.parse(data) });
        },
        onSubscriptionSucceeded (channelName: String) {
          if (typeof channelEventsListeners.onSubscriptionSucceeded !== 'undefined') {
            channelEventsListeners.onSubscriptionSucceeded(channelName);
          }
          resolve();
        },
        onAuthenticationFailure (message: String, exception: Object) {
          if (typeof channelEventsListeners.onAuthenticationFailure !== 'undefined') {
            channelEventsListeners.onAuthenticationFailure(message);
          }
          reject(message);
        },
        onUsersInformationReceived (channelName: String, subscribedMembers: Array <any>) {
          console.log('onUsersInformationReceived')

          let members = [];

          for (let index = 0; index < subscribedMembers.toArray().length; index ++ ) {

            let memberInfo = {
              userID: subscribedMembers.toArray()[index].getId(),
              userInfo: JSON.parse(subscribedMembers.toArray()[index].getInfo())
            };

            members.push(memberInfo);
          }

          if (typeof channelEventsListeners.onMemberInformationReceived !== 'undefined') {
            channelEventsListeners.onMemberInformationReceived(channelName, members);
          }
        },
        userSubscribed (channelName: String, memberSubscribed: Array <Object>) {
          console.log('userSubscribed')

          let member = {
            userID: memberSubscribed.getId()
            userInfo: JSON.parse(memberSubscribed.getInfo())
          }

          if (typeof channelEventsListeners.memberSubscribed !== 'undefined') {
            channelEventsListeners.memberSubscribed(channelName, member)
          }
        },
        userUnsubscribed (channelName: String, memberUnsubscribed: Array <Object>) {
          console.log('userUnsubscribed')

          let member = {
            userID: memberUnsubscribed.getId()
            userInfo: JSON.parse(memberUnsubscribed.getInfo())
          }

          if (typeof channelEventsListeners.memberUnsubscribed !== 'undefined') {
            channelEventsListeners.memberUnsubscribed(channelName, member);
          }
        }
      })

      this._pusher[subscriptionMethodName](channelName, pusherEventBinding, eventNames);

      let eventBindingData = {
        channelName: subscribeInfo.channelInfo.channelName,
        eventName: eventName,
        pusherEventBinding: pusherEventBinding
      }

      this._pusherEventBindings.push(eventBindingData);

    });
  }

  unsubscribe (channelTypeAndName: String, eventNames?: Array <String>) {

    let unsubscribeInfo = errorsHandler('unsubscribe', channelTypeAndName, eventNames);

    if (!unsubscribeInfo.isValid) {
      throw(new Error(unsubscribeInfo.errorMessage));
    }

    if (typeof eventNames !== 'undefined') {
      for (let key in this._pusherEventBindings) {
        if ( unsubscribeInfo.channelInfo.channelName === this._pusherEventBindings[key].channelName && eventNames.indexOf(this._pusherEventBindings[key].eventName) !== -1 ) {
          let channel = this.getChannelByNameAndType(unsubscribeInfo.channelInfo.channelName, unsubscribeInfo.channelInfo.channelType);
          channel.unbind(this._pusherEventBindings[key].eventName, this._pusherEventBindings[key].pusherEventBinding);
          this._pusherEventBindings.splice(key, 1);
        }
      }
    } else {
      this._pusher.unsubscribe((unsubscribeInfo.channelInfo.channelType === channelTypes.publicChannelType ) ? unsubscribeInfo.channelInfo.channelName : `${ unsubscribeInfo.channelInfo.channelType }-${ unsubscribeInfo.channelInfo.channelName }`);
    }
  }

  trigger (channelTypeAndName: String, eventName: String, eventData: Object) {

    let triggerInfo = errorsHandler('trigger', channelTypeAndName, eventName, eventData);

    return new Promise((resolve, reject) => {

      if (!triggerInfo.isValid) {
        return reject(triggerInfo.errorMessage);
      }

      let channel = this.getChannelByNameAndType(triggerInfo.channelInfo.channelType, triggerInfo.channelInfo.channelName);

      let interval = setInterval(() => {
        if (channel.isSubscribed()) {
          channel.trigger(`client-${ eventName }`, JSON.stringify(eventData))
          clearInterval(interval);
          resolve();
        }
      }, 10)

    });
  }

  getChannelByNameAndType (channelName: String, channelType: String) {
    let getChannelMethodName = {
      'public': 'getChannel',
      'private': 'getPrivateChannel',
      'presence': 'getPresenceChannel'
    }[channelType];

    return this._pusher[getChannelMethodName]((channelType === channelTypes.publicChannelType) ? channelName : `${ channelType }-${ channelName }`);
  }

}