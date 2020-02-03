////////////////////////////////////////////////////////////////////////////////
// js-drawing2d
// Javascript canvas 2D drawing library. Supports both immediate-mode rendering
// and 2D scene rendering.
//
// MIT License (C) 2015-2020 Jingwood, unvell.com, all rights reserved.
////////////////////////////////////////////////////////////////////////////////

if (!Array.prototype._t_foreach) {
	Object.defineProperty(Array.prototype, "_t_foreach", {
		value: function(iterator) {
			if (typeof iterator !== "function") return;

			for (let i = 0; i < this.length; i++) {
				const element = this[i];
				iterator.call(this, i, element);
			}
		},
		enumerable: false
	});
}

if (!Array.prototype._t_arrayIndexOf) {
	Object.defineProperty(Array.prototype, "_t_arrayIndexOf", {
		value: function(element) {
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
		
				if (item === element) {
					return i;
				}
			}
		
			return -1;
		},
		enumerable: false
	});
}

if (!Array.prototype._t_remove) {
	Object.defineProperty(Array.prototype, "_t_remove", {
		value: function(element) {
			var index = this._t_arrayIndexOf(element);
			if (index > -1) this.splice(index, 1);
		},
		enumerable: false
	});
}

if (!Array.prototype._t_removeAt) {
	Object.defineProperty(Array.prototype, "_t_removeAt", {
		value: function(index) {
			this.splice(index, 1);
		}
	});
}

if (!Array.prototype._t_clear) {
	Object.defineProperty(Array.prototype, "_t_clear", {
		value: function() {
			this.length = 0;
		},
		enumerable: false
	});
}

if (!Array.prototype._t_pushIfNotExist) {
	Object.defineProperty(Array.prototype, "_t_pushIfNotExist", {
		value: function(element) {
			if (!this.includes(element)) {
				this.push(element);
			}
		},
		enumerable: false
	});
}

if (!Array.prototype._t_set) {
	Object.defineProperty(Array.prototype, "_t_set", {
		value: function(i) {
			if (arguments.length > 1) {
				for (var j = 1; j < arguments.length - 1; j++) {
					this[i++] = arguments[j];
				}
			}
		},
		enumerable: false
	});
}

if (!Array.prototype._t_any) {
	Object.defineProperty(Array.prototype, "_t_any", {
		value: function(handler) {
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
		
				if (handler(item)) {
					return true;
				}
			}
		}
	});
}
