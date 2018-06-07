///<reference path="../../d.ts/nativescript.d.ts" />
import * as connectivity from 'tns-core-modules/connectivity';
import EventDispatcher from 'pusher-js/src/core/events/dispatcher';
import Reachability from 'pusher-js/src/core/reachability';

function hasOnlineConnection(state): boolean {
  return state !== connectivity.connectionType.none;
}

export class NetInfo extends EventDispatcher implements Reachability {
  online: boolean;

  constructor() {
    super();

    this.online = hasOnlineConnection(connectivity.getConnectionType());

    this.onConnectivityChange = this.onConnectivityChange.bind(this);
    connectivity.startMonitoring(this.onConnectivityChange);
  }

  isOnline(): boolean {
    return this.online;
  }

  private onConnectivityChange(status) {
    const current = hasOnlineConnection(status);
    if (current === this.online) return;

    this.online = current;
    const event = current ? 'online' : 'offline';
    this.emit(event);
  }
}

export const Network = new NetInfo();
