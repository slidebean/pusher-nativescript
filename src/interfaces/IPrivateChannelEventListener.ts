import { IPublicChannelEventListener } from './IPublicChannelEventListener';

/**
 * Used to listen for private specific events as well as those defined by the
 * IPublicChannelEventListener and parent interfaces.
 */
export interface IPrivateChannelEventListener extends IPublicChannelEventListener {

  /**
   * Called when an attempt to authenticate a private channel fails.
   *
   * @param error A description of the problem.
   */
  onAuthenticationFailure (error: String): void;

}
