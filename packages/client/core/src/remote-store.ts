import WebSocketToolkit from "websocket-toolkit";
import { RemoteAtom } from "@remote-state/types";
import { SubscribeCompose, SubscribeFn, updateAction } from "./types";

// 使用发布/订阅模式来同步状态变化
export class RemoteStore {
  private url: string | URL;
  private protocols?: string | string[];

  private subscribers: Map<string, SubscribeCompose<any>> = new Map();
  socket: WebSocketToolkit | undefined;

  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
  }

  get<T extends any>(atom: RemoteAtom<T>) {
    return atom.value;
  }

  set<T extends any>(atom: RemoteAtom<T>, value: T) {
    const compose = this.subscribers.get(atom.key);
    if (!compose) {
      throw console.error("未被订阅的atom:", atom);
    }

    compose.subscribeFn.forEach((fn) => fn(value, atom.value));
    atom.value = value;
  }

  subscribe<T extends any>(
    atom: RemoteAtom<T>,
    subscribeFn: SubscribeFn<RemoteAtom<T>>
  ) {
    let compose = this.subscribers.get(atom.key);
    if (!compose) {
      compose = {
        atom,
        subscribeFn: [],
      };
      this.subscribers.set(atom.key, compose);
    }

    compose.subscribeFn.push(subscribeFn);
  }

  connect() {
    this.socket = new WebSocketToolkit(this.url, this.protocols);
    this.socket.use(updateAction, (atom, wst) => {
      const compose = this.subscribers.get(atom.key);
      if (!compose) {
        throw console.error("未被订阅的atom.key: ", atom.key);
      }

      this.set(compose.atom, atom.value);
    });
  }

  close() {
    this.socket?.close();
  }

  sync(atom: RemoteAtom<any>) {
    this.socket?.send({ type: "update", payload: atom });
  }
}

export { RemoteAtom };

export default RemoteStore;
