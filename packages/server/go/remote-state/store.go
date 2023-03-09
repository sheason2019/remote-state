package remote_state

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	websocket_toolkit "github.com/sheason2019/remote-state/server/websocket-toolkit"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type StateStore struct {
	*websocket_toolkit.WebsocketStore

	connFn      func(sp *StorePart)
	StoreParts  map[string]*StorePart
	handlersMap map[string][]func(ctx *Context[any])
}

// 生成一个默认的RemoteStore
func Default() *StateStore {
	socketStore := websocket_toolkit.Default()
	store := StateStore{
		WebsocketStore: socketStore,
		StoreParts:     map[string]*StorePart{},
		handlersMap:    map[string][]func(ctx *Context[any]){},
	}

	socketStore.OnConnect(func(s *websocket_toolkit.Socket) {
		sp := StorePart{
			Socket:   s,
			stateMap: map[string]any{},
		}
		store.StoreParts[s.ID] = &sp
		if store.connFn != nil {
			store.connFn(&sp)
		}

		s.OnDisconnect(func(s *websocket_toolkit.Socket, code int, text string) {
			log.Println("Socket disconnected id: ", s.ID, ". code:", code, " text:", text)
			delete(store.StoreParts, s.ID)
		})

		s.OnDispatch("update", func(payload string) {
			ctx := initContext(&sp, &store, payload)

			ctx.start()
		})
	})

	return &store
}

func (ss *StateStore) OnConnect(fn func(sp *StorePart)) {
	ss.connFn = fn
}

func (ss *StateStore) Use(atom *Atom[any], handler func(ctx *Context[any])) {
	handlers, exist := ss.handlersMap[atom.Key]
	if !exist {
		handlers = []func(ctx *Context[any]){}
	}

	ss.handlersMap[atom.Key] = append(handlers, handler)
}
