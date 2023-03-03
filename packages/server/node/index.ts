import { Server as HttpServer } from "http";
import { EmitEvents, ListenEvents, RemoteAtom } from "@remote-state/types";
import { Server } from "socket.io";

import { IHandler, IRemoteStore, IUserStore } from "./types";

export class RemoteStore implements IRemoteStore {
  private io: Server<ListenEvents, EmitEvents>;
  store: Map<string, IUserStore>;
  middlewares: Map<RemoteAtom<any>, IHandler<any>>;

  constructor(srv?: HttpServer | number) {
    this.io = new Server(srv);
    this.store = new Map();
    this.middlewares = new Map();
  }

  syncAtom(atom: RemoteAtom<any>) {}

  use<T extends any>(atom: RemoteAtom<T>, handler: IHandler<T>) {}

  private addSocketListener() {
    
  }

  listen(port: number) {
    this.io.listen(port);
  }
}
