package remote_state

import (
	"encoding/json"
)

type Atom[T any] struct {
	Key   string `json:"key"`
	Value T      `json:"value"`
}

func (atom *Atom[T]) unmarshal(payload string) error {
	return json.Unmarshal([]byte(payload), atom)
}

func (atom *Atom[T]) Get(sp *StorePart) T {
	return sp.stateMap[atom.Key].(T)
}

func (atom *Atom[T]) Set(sp *StorePart, val T) {
	sp.stateMap[atom.Key] = val
}

func CreateAtomHandler[T any](atom *Atom[T], fn func(ctx *Context[T])) (*Atom[any], func(ctx *Context[any])) {
	return atom.toAny(), func(ctx *Context[any]) {
		c := convertContextType[T](ctx)
		fn(c)
	}
}

func convertAtomType[T any](atom *Atom[any]) *Atom[T] {
	return &Atom[T]{
		Key:   atom.Key,
		Value: atom.Value.(T),
	}
}

func (atom Atom[T]) toAny() *Atom[any] {
	var val any = atom.Value
	return &Atom[any]{
		Key:   atom.Key,
		Value: val,
	}
}
