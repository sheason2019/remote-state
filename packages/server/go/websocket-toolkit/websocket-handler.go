package websocket_toolkit

type webScoketHandler struct {
	connFn func(*Socket)
}

func (wsh *webScoketHandler) OnConnect(fn func(*Socket)) {
	wsh.connFn = fn
}
