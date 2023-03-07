import { RemoteAtom } from "@remote-state/client-core";
import { useCallback, useContext, useEffect, useState } from "react";
import { remoteStoreContext } from "./context";

export const useRemoteState = <T extends any>(
  atom: RemoteAtom<T>
): [T, (val: T) => void] => {
  const store = useContext(remoteStoreContext);

  const [state, setState] = useState<T>(atom.value);

  useEffect(() => {
    store?.subscribe(atom, (value) => {
      setState(value);
    });
  }, [store]);

  const updateState = useCallback(
    (value: T) => {
      setState(() => value);
      store?.set(atom, value);
      store?.sync(atom);
    },
    [store]
  );

  return [state, updateState];
};

export default useRemoteState;
