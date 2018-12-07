
function Vector2( x, y ) {

	this.x = x || 0;
	this.y = y || 0;

}

Object.defineProperties( Vector2.prototype, {
	width: {
		get () {
			return this.x;
		},
		set ( value ) {
			this.x = value;
		}

	},
	height: {
		get: function () {
			return this.y;
		},
		set: function ( value ) {
			this.y = value;
		}

	}

} );

Object.assign( Vector2.prototype, {
	isVector2: true,
	set: function( x, y ) {
		this.x = x;
		this.y = y;
		return this;
	},
	
	add: function(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	},
	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	},
	multiply: function(v) {
		this.x *= v.x;
		this.y *= v.y;
		return this;
	},
	divide: function(v) {
		this.x /= v.x;
		this.y /= v.y;
	},
} );



// exports = Vector2;
// module.exports = Vector2;
export { Vector2 };
