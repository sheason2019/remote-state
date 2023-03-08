package store

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

type Atom[T any] struct {
	Key      string
	Value    T
	Handlers []func(ctx *Context[T])
}

func (atom *Atom[T]) marshal(str string) T {
	var val T
	json.Unmarshal([]byte(str), &val)
	return val
}

func (atom *Atom[T]) Get(us *UserStore) T {
	str := us.stateMap[atom.Key]
	return atom.marshal(str)
}

func (atom *Atom[T]) Set(us *UserStore, val T) {
	str, _ := json.Marshal(val)
	us.stateMap[atom.Key] = string(str)
}

func (atom *Atom[T]) AddListener(listener func(ctx *Context[T])) {
	atom.Handlers = append(atom.Handlers, listener)
}

func (atom *Atom[T]) Sync(us *UserStore, value T) {
	us.Socket.Conn.WriteMessage(websocket.TextMessage, []byte("sync value"))
}

func BindAtom(store *RemoteStore, atom *Atom[any]) {
	store.atoms[atom.Key] = atom
}
