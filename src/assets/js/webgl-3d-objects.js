class WebGL3DObjects {
    constructor() {
        console.log('WebGL3DObjects constructor called');

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'webgl-objects-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.8';
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'; // 透明背景に戻す

        document.body.insertBefore(this.canvas, document.body.firstChild);

        console.log('Canvas created and inserted');

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.error('WebGL not supported for 3D objects');
            return;
        }

        console.log('WebGL 3D Objects initialized successfully');

        this.cubeRotation = 0.0;
        this.time = 0;

        this.testDraw();
    }

    testDraw() {
        const gl = this.gl;

        // 立方体用のシェーダー
        const vsSource = `
            attribute vec3 a_position;
            attribute vec4 a_color;
            
            uniform mat4 u_matrix;
            
            varying vec4 v_color;
            
            void main() {
                gl_Position = u_matrix * vec4(a_position, 1.0);
                v_color = a_color;
            }
        `;

        const fsSource = `
            precision mediump float;
            
            varying vec4 v_color;
            
            void main() {
                gl_FragColor = v_color;
            }
        `;

        this.program = this.createShaderProgram(vsSource, fsSource);
        if (!this.program) {
            console.error('Failed to create shader program');
            return;
        }

        // 立方体の頂点データ
        this.initCubeBuffers();

        // アニメーション開始
        this.animate();

        console.log('Cube initialized and animation started');
    }

    initCubeBuffers() {
        const gl = this.gl;

        // 立方体の頂点
        const vertices = new Float32Array([
            // Front face
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            // Back face
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            // Top face
            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            // Bottom face
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            // Right face
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            // Left face
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,
        ]);

        // 色
        const colors = new Float32Array([
            // Front face - red
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            // Back face - green
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            // Top face - blue
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            // Bottom face - yellow
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            // Right face - purple
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            // Left face - cyan
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
        ]);

        // インデックス
        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,  // front
            4, 5, 6, 4, 6, 7,  // back
            8, 9, 10, 8, 10, 11,  // top
            12, 13, 14, 12, 14, 15,  // bottom
            16, 17, 18, 16, 18, 19,  // right
            20, 21, 22, 20, 22, 23,  // left
        ]);

        // バッファー作成
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.indexCount = indices.length;
    }

    animate() {
        this.cubeRotation += 0.01;
        this.drawCube();
        requestAnimationFrame(() => this.animate());
    }

    drawCube() {
        const gl = this.gl;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(this.program);

        // 行列計算
        const aspect = gl.canvas.width / gl.canvas.height;
        const matrix = this.createMatrix(aspect);

        // uniform設定
        const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // 頂点属性設定
        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        const colorLocation = gl.getAttribLocation(this.program, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

        // 描画
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    createMatrix(aspect) {
        // 簡単な行列計算
        const matrix = new Float32Array(16);

        // 単位行列
        matrix[0] = 1; matrix[5] = 1; matrix[10] = 1; matrix[15] = 1;

        // 透視投影
        const fov = Math.PI / 4;
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv = 1.0 / (1 - 10);

        matrix[0] = f / aspect;
        matrix[5] = f;
        matrix[10] = (1 + 10) * rangeInv;
        matrix[11] = -1;
        matrix[14] = 2 * 10 * rangeInv;
        matrix[15] = 0;

        // 回転
        const c = Math.cos(this.cubeRotation);
        const s = Math.sin(this.cubeRotation);

        // Y軸回転を適用
        const rotMatrix = new Float32Array(16);
        rotMatrix[0] = c; rotMatrix[2] = s;
        rotMatrix[5] = 1;
        rotMatrix[8] = -s; rotMatrix[10] = c;
        rotMatrix[15] = 1;

        // 行列乗算（簡易版）
        const result = new Float32Array(16);
        for (let i = 0; i < 16; i++) {
            result[i] = matrix[i];
        }

        // Z軸移動
        result[14] -= 3;

        return result;

        if (!vertexShader || !fragmentShader) {
            return null;
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader program link failed:', gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    loadShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating WebGL3DObjects');
    new WebGL3DObjects();
});
