import { RemoteStore } from "@remote-state/server";
import { testAtom } from "./atoms";

const store = new RemoteStore();

store.use(testAtom, async (ctx) => {
  console.log(ctx);
});

store.listen(3000);
