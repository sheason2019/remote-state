package remote_state

import "log"

type Context[T any] struct {
	atom            *Atom[T]
	key             string
	payload         string
	aborted         bool
	middlewarePoint int

	StateStore *StateStore
	StorePart  *StorePart
	Value      T
	OldValue   T
}

func initContext(
	sp *StorePart,
	ss *StateStore,
	payload string,
) *Context[any] {
	return &Context[any]{
		payload:         payload,
		middlewarePoint: 0,
		StorePart:       sp,
		StateStore:      ss,
	}
}

func (c *Context[T]) Next() {
	if c.aborted {
		return
	}
	c.middlewarePoint = c.middlewarePoint + 1
	c.start()
}

func (c *Context[T]) Abort() {
	c.aborted = true
}

func (c *Context[T]) start() {
	ctx := c.toAny()

	atom := Atom[T]{}
	err := atom.unmarshal(ctx.payload)
	if err != nil {
		log.Println("atom unmarshal error:", err, ctx.payload)
	}

	ctx.atom = atom.toAny()

	ctx.key = ctx.atom.Key
	ctx.Value = ctx.atom.Value
	ctx.OldValue = ctx.StorePart.stateMap[ctx.key]

	handlers, exist := ctx.StateStore.handlersMap[ctx.atom.Key]
	if !exist {
		handlers = []func(ctx *Context[any]){}
	}
	handlerLen := len(handlers)

	point := ctx.middlewarePoint
	if ctx.middlewarePoint < handlerLen {
		handlers[ctx.middlewarePoint](ctx)
	} else if ctx.middlewarePoint == handlerLen {
		ctx.update()
	} else {
		return
	}

	// 没有主动触发next
	if ctx.middlewarePoint == point && !ctx.aborted {
		ctx.Next()
	}
}

func (c *Context[T]) update() {
	c.StorePart.stateMap[c.atom.Key] = c.Value
}

func convertContextType[T any](ctx *Context[any]) *Context[T] {
	var val T
	var oldVal T

	if ctx.Value != nil {
		val = ctx.Value.(T)
	}
	if ctx.OldValue != nil {
		oldVal = ctx.OldValue.(T)
	}
	return &Context[T]{
		atom:            convertAtomType[T](ctx.atom),
		middlewarePoint: ctx.middlewarePoint,
		aborted:         ctx.aborted,

		StorePart:  ctx.StorePart,
		StateStore: ctx.StateStore,
		Value:      val,
		OldValue:   oldVal,
	}
}
func (ctx *Context[T]) toAny() *Context[any] {
	var atom *Atom[any]
	if ctx.atom != nil {
		atom = ctx.atom.toAny()
	}

	return &Context[any]{
		atom:            atom,
		middlewarePoint: ctx.middlewarePoint,
		aborted:         ctx.aborted,
		key:             ctx.key,
		payload:         ctx.payload,

		StorePart:  ctx.StorePart,
		StateStore: ctx.StateStore,
		Value:      ctx.Value,
		OldValue:   ctx.OldValue,
	}
}
