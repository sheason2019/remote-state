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

export const RemoteStoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const [store, setStore] = useState<RemoteStore | null>(null);

  // TODO: 以后使用sharedWorker创建Socket连接
  useEffect(() => {
    handleCreateStore();
  }, []);

  const handleCreateStore = () => {
    const s = RemoteStoreInstance.get();
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

  static get(): RemoteStore {
    if (!this.ins) {
      this.init();
    }

    return this.ins;
  }

  private static init() {
    const store = new RemoteStore();
    store.connect();

    this.ins = store;
  }
}
