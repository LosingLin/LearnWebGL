
function GLHelper () {
    this.glContext = null;
}

Object.assign(GLHelper.prototype, {
    initGLContext: function(id) {
        let canvas = document.getElementById(id);
        this.glContext = canvas.getContext('webgl');
    },
    loadShader: function(source, type) {
        const gl = this.glContext;
        
        const shader = gl.createShader(type);
        
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn('An error occurred compiling the shader : ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    },
    initShaderProgram: function(vsource, fsource) {
        const gl = this.glContext;

        const vertexShader = this.loadShader(vsource, gl.VERTEX_SHADER);
        const fragmentShader = this.loadShader(fsource, gl.FRAGMENT_SHADER);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.warn('Can not initializa shader program : ' + gl.getProgramInfoLog(shaderProgram));
            gl.deletePrograme(shaderProgram);
            return null;
        }
        return shaderProgram;
    }
});

export {GLHelper};

