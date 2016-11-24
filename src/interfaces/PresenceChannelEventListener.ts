import { PrivateChannelEventListener } from './PrivateChannelEventListener';

export interface PresenceChannelEventListener extends PrivateChannelEventListener {

  onUserInformationReceived (channelName: String, users: Array <any>): void;

  userSubscribed (channelName: String, user: String): void;

  userUnsubscribed (channelName: String, user: String): void;

}
