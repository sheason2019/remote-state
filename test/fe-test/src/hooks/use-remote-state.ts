import { RemoteStore } from "@remote-state/client-core";
import { createContext, useEffect } from "react";

const store = new RemoteStore();

export const testAtom = {
  key: "test/test",
  value: "test",
};

export const useRemoteState = () => {
  useEffect(() => {
    console.log("useEffect");
    store.connect({});
    store.subscribe(testAtom, (value) => {
      console.log("test update", value);
    });
  }, []);
};

export default useRemoteState;
