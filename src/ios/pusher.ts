import { IPusher, IPublicChannelEventListener, IPrivateChannelEventListener, IPresenceChannelEventListener, IPusherOptions } from '../../interfaces';
declare let NSObject, NSDictionary, NSURL, PTPusherDelegate, PTPusherPresenceChannelDelegate, PTPusher;
import { errorsHandler, channelTypes } from '../utils';

NSDictionary.prototype.toJSON = function () {
  let result = {};
  for ( let index = 0; index < this.allKeys.count; index ++ ) {
    let key = this.allKeys[index];
    result[key] = this.allValues[index];
  }
  return result;
};

export class Pusher implements IPusher {
  _pusher;
  _options;
  _pusherEventBindings: Array <Object> = [];
  _channelEventsListeners;
  _pusherConnectionDidSuccessDelegate: Function;
  _pusherConnectionDidfailDelegate: Function;
  _pusherChannelSubscriptionDidSuccessDelegate: Function;
  _pusherChannelSubscriptionDidFailDelegate: Function;

  constructor (appKey: String, options: IPusherOptions = { encrypted: true }) {

    let constructorInfo = errorsHandler('constructor', 'iOS', appKey, options);

    if (! constructorInfo.isValid) {
      throw(new Error(constructorInfo.errorMessage));
    }

    let Delegate = NSObject.extend({
      pusherConnectionWillConnect (pusher: Object, connection: Object) {
        return true;
      },

      pusherConnectionDidConnect: (pusher: Object, connection: Object) => this._pusherConnectionDidSuccessDelegate(pusher, connection),

      pusherConnectionDidDisconnectWithErrorWillAttemptReconnect: (pusher: Object, connection: Object, error: Object, willAttemptReconnect: Boolean) => this._pusherConnectionDidfailDelegate(pusher, connection, error, willAttemptReconnect),

      pusherConnectionWillAutomaticallyReconnectAfterDelay (pusher, connection, delay) {
        return true;
      },

      pusherDidSubscribeToChannel: (pusher, channel) => {
        this._pusherChannelSubscriptionDidSuccessDelegate(channel);

        if (typeof this._channelEventsListeners.onSubscriptionSucceeded !== 'undefined') {
          this._channelEventsListeners.onSubscriptionSucceeded(channel.name);
        }
      },

      pusherDidFailToSubscribeToChannelWithError: (pusher, channel, error)  => {

        let subscriptionError = error.localizedDescription

        this._pusherChannelSubscriptionDidFailDelegate(subscriptionError);

        if (typeof this._channelEventsListeners.onAuthenticationFailure !== 'undefined') {
          this._channelEventsListeners.onAuthenticationFailure(subscriptionError);
        }
      }
    }, {
      protocols: [PTPusherDelegate]
    });

    let delegate = Delegate.alloc().init();

    if (options.cluster) {
      this._pusher = PTPusher.pusherWithKeyDelegateEncryptedCluster(appKey, delegate, options.encrypted, options.cluster);
    } else {
      this._pusher = PTPusher.pusherWithKeyDelegateEncrypted(appKey, delegate, options.encrypted);
    }

    if (options.authorizer) {
      this._pusher.authorizationURL = NSURL.URLWithString(options.authorizer);
    }

  }

  public connect () {

    this._pusher.connect();

    return new Promise((resolve, reject) => {
      this._pusherConnectionDidSuccessDelegate = (pusher: Object, connection: Object) => {
        let connectionEstablished = connection.connected;

        if (connectionEstablished) {
          resolve();
        }
      }

      this._pusherConnectionDidfailDelegate = (pusher: Object, connection: Object, error: Object, willAttemptReconnect: Boolean) => {
        let errorReason = error.userInfo.objectForKey('reason');

        reject(errorReason);
      }
    });
  }

  public disconnect () {
    this._pusher.disconnect();
  }

  public subscribe (channelName: String, eventName: String, channelEventsListeners: IPublicChannelEventListener | IPrivateChannelEventListener | IPresenceChannelEventListener) {

    let subscribeInfo = errorsHandler('subscribe', channelName, eventName, channelEventsListeners);

    return new Promise((resolve, reject) => {

      if (!subscribeInfo.isValid) {
        return reject(subscribeInfo.errorMessage);
      }

      this._channelEventsListeners = channelEventsListeners;

      let channel;

      let subscriptionMethodName = {
        'public': 'subscribeToChannelNamed',
        'private': 'subscribeToPrivateChannelNamed',
        'presence': 'subscribeToPresenceChannelNamedDelegate'
      }[subscribeInfo.channelInfo.channelType];

      channel = this.getChannelByNameAndType(subscribeInfo.channelInfo.channelName, subscribeInfo.channelInfo.channelType)

      if (!channel) {
        if (subscribeInfo.channelInfo.channelType === channelTypes.presenceChannelType) {
          let Delegate = NSObject.extend({
            presenceChannelDidSubscribe: (channel: Object) => {
              
              let members = [];

              for ( let memberIndex = 0; memberIndex < channel.members.valueForKey('members').allKeys.count; memberIndex ++ ) {
                let userID = channel.members.valueForKey('members').allKeys[memberIndex];

                let userInfo = { };

                for (let infoIndex = 0; infoIndex < channel.members.valueForKey('members').allValues[memberIndex].userInfo.allKeys.count; infoIndex ++) {
                  let infoKey = channel.members.valueForKey('members').allValues[memberIndex].userInfo.allKeys[infoIndex];
                  userInfo[infoKey] = channel.members.valueForKey('members').allValues[memberIndex].userInfo.allValues[infoIndex];
                }

                let user = {
                  userID,
                  userInfo
                }
                members.push(user);
              }

              if (typeof this._channelEventsListeners.onMemberInformationReceived !== 'undefined') {
                this._channelEventsListeners.onMemberInformationReceived(channel.name, members);
              }
            },
            presenceChannelMemberAdded: (channel: Object, member: Object) => {

              let member = {
                userID: member.userID
                userInfo: member.userInfo.toJSON()
              }

              if (typeof this._channelEventsListeners.memberSubscribed !== 'undefined') {
                this._channelEventsListeners.memberSubscribed(channel.name, member);
              }
            },
            presenceChannelMemberRemoved: (channel: Object, member: Object) => {

              let member = {
                userID: member.userID
                userInfo: member.userInfo.toJSON()
              }

              if (typeof this._channelEventsListeners.memberUnsubscribed !== 'undefined') {
                this._channelEventsListeners.memberUnsubscribed(channel.name, member)
              }
            }
          }, {
            protocols: [PTPusherPresenceChannelDelegate]
          });

          let presenceDelegate = Delegate.alloc().init();

          channel = this._pusher[subscriptionMethodName](subscribeInfo.channelInfo.channelName, presenceDelegate);
        } else {
          channel = this._pusher[subscriptionMethodName](subscribeInfo.channelInfo.channelName);
        }
      } else {
        let eventBindingID = this.bindEventToTheChannel(channel, subscribeInfo.channelInfo.channelName, eventName, this._channelEventsListeners.onEvent);
        resolve(eventBindingID);
      }

      this._pusherChannelSubscriptionDidSuccessDelegate = (channel: Object) => {
        let eventBindingID = this.bindEventToTheChannel(channel, subscribeInfo.channelInfo.channelName, eventName, this._channelEventsListeners.onEvent);
        resolve(eventBindingID);
      }

      this._pusherChannelSubscriptionDidFailDelegate = error => reject(error)
      
    });
  }

  public unsubscribe (channelName: String, eventBindingIDs?: Array <Number>) {

    let unsubscribeInfo = errorsHandler('unsubscribe', channelName, eventBindingIDs, this._pusherEventBindings);

    if (!unsubscribeInfo.isValid) {
      throw(new Error(unsubscribeInfo.errorMessage));
    }

    if (typeof eventBindingIDs !== 'undefined') {
      for (let key in this._pusherEventBindings) {
        if (eventBindingIDs.indexOf(this._pusherEventBindings[key].eventBindingID) !== -1 ) {
          this._pusherEventBindings[key].pusherEventBinding.invalidate()
          this._pusherEventBindings.splice(key, 1);
        }
      }
    } else {
      let channel = this.getChannelByNameAndType(unsubscribeInfo.channelInfo.channelName, unsubscribeInfo.channelInfo.channelType);
      channel.unsubscribe();
    }
    
  }

  public trigger (channelName: String, eventName: String, eventData: Object) {

    let triggerInfo = errorsHandler('trigger', channelName, eventName, eventData);

    return new Promise((resolve, reject) => {

      if (!triggerInfo.isValid) {
        return reject(triggerInfo.errorMessage);
      }

      let channel = this.getChannelByNameAndType(triggerInfo.channelInfo.channelName, triggerInfo.channelInfo.channelType);

      let interval = setInterval(() => {
        if (channel.subscribed) {
          channel.triggerEventNamedData(`client-${ eventName }`, JSON.stringify(eventData))
          clearInterval(interval);
          resolve();
        }
      }, 10)

    });
  }

  private bindEventToTheChannel (channel: Object, channelName: String, eventName: String, handler: Function) {
    let pusherEventBinding = channel.bindToEventNamedHandleWithBlock(eventName, channelEvent => {
      let eventData = { channel: channelEvent.channel, eventName: channelEvent.name, data: channelEvent.data.toJSON() };
      handler(eventData);
    })

    let eventBindingID = this._pusherEventBindings.length;

    let eventBindingData = {
      eventBindingID: eventBindingID,
      pusherEventBinding: pusherEventBinding
    }

    this._pusherEventBindings.push(eventBindingData);

    

    return eventBindingID;
  }

  private getChannelByNameAndType (channelName: String, channelType: String) {
    return this._pusher.channelNamed((channelType === channelTypes.publicChannelType) ? channelName : `${ channelType }-${ channelName }`);
  }

}