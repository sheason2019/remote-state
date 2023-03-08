package store

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gofrs/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type RemoteStore struct {
	UserStores map[string]*UserStore
	atoms      map[string]*Atom[any]
}

// 生成一个默认的RemoteStore
func Default() *RemoteStore {
	store := RemoteStore{
		UserStores: map[string]*UserStore{},
	}

	return &store
}

// 创建Socket.io服务
func (rs *RemoteStore) CreateWS(w http.ResponseWriter, r *http.Request, responseHeader http.Header) error {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return fmt.Errorf("ws upgrade err: %w", err)
	}

	uuid, err := uuid.NewV4()
	if err != nil {
		return fmt.Errorf("generate uuid err: %w", err)
	}

	id := uuid.String()
	log.Println("Socket connected, id:", id)

	us := createUserStore(rs, conn, id)

	rs.registUs(&us)

	return nil
}

func (rs *RemoteStore) registUs(us *UserStore) {
	rs.UserStores[us.Socket.ID] = us
	go us.Socket.readPump()
	go us.Socket.writePump()
}
func (rs *RemoteStore) unregistUs(id string) {
	delete(rs.UserStores, id)
}
