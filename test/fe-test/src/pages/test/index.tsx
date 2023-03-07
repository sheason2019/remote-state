import { useRemoteState } from "@remote-state/react";
import { FC } from "react";
import { testAtom } from "./atom";

const TestPage: FC = () => {
  const [state, setState] = useRemoteState(testAtom);

  return (
    <div>
      TEST PAGE：
      <input value={state} onChange={(e) => setState(e.target.value)} />
    </div>
  );
};

export default TestPage;
