package store

type Context[T any] struct {
	atom            *Atom[T]
	aborted         bool
	middlewarePoint int

	UserStore *UserStore
	Value     T
	OldValue  T
}

func initContext[T any](us *UserStore, atom *Atom[T], value, oldValue T) *Context[T] {
	return &Context[T]{
		atom:            atom,
		middlewarePoint: 0,
		Value:           value,
		OldValue:        oldValue,
		UserStore:       us,
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
	handlerLen := len(c.atom.Handlers)
	point := c.middlewarePoint
	if c.middlewarePoint < handlerLen {
		c.atom.Handlers[c.middlewarePoint](c)
	} else if c.middlewarePoint == handlerLen {
		c.update()
	} else {
		return
	}

	// 没有主动触发next
	if c.middlewarePoint == point && !c.aborted {
		c.Next()
	}
}

func (c *Context[T]) update() {

}
