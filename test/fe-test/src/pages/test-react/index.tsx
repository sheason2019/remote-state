import { useRemoteState } from "@remote-state/react";
import { FC } from "react";
import { testAtom } from "../atom";

const TestReactPage: FC = () => {
  const [state, setState] = useRemoteState(testAtom);

  return (
    <div>
      TEST REACT PAGE：
      <textarea value={state} onChange={(e) => setState(e.target.value)} />
    </div>
  );
};

export default TestReactPage;
