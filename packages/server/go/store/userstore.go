package store

import (
	"github.com/gorilla/websocket"
)

type UserStore struct {
	Socket   *Socket
	stateMap map[string]string
}

func createUserStore(rs *RemoteStore, conn *websocket.Conn, id string) UserStore {
	return UserStore{
		Socket: &Socket{
			Conn:        conn,
			ID:          id,
			Message:     make(chan []byte, 1024),
			RemoteStore: rs,
		},
		stateMap: map[string]string{},
	}
}
