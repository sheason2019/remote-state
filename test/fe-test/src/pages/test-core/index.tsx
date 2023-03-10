import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { RemoteStore } from "@remote-state/client-core";
import { testAtom } from "../atom";

const handleCreateConn = (setter: Dispatch<SetStateAction<string>>) => {
  const conn = new RemoteStore(`ws://${document.location.host}/ws`);
  conn.connect();
  conn.subscribe(testAtom, (value) => {
    console.log("test atom value: ", value);
    setter(value);
  });

  return conn;
};

const handleCloseConn = (conn: RemoteStore) => {
  setTimeout(() => conn.close(), 400);
};

const TestCorePage: FC = () => {
  const [val, setVal] = useState("");
  const [state, setState] = useState<RemoteStore>();
  useEffect(() => {
    const conn = handleCreateConn(setVal);
    setState(conn);

    return () => {
      handleCloseConn(conn);
      setState(undefined);
    };
  }, [setVal]);

  const handleSync = (val: string) => {
    state?.sync({ key: "test", value: val });
  };

  return (
    <div>
      TEST PAGE：
      <textarea
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          handleSync(e.target.value);
        }}
      />
    </div>
  );
};

export default TestCorePage;
