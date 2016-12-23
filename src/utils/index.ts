import { IPublicChannelEventListener, IPrivateChannelEventListener, IPresenceChannelEventListener, IPusherOptions } from '../../interfaces';
let defaultChannelTypes = ['public', 'private', 'presence'];
let [publicChannelType, privateChannelType, presenceChannelType] = defaultChannelTypes;

export let channelTypes = {
  publicChannelType,
  privateChannelType,
  presenceChannelType
}

export let getChannelType = (channelName: String) => {
  if (/^presence-/.test(channelName)) {
    return presenceChannelType;
  }

  if (/^private-/.test(channelName)) {
    return privateChannelType;
  }

  return publicChannelType;
}

export let getChannelName = (channelName: String) => {
  let channelType = getChannelType(channelName);

  if (channelType !== publicChannelType) {
    let [, ...channelNameParts] = channelName.split('-');
    channelName = channelNameParts.join('-');
  }

  return channelName;
}

export let validator = {
  appKey (appKey: String) {
    if (typeof appKey === 'undefined' || typeof appKey !== 'string') {
      throw(new Error('pusher-nativescript package error: appKey parameter is required and must be a string'))
    }
  },

  options (platform: String, options: IPusherOptions) {
    if (typeof options !== 'object') {
      throw(new Error('pusher-nativescript package error: options parameter must be an object'))
    }

    if (typeof options.activityTimeout !== 'undefined') {
      if(typeof options.activityTimeout !== 'number') {
        throw(new Error('pusher-nativescript package error: options.activityTimeout property must be a number'));
      }
    }

    if (typeof options.authorizer !== 'undefined') {
      if (typeof options.authorizer !== 'string') {
        throw(new Error('pusher-nativescript package error: options.authorizer property must be a string'));
      }
    }

    if (typeof options.cluster !== 'undefined') {
      if (typeof options.cluster !== 'string') {
        throw(new Error('pusher-nativescript package error: options.cluster property must be a string'));
      }
    }

    if (typeof options.host !== 'undefined') {
      if(typeof options.host !== 'string') {
        throw(new Error('pusher-nativescript package error: options.host property must be a string'));
      }
    }

    if (typeof options.pongTimeout !== 'undefined') {
      if(typeof options.pongTimeout !== 'number') {
        throw(new Error('pusher-nativescript package error: options.pongTimeout property must be a number'));
      }
    }

    if (typeof options.wsPort !== 'undefined') {
      if(typeof options.wsPort !== 'number') {
        throw(new Error('pusher-nativescript package error: options.wsPort property must be a number'));
      }
    }

    if (typeof options.wssPort !== 'undefined') {
      if(typeof options.wssPort !== 'number') {
        throw(new Error('pusher-nativescript package error: options.wssPort property must be a number'));
      }
    }

    if (platform === 'iOS' || platform === 'Android' && typeof options.encrypted !== 'undefined') {
      if (typeof options.encrypted !== 'boolean') {
        throw(new Error('pusher-nativescript package error: options.encrypted parameter is required and must be a boolean'));
      }
    }
  },

  channelName (channelName: String, { allowPublic = true } = {}) {
    if (typeof channelName === 'undefined' || channelName.length === 0) {
      throw(new Error('The channelName parameter is required and can not be empty'));
    }

    if (typeof channelName !== 'string') {
      throw(new Error('The channelName parameter must be a string'));
    }

    let channelType = getChannelType(channelName);
    channelName = getChannelName(channelName);

    if (channelType !== publicChannelType) {
      if (typeof channelName === 'undefined' || channelName.length === 0) {
        throw(new Error('The channelName parameter must has the name of the channel'));
      }  
    }

    if (allowPublic === false) {
      throw(new Error('The type of the channel can not be public'));
    }
  },

  eventName (eventName: String) {
    if (typeof eventName === 'undefined' || eventName.length === 0) {
      throw(new Error('The eventName parameter is required and can not be empty'));
    }

    if (typeof eventName !== 'string') {
      throw(new Error('The eventName parameter must be a string'));
    }
  },

  eventBindingIDs (eventBindingIDs: Array <Number>) {
    if (typeof eventBindingIDs !== 'undefined') {
      if (!Array.isArray(eventBindingIDs) || eventBindingIDs.length === 0) {
        throw(new Error('The eventBindingIDs parameter must be an array and can not be empty'));
      }

      for (let key of eventBindingIDs) {
        if (typeof key !== 'number') {
          throw(new Error('The eventBindingIDs parameter must be an array of number(s)'));
        }
      }
    }
  },

  eventData (eventData: Object) {
    if (typeof eventData === 'undefined' || typeof eventData !== 'object') {
      throw(new Error('The eventData parameter is required and must be an object'));
    }
  },

  channelEventsListener (channelEventsListener: IPublicChannelEventListener | IPrivateChannelEventListener | IPresenceChannelEventListener) {
    if (typeof channelEventsListener === 'undefined' || typeof channelEventsListener !== 'object') {
      throw(new Error('The channelEventsListener parameter is required and must be an object'));
    }

    for (let key in channelEventsListener) {
      if (typeof channelEventsListener[key] !== 'function') {
        throw(new Error('The channelEventsListener parameter must be an object of functions'));
      }
    }

    if (typeof channelEventsListener.onEvent === 'undefined') {
      throw(new Error('The channelEventsListener parameter must has at least \'onEvent\' listener'));
    }
  }
 }
