import { FC, useEffect, useState } from "react";

const handleCreateConn = () => {
  const conn = new WebSocket(`ws://${document.location.host}/ws`);
  conn.onopen = (e) => {
    console.log("conn connected", e);
  };
  conn.onclose = (e) => {
    console.log("conn disconnected", e);
  };
  conn.onmessage = (e) => {
    const message = e.data;
    console.log("conn message", message);
  };
  return conn;
};

const handleCloseConn = (conn: WebSocket) => {
  setTimeout(() => conn.close(), 400);
};

const TestPage: FC = () => {
  const [val, setVal] = useState("");
  const [state, setState] = useState<WebSocket>();
  useEffect(() => {
    const conn = handleCreateConn();
    setState(conn);

    return () => {
      handleCloseConn(conn);
      setState(undefined);
    };
  }, []);

  const handleSubmit = () => {
    state?.send(val);
  };

  return (
    <div>
      TEST PAGE：
      <textarea value={val} onChange={(e) => setVal(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default TestPage;
