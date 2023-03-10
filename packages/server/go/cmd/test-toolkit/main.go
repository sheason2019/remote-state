package main

import (
	"log"
	"net/http"

	websocket_toolkit "github.com/sheason2019/remote-state/server/websocket-toolkit"
)

func main() {
	wss := websocket_toolkit.Default()
	wss.OnConnect(func(s *websocket_toolkit.Socket) {
		log.Println("Socket onConnected. ID:", s.ID)
		s.OnDisconnect(func(s *websocket_toolkit.Socket, code int, text string) {
			log.Println("Socket onDisconnected. ID:", s.ID)
		})
		s.OnDispatch(testAction.Type, func(payload string) {
			log.Println("Socket dispatch. action: test. payload:", payload)
		})
	})

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wss.HandlerWS(w, r, nil)
	})
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
