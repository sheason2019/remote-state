export interface RemoteAtom<T extends any> {
  key: string;
  value: T;
}

export interface ListenEvents {
  update: (key: string, value: any) => any;
};

export interface EmitEvents {
  update: (key: string, value: any) => any;
};
