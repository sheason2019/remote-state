import { io, Socket } from "socket.io-client";
import { EmitEvents, ListenEvents, RemoteAtom } from "@remote-state/types";
import { SubscribeCompose, SubscribeFn, IConnectOptions } from "./types";

// 使用发布/订阅模式来同步状态变化
export class RemoteStore {
  private subscribers: Map<string, SubscribeCompose<any>>;
  socket: Socket<ListenEvents, EmitEvents> | undefined;

  constructor() {
    this.subscribers = new Map();
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

  connect(opt?: IConnectOptions) {
    this.socket = io("/remote-state");
    this.socket.on("update", (key, value) => {
      const atom = this.subscribers.get(key);
      if (!atom) {
        throw console.error("未被订阅的atom.key: ", key);
      }

      this.set(atom.atom, value);
    });
  }

  sync(atom: RemoteAtom<any>) {
    this.socket?.emit("update", atom.key, atom.value);
  }
}

export { RemoteAtom };

export default RemoteStore;
