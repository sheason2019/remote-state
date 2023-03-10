package main

import websocket_toolkit "github.com/sheason2019/remote-state/server/websocket-toolkit"

var testAction = websocket_toolkit.ActionMessage[string]{
	Type:    "test",
	Payload: "test",
}
