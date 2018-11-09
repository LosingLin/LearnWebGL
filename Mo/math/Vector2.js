
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

// exports = Vector2;
// module.exports = Vector2;
export { Vector2 };
