
function Matrix4() {
    this.elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

Object.assign(Matrix4.prototype, {
    isMatrix4: true,
    set: function(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        let elt = this.elements;

        elt[0] = n11; elt[4] = n12; elt[8] = n13; elt[12] = n14;
        elt[1] = n21; elt[5] = n22; elt[9] = n23; elt[13] = n24;
        elt[2] = n31; elt[6] = n32; elt[10] = n33; elt[14] = n34;
        elt[3] = n41; elt[7] = n42; elt[11] = n43; elt[15] = n44;

        return this;
    },
    identity: function() {
        this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        return this;
    },
    clone: function() {
        return new this.constructor().fromArray(this.elements);
    },

    mutiplyMatrices: function(a, b) {
        let elt = this.elements;
        let aelt = a.elements;
        let belt = b.elements;

        let a11 = aelt[0], a12 = aelt[4], a13 = aelt[8], a14 = aelt[12]; 
        let a21 = aelt[1], a22 = aelt[5], a23 = aelt[9], a24 = aelt[13];
        let a31 = aelt[2], a32 = aelt[6], a33 = aelt[10], a34 = aelt[14];
        let a41 = aelt[3], a42 = aelt[7], a43 = aelt[11], a44 = aelt[15];

        let b11 = belt[0], b12 = belt[4], b13 = belt[8], b14 = belt[12]; 
        let b21 = belt[1], b22 = belt[5], b23 = belt[9], b24 = belt[13];
        let b31 = belt[2], b32 = belt[6], b33 = belt[10], b34 = belt[14];
        let b41 = belt[3], b42 = belt[7], b43 = belt[11], b44 = belt[15];

        elt[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        elt[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        elt[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        elt[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        elt[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        elt[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        elt[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        elt[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        elt[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        elt[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        elt[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        elt[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        elt[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        elt[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        elt[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        elt[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;
    },
    mutiply: function(m) {
        return this.mutiplyMatrices(this, m);
    },
    premutiply: function(m) {
        return this.mutiplyMatrices(m, this);
    },

    fromArray: function(array) {
        for (let i = 0; i < 16; ++ i) {
            this.elements[i] = array[i];
        }
        return this;
    },
    toArray: function(array) {
        if (array === undefined) array = [];

        let elt = this.elements;
        for (let i = 0; i < 16; ++ i) {
            array[i] = elt[i];
        }

        return array;
    }

});

export {Matrix4};

