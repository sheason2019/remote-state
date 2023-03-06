import { Server as HttpServer } from "http";
import { EmitEvents, ListenEvents, RemoteAtom } from "@remote-state/types";
import { Server } from "socket.io";

import { Context, IHandler, IRemoteStore, IUserStore } from "./types";

export class RemoteStore implements IRemoteStore {
  private io: Server<ListenEvents, EmitEvents>;
  store: Map<string, IUserStore>;
  middlewares: Map<string, IHandler<any>[]>;

  constructor(srv?: HttpServer | number) {
    this.io = new Server(srv);
    this.store = new Map();
    this.middlewares = new Map();

    this.addSocketListener();
  }

  syncAtom(atom: RemoteAtom<any>) {
    this.io.emit("update", atom.key, atom.value);
  }

  use<T extends any>(atom: RemoteAtom<T>, handler: IHandler<T>) {
    if (!this.middlewares.has(atom.key)) {
      this.middlewares.set(atom.key, []);
    }
    this.middlewares.get(atom.key)?.push(handler);
  }

  private addSocketListener() {
    this.io.on("connection", (socket) => {
      console.log("Socket connected, id:", socket.id);
      // 创建UserStore
      this.store.set(socket.id, {
        key: socket.id,
        StateMap: new Map(),
        setState: (atom, value) => {
          this.store.get(socket.id)?.StateMap.set(atom.key, value);
        },
      });

      socket.on("update", (key, value) => {
        const middlwares = this.middlewares.get(key) ?? [];
        const store = this.store.get(key);
        if (!store) {
          throw new Error("Store不存在，atom -> key: " + key);
        }
        const ctx = initContext(key, value, store);
        contextStart(ctx, middlwares);
      });
      socket.on("disconnect", () => {
        console.log("Socket disconnected, id:", socket.id);
      });
    });
  }

  listen(port: number) {
    this.io.listen(port);
  }
}

// 递归调用middleware处理State更新事件
const contextStart = async <T extends any>(
  ctx: Context<T>,
  middlewares: IHandler<T>[]
) => {
  let _next = false;
  let _abort = false;
  const length = middlewares.length;

  ctx.next = async () => {
    if (_abort || ctx._middlewareIndex > length || _next) {
      return;
    }

    _next = true;
    ctx._middlewareIndex += 1;
    return contextStart(ctx, middlewares);
  };
  ctx.abort = () => {
    _abort = true;
  };

  // 根据ctx中的函数索引执行对应的中间件
  if (ctx._middlewareIndex < length) {
    // 当索引值小于已声明的中间件的长度时执行中间件
    await middlewares[ctx._middlewareIndex](ctx);
  } else if (ctx._middlewareIndex === length) {
    // 否则执行update逻辑更新Store中的state
    update(ctx);
  }

  ctx.next();
};

// 使用较少的变量对context进行初始化
const initContext = <T extends any>(
  key: string,
  value: T,
  store: IUserStore
): Context<T> => ({
  key,
  store,
  value,
  oldValue: store.StateMap.get(key),
  _middlewareIndex: 0,
  async next() {},
  abort() {},
});

const update = (ctx: Context<any>) => {
  const fakeAtom = {
    key: ctx.key,
    value: ctx.value,
  };
  ctx.store.setState(fakeAtom, ctx.value);
};
