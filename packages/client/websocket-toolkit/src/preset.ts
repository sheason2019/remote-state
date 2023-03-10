import { WebSocketToolkit } from "./ws-toolkit";
import { Action, ActionHandler } from "./types";

export interface ConnectInfo {
  id: string;
}

export const actionPresetConnect: Action<ConnectInfo> = {
  type: "preset-connect",
  payload: { id: "" },
};

export const handlerPresetConnect: ActionHandler<ConnectInfo> = (
  payload,
  wst
) => {
  wst.id = payload.id;
};

export const registPreset = (wst: WebSocketToolkit) => {
  wst.use(actionPresetConnect, handlerPresetConnect);

  wst.send(actionPresetConnect);
};
