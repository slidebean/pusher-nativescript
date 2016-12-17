import { IPrivateChannelEventListener } from './IPrivateChannelEventListener';

/**
 * Used to listen for presence specific events as well as those defined by the
 * PrivateChannelEventListener and parent interfaces.
 */
export interface IPresenceChannelEventListener extends IPrivateChannelEventListener {

  /**
   * Called when the subscription has succeeded and an initial list of
   * subscribed users has been received from Pusher.
   *
   * @param channelName The name of the channel the list is for.
   *
   * @param members The current members subscribed to the channel.
   */
  onMemberInformationReceived (channelName: String, members: Array <Object>): void;

  /**
   * Called when a new member subscribes to the channel.
   *
   * @param channelName The name of the channel the member is for.
   *
   * @param member The newly subscribed member.
   */
  memberSubscribed (channelName: String, member: Object): void;

  /**
   * Called when an existing user unsubscribes from the channel.
   *
   * @param channelName The name of the channel that the member unsubscribed from.
   *
   * @param member The member who unsubscribed.
   */
  memberUnsubscribed (channelName: String, member: Object): void;

}
