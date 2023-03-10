package websocket_toolkit

type ConnectInfo struct {
	ID string `json:"id"`
}

func createPresetConnectAction(info ConnectInfo) *ActionMessage[ConnectInfo] {
	return &ActionMessage[ConnectInfo]{
		Type:    "preset-connect",
		Payload: info,
	}
}
