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
  conn.close();
};

const TestPage: FC = () => {
  const [state, setState] = useState<WebSocket>();
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
      TEST PAGE：
      <input />
    </div>
  );
};

export default TestPage;
