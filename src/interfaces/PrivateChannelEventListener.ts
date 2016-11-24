import { ChannelEventListener } from './ChannelEventListener';

export interface PrivateChannelEventListener extends ChannelEventListener {

  onAuthenticationFailure (message: String, exception: Error): void;

}
