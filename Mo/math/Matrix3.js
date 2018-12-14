
function Matrix3() {
    this.elements = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
}

Object.assign(Matrix3.prototype, {
    isMatrix3: true,
    set: function(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
        let elt = this.elements;
        elt[0] = n11; elt[1] = n21; elt[2] = n31;
        elt[3] = n12; elt[4] = n22; elt[5] = n32;
        elt[6] = n13; elt[7] = n23; elt[8] = n33;
        return this;
    },
    identity: function() {
        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
        return this;
    },
    clone: function() {
        return new this.constructor().fromArray(this.elements);
    },

    mutilplyMatrices: function(am, bm) {
        let elt = this.elements;
        let aelt = am.elements;
        let belt = bm.elements;

        let a11 = aelt[0], a12 = aelt[3], a13 = aelt[6];
        let a21 = aelt[1], a22 = aelt[4], a23 = aelt[7];
        let a31 = aelt[2], a32 = aelt[5], a33 = aelt[8];

        let b11 = belt[0], b12 = belt[3], b13 = belt[6];
        let b21 = belt[1], b22 = belt[4], b23 = belt[7];
        let b31 = belt[2], b32 = belt[5], b33 = belt[8];

        elt[0] = a11 * b11 + a12 * b21 + a13 * b31;
        elt[3] = a11 * b12 + a12 * b22 + a13 * b32;
        elt[6] = a11 * b13 + a12 * b23 + a13 * b33;

        elt[1] = a21 * b11 + a22 * b21 + a23 * b31;
        elt[4] = a21 * b12 + a22 * b22 + a23 * b32;
        elt[7] = a21 * b13 + a22 * b23 + a23 * b33;

        elt[2] = a31 * b11 + a32 * b21 + a33 * b31;
        elt[5] = a31 * b12 + a32 * b22 + a33 * b32;
        elt[8] = a31 * b13 + a32 * b23 + a33 * b33;

        return this;
    },

    mutiply: function(m) {
        return this.mutilplyMatrices( this, m );
    },

    premutiply: function(m) {
        return this.mutilplyMatrices( m, this );
    },

    mutiplyScalar: function(s) {
        let elt = this.elements;

    },

    fromArray: function(array) {
        for (let i = 0; i < 9; ++ i) {
            this.elements[i] = array[i];
        }
        return this;
    },
    toArray: function(array) {
        if (array === undefined) array = [];

        let elt = this.elements;
        for (let i = 0; i < 9; ++ i) {
            array[i] = elt[i];
        }

        return array;
    }
});

export {Matrix3};