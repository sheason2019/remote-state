import { Action } from "websocket-toolkit";
import { RemoteAtom } from "@remote-state/types";

export interface SubscribeFn<T extends RemoteAtom<any>> {
  (value: T["value"], oldValue?: T["value"]): any;
}

export interface SubscribeCompose<T extends RemoteAtom<any>> {
  subscribeFn: SubscribeFn<T>[];
  atom: T;
}

export const updateAction: Action<RemoteAtom<any>> = {
  type: "update",
  payload: {
    key: "",
    value: "",
  },
};
