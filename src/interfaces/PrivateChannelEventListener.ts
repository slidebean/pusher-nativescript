import { PublicChannelEventListener } from './PublicChannelEventListener';

/**
 * Used to listen for private specific events as well as those defined by the
 * PublicChannelEventListener and parent interfaces.
 */
export interface PrivateChannelEventListener extends PublicChannelEventListener {

  /**
   * Called when an attempt to authenticate a private channel fails.
   *
   * @param error A description of the problem.
   */
  onAuthenticationFailure (error: String): void;

}
