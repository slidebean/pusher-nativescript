import { IPublicChannelEventListener, IPrivateChannelEventListener, IPresenceChannelEventListener } from '../../interfaces';
let defaultChannelTypes = ['public', 'private', 'presence'];
let [publicChannelType, privateChannelType, presenceChannelType] = defaultChannelTypes;

export let channelTypes = {
  publicChannelType,
  privateChannelType,
  presenceChannelType
}

let validator = {
  appKey (appKey: String) {
    if (typeof appKey === 'undefined' || typeof appKey !== 'string') {
      throw(new Error('pusher-nativescript package error: appKey parameter is required and must be a string'))
    }
  },

  options (platform: String, options: Object) {
    if (typeof options !== 'object') {
      throw(new Error('pusher-nativescript package error: options parameter must be an object'))
    }

    if (platform === 'iOS') {
      if (typeof options.encrypted !== 'boolean') {
        throw(new Error('pusher-nativescript package error: options.encrypted parameter is required and must be a boolean'));
      }
    }
  },

  channelTypeAndName (method: String, channelTypeAndName: String) {
    if (typeof channelTypeAndName === 'undefined' || channelTypeAndName.length === 0) {
      throw(new Error('The channelTypeAndName parameter is required and can not be empty'));
    }

    if (typeof channelTypeAndName !== 'string') {
      throw(new Error('The channelTypeAndName parameter must be a string'));
    }

    let [channelType, channelName] = channelTypeAndName.split('-');

    if (defaultChannelTypes.indexOf(channelType) === -1) {
      throw(new Error('The channelTypeAndName parameter must has the type of the channel'));
    }

    if (typeof channelName === 'undefined' || channelName.length === 0) {
      throw(new Error('The channelTypeAndName parameter must has the name of the channel'));
    }

    if (method === 'trigger') {
      if (channelType === publicChannelType) {
        throw(new Error('The type of the channel can not be public'));
      }
    }

    return { 
      channelType,
      channelName
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

  eventNames (eventNames: Array <string>) {
    if (typeof eventNames !== 'undefined') {
      if (!Array.isArray(eventNames) || eventNames.length === 0) {
        throw(new Error('The eventNames parameter must be an array and can not be empty'));
      }

      for (let key of eventNames) {
        if (typeof key !== 'string') {
          throw(new Error('The eventNames parameter must be an array of string(s)'));
        }

        if (key.length === 0) {
          throw(new Error('The eventNames parameter can not contains empty strings'));
        }
      }
    }
  },

  eventData (eventData: String) {
    if (typeof eventData === 'undefined' || typeof eventData !== 'object') {
      throw(new Error('The eventData parameter is required and must be an object'));
    }
  },

  channelEventsListeners (channelEventsListeners: IPublicChannelEventListener | IPrivateChannelEventListener | IPresenceChannelEventListener) {
    if (typeof channelEventsListeners === 'undefined' || typeof channelEventsListeners !== 'object') {
      throw(new Error('The channelEventsListeners parameter is required and must be an object'));
    }

    for (let key in channelEventsListeners) {
      if (typeof channelEventsListeners[key] !== 'function') {
        throw(new Error('The channelEventsListeners parameter must be an object of functions'));
      }
    }

    if (typeof channelEventsListeners.onEvent === 'undefined') {
      throw(new Error('The channelEventsListeners parameter must has at least \'onEvent\' listener'));
    }
  }
 }

export let errorsHandler = (method: String, ...params: Array <any>) => {
  let validationInfo = {
    isValid: true,
    errorMessage: '',
    channelInfo: null
  }

  switch (method) {
    case 'constructor':

      let [platform, appKey, options] = params;

      try {
        validator.appKey(appKey);
        validator.options(platform, options);
      } catch (error) {
        validationInfo.isValid = false;
        validationInfo.errorMessage = error;
      }

    break;

    case 'subscribe':

      let [channelTypeAndName, eventName, channelEventsListeners] = params;

      try {
        validationInfo.channelInfo = validator.channelTypeAndName(method, channelTypeAndName);
        validator.eventName(eventName);
        validator.channelEventsListeners(channelEventsListeners);
      } catch (error) {
        validationInfo.isValid = false;
        validationInfo.errorMessage = error;
      }

    break;

    case 'unsubscribe':

      let [channelTypeAndName, eventNames] = params;

      try {
        validationInfo.channelInfo = validator.channelTypeAndName(method, channelTypeAndName);
        validator.eventNames(eventNames);
      } catch (error) {
        validationInfo.isValid = false;
        validationInfo.errorMessage = error;
      }

    break;


    case 'trigger':

      let [channelTypeAndName, eventName, eventData] = params;

      try {
        validationInfo.channelInfo = validator.channelTypeAndName(method, channelTypeAndName);
        validator.eventName(eventName);
        validator.eventData(eventData);
      } catch (error) {
        validationInfo.isValid = false;
        validationInfo.errorMessage = error;
      }

    break;


  }

  return validationInfo;

}

