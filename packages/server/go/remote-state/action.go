package remote_state

import websocket_toolkit "github.com/sheason2019/remote-state/server/websocket-toolkit"

var UpdateAction = websocket_toolkit.ActionMessage[any]{
	Type: "update",
}
