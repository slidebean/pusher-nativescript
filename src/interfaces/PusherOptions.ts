/**
 * Configuration for a pusher-nativesript instance.
 */

export interface PusherOptions {
  /**
   * Sets the number of milliseconds of inactivity at which a "ping" will be
   * triggered to check the connection.
   */
  activityTimeout?: Number,

  /**
   * Sets the number of milliseconds after a "ping" is sent that the client will
   * wait to receive a "pong" response from the server before considering the
   * connection broken and triggering a transition to the disconnected state.
   */
  pongTimeout?: Number;

  /**
   * Sets the authorizer to be used when authenticating private and presence
   * channels.
   */
  authorizer?: String,

  /**
   * Sets a specific Pusher cluster you will connect
   */

  cluster?: String,

  /**
   * Sets whether an encrypted (SSL) connection should be used when connecting to
   * Pusher.
   */
  encrypted?: Boolean,

  /**
   * Sets the host to which connections will be made.
   */
  host?: String,

  /**
   * Sets the port to which unencrypted connections will be made.
   */
  wsPort?: Number,

  /**
   * Sets the port to which encrypted connections will be made.
   */
  wssPort?: Number,
}