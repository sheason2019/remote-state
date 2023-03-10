import {
  createContext,
  FC,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { RemoteStore } from "@remote-state/client-core";

export { RemoteStore };

export const remoteStoreContext = createContext<RemoteStore | null>(null);

interface IRemoteStoreProvider {
  url: string | URL;
  protocols?: string | string[] | undefined;
}

export const RemoteStoreProvider: FC<
  PropsWithChildren<IRemoteStoreProvider>
> = ({ url, protocols, children }) => {
  const [store, setStore] = useState<RemoteStore | null>(null);

  // TODO: 以后使用sharedWorker创建Socket连接
  useEffect(() => {
    handleCreateStore();
  }, []);

  const handleCreateStore = () => {
    const s = RemoteStoreInstance.get(url, protocols);
    setStore(s);
  };

  return (
    <remoteStoreContext.Provider value={store}>
      {children}
    </remoteStoreContext.Provider>
  );
};

export class RemoteStoreInstance {
  static ins: RemoteStore;

  static get(
    url: string | URL,
    protocols?: string | string[] | undefined
  ): RemoteStore {
    if (!this.ins) {
      this.init(url, protocols);
    }

    return this.ins;
  }

  private static init(
    url: string | URL,
    protocols?: string | string[] | undefined
  ) {
    const store = new RemoteStore(url, protocols);
    store.connect();

    this.ins = store;
  }
}
