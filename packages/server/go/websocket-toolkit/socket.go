package websocket_toolkit

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
)

type Socket struct {
	wsHander      *webScoketHandler
	disconnFn     func(socket *Socket, code int, text string)
	dispatcherMap map[string]func(payload string)
	Conn          *websocket.Conn
	ID            string
	Message       chan []byte
}

type ActionMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

func (s *Socket) OnDisconnect(fn func(s *Socket, code int, text string)) {
	s.disconnFn = fn
}

func (s *Socket) OnDispatch(action string, reducer func(payload string)) {
	if _, exist := s.dispatcherMap[action]; exist {
		log.Println("Dispatch被重复声明! action:", action, "这一操作会覆盖声明的Dispatch")
	}
	s.dispatcherMap[action] = reducer
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
		s.Conn.Close()
	}()
	s.Conn.SetReadLimit(maxMessageSize)
	s.Conn.SetReadDeadline(time.Now().Add(pongWait))
	s.Conn.SetPongHandler(func(appData string) error { s.Conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := s.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println("error:", err, "message", message)
			}
			break
		}
		var am ActionMessage
		err = json.Unmarshal(message, &am)
		if err != nil {
			log.Println("socket message unmarshal error:", err)
		}

		payloadBytes, err := json.Marshal(am.Payload)
		if err != nil {
			log.Println("payload stringify error:", err)
		}

		dispatcher, exist := s.dispatcherMap[am.Type]
		if !exist {
			log.Println("unhandled action:", am.Type)
		} else {
			dispatcher(string(payloadBytes))
		}
	}
}
