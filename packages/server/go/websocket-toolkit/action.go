package websocket_toolkit

type ActionMessage[T any] struct {
	Type    string `json:"type"`
	Payload T      `json:"payload"`
}

func (am *ActionMessage[T]) Copy(val T) *ActionMessage[T] {
	return &ActionMessage[T]{
		Type:    am.Type,
		Payload: val,
	}
}
