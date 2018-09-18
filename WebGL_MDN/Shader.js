
// 初始化着色器程序，让WebGL知道如何绘制我们的数据
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loaderShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loaderShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initializa the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return;
    }

    return shaderProgram;
}

// 创建制定类型的着色器，上传source源码并编译
function loaderShader(gl, type, source) {
    const shader =  gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}