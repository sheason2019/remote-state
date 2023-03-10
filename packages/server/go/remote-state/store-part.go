package remote_state

import websocket_toolkit "github.com/sheason2019/remote-state/server/websocket-toolkit"

type StorePart struct {
	*websocket_toolkit.Socket
	stateMap map[string]any
}

func Sync[T any](sp *StorePart, atom *Atom[T]) {
	websocket_toolkit.Send(sp.Socket, UpdateAction.Copy(atom))
}
