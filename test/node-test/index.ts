import { RemoteStore } from "@remote-state/server";
import { testAtom } from "./atoms";

const store = new RemoteStore();

store.use(testAtom, async (ctx) => {
  store.store.forEach((item, id) => {
    if (id !== ctx.store.socketid) item.setState(testAtom, ctx.value);
  });
});

store.listen(3000);
