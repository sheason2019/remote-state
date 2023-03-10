import { FC, useEffect, useState } from "react";
import WebSocketToolkit from "websocket-toolkit";

const handleCreateConn = () => {
  const conn = new WebSocketToolkit(`ws://${document.location.host}/ws`);

  return conn;
};

const handleCloseConn = (conn: WebSocketToolkit) => {
  setTimeout(() => conn.close(), 400);
};

const TestPage: FC = () => {
  const [val, setVal] = useState("");
  const [state, setState] = useState<WebSocketToolkit>();
  useEffect(() => {
    const conn = handleCreateConn();
    setState(conn);

    return () => {
      handleCloseConn(conn);
      setState(undefined);
    };
  }, []);

  return (
    <div>
      TEST REACT PAGE：
      <textarea value={val} onChange={(e) => setVal(e.target.value)} />
    </div>
  );
};

export default TestPage;
