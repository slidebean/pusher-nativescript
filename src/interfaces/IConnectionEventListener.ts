/**
 * Used to listen for connection specific events.
 */
export interface IConnectionEventListener {

  /**
   * Callback that is fired whenever the ConnectionState of the
   * Connection changes. The state typically changes during connection
   * to Pusher and during disconnection and reconnection.
   *
   * @param change An object that contains the previous state of the connection
   * and the new state.
   */
  onConnectionStateChange (change: String): void;

  /**
   * Callback that indicates either:
   * - An error message has been received from Pusher
   * - Or an error has occurred in the client library
   *
   * @param message A message indicating the cause of the error.
   *
   * @param code The error code for the message. Can be null.
   *
   * @param exception The exception that was thrown, if any. Can be null.
   *
   */
  onError (message: String, code: String, exception: Error): void;

}