// HC core namespace + Events bus
(function () {
  window.HC = window.HC || {};
  if (!window.Events) {
    window.Events = {
      _events: {},
      on(name, fn) {
        if (!this._events[name]) this._events[name] = [];
        this._events[name].push(fn);
      },
      off(name, fn) {
        if (!this._events[name]) return;
        this._events[name] = this._events[name].filter(f => f !== fn);
      },
      emit(name, payload) {
        if (!this._events[name]) return;
        for (const fn of this._events[name]) fn(payload);
      },
    };
  }
  window.HC.TAU = Math.PI * 2;
})();
