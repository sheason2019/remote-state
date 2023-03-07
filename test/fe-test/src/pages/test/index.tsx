import { useRemoteState } from "@remote-state/react";
import { FC, useEffect, useRef } from "react";
import { testAtom } from "./atom";

const TestPage: FC = () => {
  const [state, setState] = useRemoteState(testAtom);

  const countRef = useRef(0);
  const initRef = useRef(false);

  const fnBox = useRef(setState);
  useEffect(() => {
    fnBox.current = setState;
  }, [setState]);

  useEffect(() => {
    if (initRef.current) {
      return;
    }

    initRef.current = true;
    setInterval(() => {
      fnBox.current(countRef.current.toString());
      countRef.current += 1;
    }, 2500);
  }, []);

  return <div>TEST PAGE：{state}</div>;
};

export default TestPage;
