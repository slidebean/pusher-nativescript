export interface ConnectionEventListeners {

  onConnectionStateChange (change: String): void;

  onError (message: String, code: String, exception: Error): void;

}