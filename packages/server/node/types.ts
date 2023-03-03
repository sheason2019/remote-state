import { RemoteAtom } from "@remote-state/types";

export interface IRemoteStore {
  store: Map<string, IUserStore>;
  middlewares: Map<RemoteAtom<any>, IHandler<any>>;

  use<T extends any>(atom: RemoteAtom<T>, handler: IHandler<T>): any;
  syncAtom(atom: RemoteAtom<any>): any;
  listen(port: number): any;
}

export interface IHandler<T extends any> {
  (userStore: IUserStore, value: T, oldValue: T): Promise<any>;
}

export interface IUserStore {
  key: string;
  atomSet: Set<RemoteAtom<any>>;
  setAtom<T extends any>(atom: RemoteAtom<T>, value: T): any;
}
