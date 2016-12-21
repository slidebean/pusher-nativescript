import { IPusher, IConnectionEventListener , IPublicChannelEventListener, IPrivateChannelEventListener, IPresenceChannelEventListener, IPusherOptions } from '../../interfaces';
import { channelTypes, validator } from '../utils';
declare let com;

export class Pusher implements IPusher {
  _pusher;
  _options;
  _pusherEventBindings: Array <Object> = [];

  constructor (appKey: String, options: IPusherOptions = { encrypted: true }) {

    validator.appKey(appKey);
    validator.options('Android', options);

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

    if (typeof options.encrypted !== 'undefined') {
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

  public connect () {
    return new Promise((resolve, reject) => {
      let listeners:IConnectionEventListener  = {
        onConnectionStateChange (change: Object) {
          let connectionCurrentState = change.getCurrentState().name();

          if (connectionCurrentState === "CONNECTED") {
            resolve();
          }
        },

        onError (message: String, code: String, exception: Object) {
          reject(message);
        }
      }

      let connectionEventListener = new com.pusher.client.connection.ConnectionEventListener(listeners);

      let connectionStates = [];

      this._pusher.connect(connectionEventListener, connectionStates);
    });

  }

  public disconnect () {
    this._pusher.disconnect();
  }

  public subscribe (channelName: String, eventName: String, channelEventsListener: IPublicChannelEventListener | IPrivateChannelEventListener | IPresenceChannelEventListener) {

    let channelInfo = validator.channelName(channelName);
    validator.eventName(eventName);
    validator.channelEventsListener(channelEventsListener);

    return new Promise((resolve, reject) => {

      let eventNames = [eventName];
      let channel;
      let eventBindingID = this._pusherEventBindings.length;

      let subscriptionMethodNameAndChannelEventListenerName = {
        'public': 'subscribe-ChannelEventListener',
        'private': 'subscribePrivate-PrivateChannelEventListener',
        'presence': 'subscribePresence-PresenceChannelEventListener'
      }[channelInfo.channelType];

      let [subscriptionMethodName, channelEventListenerName] = subscriptionMethodNameAndChannelEventListenerName.split('-');

      let channelName = (channelInfo.channelType === channelTypes.publicChannelType) ? channelInfo.channelName : `${ channelInfo.channelType }-${ channelInfo.channelName }`;

      channel = this.getChannelByNameAndType(channelName, channelInfo.channelType);
        
      let pusherEventBinding = new com.pusher.client.channel[channelEventListenerName]({
        onEvent (channelName, eventName, data) {
          channelEventsListener.onEvent({ channel: channelName, eventName: eventName, data: JSON.parse(data) });
        },
        onSubscriptionSucceeded (channelName: String) {
          if (typeof channelEventsListener.onSubscriptionSucceeded !== 'undefined') {
            channelEventsListener.onSubscriptionSucceeded(channelName);
          }
          resolve(eventBindingID);
        },
        onAuthenticationFailure (message: String, exception: Object) {
          if (typeof channelEventsListener.onAuthenticationFailure !== 'undefined') {
            channelEventsListener.onAuthenticationFailure(message);
          }
          reject(message);
        },
        onUsersInformationReceived (channelName: String, subscribedMembers: Array <any>) {

          let members = [];

          for (let index = 0; index < subscribedMembers.toArray().length; index ++ ) {

            let memberInfo = {
              userID: subscribedMembers.toArray()[index].getId(),
              userInfo: JSON.parse(subscribedMembers.toArray()[index].getInfo())
            };

            members.push(memberInfo);
          }

          if (typeof channelEventsListener.onMemberInformationReceived !== 'undefined') {
            channelEventsListener.onMemberInformationReceived(channelName, members);
          }
        },
        userSubscribed (channelName: String, memberSubscribed: Array <Object>) {

          let member = {
            userID: memberSubscribed.getId()
            userInfo: JSON.parse(memberSubscribed.getInfo())
          }

          if (typeof channelEventsListener.memberSubscribed !== 'undefined') {
            channelEventsListener.memberSubscribed(channelName, member)
          }
        },
        userUnsubscribed (channelName: String, memberUnsubscribed: Array <Object>) {

          let member = {
            userID: memberUnsubscribed.getId()
            userInfo: JSON.parse(memberUnsubscribed.getInfo())
          }

          if (typeof channelEventsListener.memberUnsubscribed !== 'undefined') {
            channelEventsListener.memberUnsubscribed(channelName, member);
          }
        }
      })

      if (!channel) {
        this._pusher[subscriptionMethodName](channelName, pusherEventBinding, eventNames);
      } else {
        channel.bind(eventName, pusherEventBinding);
      }

      let eventBindingData = {
        eventBindingID: eventBindingID,
        channelName: channelInfo.channelName,
        eventName: eventName,
        pusherEventBinding: pusherEventBinding
      }

      this._pusherEventBindings.push(eventBindingData);

    });
  }

  public unsubscribe (channelName: String, eventBindingIDs?: Array <Number>) {

    let channelInfo = validator.channelName(channelName);
    validator.eventBindingIDs(eventBindingIDs);

    if (typeof eventBindingIDs !== 'undefined') {
      for (let key in this._pusherEventBindings) {
        if ( channelInfo.channelName === this._pusherEventBindings[key].channelName && eventBindingIDs.indexOf(this._pusherEventBindings[key].eventBindingID) !== -1 ) {
          let channel = this.getChannelByNameAndType(channelInfo.channelName, channelInfo.channelType);
          channel.unbind(this._pusherEventBindings[key].eventName, this._pusherEventBindings[key].pusherEventBinding);
          this._pusherEventBindings.splice(key, 1);
        }
      }
    } else {
      this._pusher.unsubscribe((channelInfo.channelType === channelTypes.publicChannelType ) ? channelInfo.channelName : `${ channelInfo.channelType }-${ channelInfo.channelName }`);
    }
  }

  public trigger (channelName: String, eventName: String, eventData: Object) {

    let channelInfo = validator.channelName(channelName, 'trigger');
    validator.eventName(eventName);
    validator.eventData(eventData);

    return new Promise((resolve, reject) => {

      let channel = this.getChannelByNameAndType(channelInfo.channelType, channelInfo.channelName);

      let interval = setInterval(() => {
        if (channel.isSubscribed()) {
          channel.trigger(`client-${ eventName }`, JSON.stringify(eventData))
          clearInterval(interval);
          resolve();
        }
      }, 10)

    });
  }

  private getChannelByNameAndType (channelName: String, channelType: String) {
    let getChannelMethodName = {
      'public': 'getChannel',
      'private': 'getPrivateChannel',
      'presence': 'getPresenceChannel'
    }[channelType];

    return this._pusher[getChannelMethodName]((channelType === channelTypes.publicChannelType) ? channelName : `${ channelType }-${ channelName }`);
  }

}