
function GLHelper () {
    this.glContext = null;
}

Object.assign(GLHelper.prototype, {
    initGLContext: function(id) {
        let canvas = document.getElementById(id);
        this.glContext = canvas.getContext('webgl');
    }
});

export {GLHelper};

