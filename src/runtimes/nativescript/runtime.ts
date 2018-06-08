///<reference path="../../d.ts/nativescript.d.ts" />
import Isomorphic from 'pusher-js/src/runtimes/isomorphic/runtime';
import xhrAuth from 'pusher-js/src/runtimes/isomorphic/auth/xhr_auth';
import xhrTimeline from 'pusher-js/src/runtimes/isomorphic/timeline/xhr_timeline';
import { AuthTransports } from 'pusher-js/src/core/auth/auth_transports';
import { XMLHttpRequest } from 'tns-core-modules/xhr';
import Runtime from 'pusher-js/src/runtimes/interface';
import { Network } from './net_info';
import 'nativescript-websockets';

const {
  getDefaultStrategy,
  Transports,
  setup,
  getProtocol,
  isXHRSupported,
  getLocalStorage,
  createXHR,
  createWebSocket,
  addUnloadListener,
  removeUnloadListener,
  transportConnectionInitializer,
  createSocketRequest,
  HTTPFactory,
} = Isomorphic;

const NativeScript: Runtime = {
  getDefaultStrategy,
  Transports,
  setup,
  getProtocol,
  isXHRSupported,
  getLocalStorage,
  createXHR,
  createWebSocket,
  addUnloadListener,
  removeUnloadListener,
  transportConnectionInitializer,
  createSocketRequest,
  HTTPFactory,
  TimelineTransport: xhrTimeline,
  getAuthorizers(): AuthTransports {
    return { ajax: xhrAuth };
  },
  getWebSocketAPI() {
    return WebSocket;
  },
  getXHRAPI() {
    return XMLHttpRequest;
  },

  getNetwork() {
    return Network;
  },
};

export default NativeScript;
