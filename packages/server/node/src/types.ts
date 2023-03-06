import { RemoteAtom } from "@remote-state/types";
import { Socket } from "socket.io";

export type SocketID = string;

export interface IRemoteStore {
  store: Map<string, IUserStore>;
  middlewares: Map<string, IHandler<any>[]>;

  use<T extends any>(atom: RemoteAtom<T>, handler: IHandler<T>): any;
  sync<T extends any>(socket: Socket, atom: RemoteAtom<T>, value: T): any;
  listen(port: number): any;
}

export interface IHandler<T extends any> {
  (ctx: Context<T>): Promise<any>;
}

export interface IUserStore {
  key: string;
  StateMap: Map<string, any>;
  setState<T extends any>(atom: RemoteAtom<T>, value: T): any;
}

export interface Context<T extends any> {
  store: IUserStore;
  key: string;
  value: T;
  oldValue: T;
  next: () => Promise<any>;
  abort: () => any;
  _middlewareIndex: number;
}

export { RemoteAtom };
