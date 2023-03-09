package main

import (
	"log"
	"net/http"

	remote_state "github.com/sheason2019/remote-state/server/remote-state"
)

var testAtom = remote_state.Atom[string]{
	Key:   "test",
	Value: "test",
}

func main() {
	rs := remote_state.Default()

	rs.OnConnect(func(sp *remote_state.StorePart) {
		log.Println("Socket connected. id: ", sp.ID)
	})

	rs.Use(remote_state.CreateAtomHandler(&testAtom, func(ctx *remote_state.Context[string]) {
		log.Println("test atom update: ", ctx.Value)
	}))

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		rs.HandlerWS(w, r, nil)
	})
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
