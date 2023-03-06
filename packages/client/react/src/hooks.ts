import { RemoteAtom } from "@remote-state/client-core";
import { useContext, useState } from "react";
import { remoteStoreContext } from "./context";

const useRemoteState = <T extends any>(atom: RemoteAtom<T>) => {
  const store = useContext(remoteStoreContext);

  const [state, setState] = useState<T>(atom.value);

  // TODO: 完成订阅函数
  store?.subscribe(atom, (value) => {
    setState(value);
  });
};
