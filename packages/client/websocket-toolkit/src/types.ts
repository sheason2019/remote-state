import { WebSocketToolkit } from ".";

export interface Action<T extends any> {
  type: string;
  payload: T;
}

export interface ActionHandler<T extends any> {
  (payload: T, wst: WebSocketToolkit): any;
}
