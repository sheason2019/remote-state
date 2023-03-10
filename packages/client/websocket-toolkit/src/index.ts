import { registPreset } from "./preset";
import { Action, ActionHandler } from "./types";

export class WebSocketToolkit {
  private url: string | URL;
  private protocals?: string | string[];
  private handlerMap: Map<string, ActionHandler<any>>;
  private sendCache: (string | ArrayBuffer | Blob | ArrayBufferView)[];
  ws!: WebSocket;

  id?: string;

  constructor(url: string | URL, protocols?: string | string[]) {
    this.handlerMap = new Map();
    this.sendCache = [];
    this.url = url;
    this.protocals = protocols;
    this.reconnect();
  }

  private flush(
    ws: WebSocket,
    sendCache: (string | ArrayBuffer | Blob | ArrayBufferView)[]
  ) {
    sendCache.forEach((data) => {
      ws.send(data);
    });
    sendCache = [];
  }

  send(action: Action<any>) {
    const data = JSON.stringify(action);
    if (this.ws.readyState === this.ws.CONNECTING) {
      this.sendCache.push(data);
    } else {
      this.ws.send(data);
    }
  }

  close() {
    this.ws.close();
  }

  reconnect() {
    this.ws = new WebSocket(this.url, this.protocals);

    this.ws.onopen = () => this.flush(this.ws, this.sendCache);
    this.ws.onmessage = (e) => {
      const action: Action<any> = JSON.parse(e.data);
      const handler = this.handlerMap.get(action.type);
      if (handler) {
        handler(action.payload, this);
      } else {
        console.warn("unhandled action. type:", action.type);
      }
    };

    registPreset(this);
  }

  use<T extends any>(action: Action<T>, handler: ActionHandler<T>) {
    this.handlerMap.set(action.type, handler);
  }
}

export default WebSocketToolkit;
