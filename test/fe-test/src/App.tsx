import "./App.css";
import TestPage from "./pages/test";
import TestCorePage from "./pages/test-core";
import TestReactPage from "./pages/test-react";
import { RemoteStoreProvider } from "@remote-state/react";

function App() {
  return (
    <RemoteStoreProvider url={`ws://${document.location.host}/ws`}>
      <TestReactPage />
    </RemoteStoreProvider>
  );
}

export default App;
