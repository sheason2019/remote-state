import { RemoteAtom } from "@remote-state/react";

export const testAtom: RemoteAtom<string> = {
  key: "test/test",
  value: "test",
};

const mockvalue = {
  "type": "update",
  "payload": {
    "key": "test",
    "value": "Hello test!"
  }
}