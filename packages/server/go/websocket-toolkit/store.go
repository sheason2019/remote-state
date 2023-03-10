package websocket_toolkit

import (
	"fmt"
	"net/http"

	"github.com/gofrs/uuid"
	"github.com/gorilla/websocket"
)

type WebsocketStore struct {
	webScoketHandler
	socketMap map[string]*Socket
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func Default() *WebsocketStore {
	store := WebsocketStore{
		socketMap: map[string]*Socket{},
	}

	return &store
}

// 创建WebSocket服务
func (ws *WebsocketStore) HandlerWS(w http.ResponseWriter, r *http.Request, responseHeader http.Header) error {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return fmt.Errorf("ws upgrade err: %w", err)
	}

	uuid, err := uuid.NewV4()
	if err != nil {
		return fmt.Errorf("generate uuid err: %w", err)
	}

	id := uuid.String()

	socket := Socket{
		dispatcherMap: map[string]func(payload string){},
		wsHander:      &ws.webScoketHandler,
		Conn:          conn,
		ID:            id,
		Message:       make(chan []byte),
	}

	ws.socketMap[id] = &socket

	// preset - 向客户端同步连接信息
	Send(&socket, createPresetConnectAction(ConnectInfo{ID: id}))

	// 设置onConnect
	if ws.connFn != nil {
		ws.connFn(&socket)
	}

	// 设置onDisconnect
	superClose := conn.CloseHandler()
	conn.SetCloseHandler(func(code int, text string) error {
		if socket.disconnFn != nil {
			socket.disconnFn(&socket, code, text)
		}
		return superClose(code, text)
	})

	// 启动
	go socket.readPump()
	go socket.writePump()

	return nil
}
