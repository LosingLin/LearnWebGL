
function Vector2(x, y) {

	this.x = x || 0;
	this.y = y || 0;

}

Object.defineProperties(Vector2.prototype, {
	width: {
		get () {
			return this.x;
		},
		set (value) {
			this.x = value;
		}

	},
	height: {
		get: function () {
			return this.y;
		},
		set: function (value) {
			this.y = value;
		}

	}

});

Object.assign(Vector2.prototype, {
	isVector2: true,
	set: function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	},
	
	add: function(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	},
	addScalar: function(s) {
		this.x += s;
		this.y += s;
		return this;
	},
	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},
	subScalar: function(s) {
		this.x -= s;
		this.y -= s;
		return this;
	},
	multiply: function(v) {
		this.x *= v.x;
		this.y *= v.y;
		return this;
	},
	multiplyScalar: function(s) {
		this.x *= s;
		this.y *= s;
		return this;
	},
	divide: function(v) {
		this.x /= v.x;
		this.y /= v.y;
		return this;
	},
	divideScalar: function(s) {
		this.x /= s;
		this.y /= s;
		return this;
	},
	dot: function(v) {
		return this.x * v.x + this.y * v.y;
	},
	cross: function(v) {
		return this.x * v.y - this.y * v.x;
	},

	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	normalize: function() {
		return this.divideScalar(this.length() || 1);
	}

});



// exports = Vector2;
// module.exports = Vector2;
export {Vector2};
