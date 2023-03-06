import { createContext, FC, PropsWithChildren, useEffect, useState } from "react";
import { RemoteStore } from "@remote-state/client-core";

export const remoteStoreContext = createContext<RemoteStore | null>(null);

export const RemoteStoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const [store, setStore] = useState<RemoteStore | null>(null);

  // TODO: 以后使用sharedWorker创建Socket连接
  useEffect(() => {
    if (!store) {
      handleCreateStore();
    }
  }, []);

  const handleCreateStore = () => {
    const s = new RemoteStore();
    s.connect();

    setStore(s);
  };

  return <remoteStoreContext.Provider value={store}>{children}</remoteStoreContext.Provider>;
};
