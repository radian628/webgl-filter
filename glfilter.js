class GLFilter {
    constructor (shader) {
        this.canvas = document.createElement("canvas");
        this.gl = this.canvas.getContext('webgl');

        let gl = this.gl;

        this.vert = gl.createShader(gl.VERTEX_SHADER);
        this.frag = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(this.vert, `
        attribute vec3 coordinates;

        varying vec2 vTexCoords;

        void main(void) {
            vTexCoords = coordinates.xy * 0.5 + vec2(0.5);
            vTexCoords = vec2(vTexCoords.x, 1.0 - vTexCoords.y);
            gl_Position = vec4(coordinates, 1.0);
        }

        `);
        gl.shaderSource(this.frag, shader);
        
        gl.compileShader(this.vert);
        gl.compileShader(this.frag);
        
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vert);
        gl.attachShader(this.program, this.frag);
        gl.linkProgram(this.program);

        console.log(gl.getShaderInfoLog(this.vert));
        console.log(gl.getShaderInfoLog(this.frag));
    }

    filter (image, amount, callback, uniforms) {

        this.canvas.width = image.width;
        this.canvas.height = image.height;

        let gl = this.gl;

        let tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        let vertices = [
            -1, -1, 1,
            1, -1, 1, 
            -1, 1, 1, 
            -1, 1, 1, 
            1, 1, 1, 
            1, -1, 1,
        ];

        let vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        
        gl.useProgram(this.program);

        let coord = gl.getAttribLocation(this.program, "coordinates");
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
    
        gl.uniform1i(gl.getUniformLocation(this.program, "uTexture"), 0);
        gl.uniform2f(gl.getUniformLocation(this.program, "uImageSize"), this.canvas.width, this.canvas.height);
        gl.uniform1f(gl.getUniformLocation(this.program, "uAmount"), amount);
        if (uniforms) {
            uniforms.forEach(e => {
                gl["uniform" + e.uniformType](gl.getUniformLocation(this.program, e.uniformName), ...e.uniformValues);
            });
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

        var img = new Image();
        img.width = this.canvas.width;
        img.height = this.canvas.height;
        img.src = this.canvas.toDataURL();
        img.onload = () => {
            callback(img);
        }

    }
}