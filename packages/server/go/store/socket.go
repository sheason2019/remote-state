package store

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10

	maxMessageSize = 1024
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

type Socket struct {
	Conn        *websocket.Conn
	ID          string
	RemoteStore *RemoteStore
	Message     chan []byte
}

type MessageWithType struct {
	Type  string
	Value string
}

func (s *Socket) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		s.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-s.Message:
			s.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				s.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := s.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(s.Message)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-s.Message)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			s.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := s.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (s *Socket) readPump() {
	defer func() {
		s.RemoteStore.unregistUs(s.ID)
		s.Conn.Close()
	}()
	s.Conn.SetReadLimit(maxMessageSize)
	s.Conn.SetReadDeadline(time.Now().Add(pongWait))
	s.Conn.SetPongHandler(func(appData string) error { s.Conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := s.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("error: %w", err)
			}
			break
		}
		var mwt MessageWithType
		err = json.Unmarshal(message, &mwt)
		if err != nil {
			log.Println("socket message unmarshal error: %w", err)
		}
	}
}
