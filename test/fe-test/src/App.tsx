import "./App.css";
import { RemoteStoreProvider } from "@remote-state/react";
import TestPage from "./pages/test";

function App() {
  return (
    <RemoteStoreProvider>
      <TestPage />
    </RemoteStoreProvider>
  );
}

export default App;
