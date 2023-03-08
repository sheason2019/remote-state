package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/sheason2019/remote-state/server/store"
)

func main() {
	rs := store.Default()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("connect ws")
		rs.CreateWS(w, r, nil)
	})
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
