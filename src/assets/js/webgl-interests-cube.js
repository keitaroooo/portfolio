class InterestsCube {
    constructor() {
        this.canvas = document.getElementById('interests-cube');
        if (!this.canvas) return;

        this.canvas.width = 300;
        this.canvas.height = 300;

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) return;

        this.isDragging = false;
        this.prevX = 0;
        this.prevY = 0;
        this.rotationX = -0.3;
        this.rotationY = 0.5;
        this.autoRotate = true;
        this.dragTimeout = null;

        this.init();
        this.setupEvents();
        this.animate();
    }

    init() {
        const gl = this.gl;

        // シェーダー
        const vsSource = `
            attribute vec3 a_position;
            attribute vec2 a_texCoord;
            uniform mat4 u_projection;
            uniform mat4 u_modelView;
            varying vec2 v_texCoord;
            void main() {
                gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;
            uniform float u_alpha;
            void main() {
                vec4 texColor = texture2D(u_texture, v_texCoord);
                gl_FragColor = vec4(texColor.rgb, texColor.a * u_alpha);
            }
        `;

        this.program = this.createProgram(vsSource, fsSource);
        if (!this.program) return;

        this.aPosition = gl.getAttribLocation(this.program, 'a_position');
        this.aTexCoord = gl.getAttribLocation(this.program, 'a_texCoord');
        this.uProjection = gl.getUniformLocation(this.program, 'u_projection');
        this.uModelView = gl.getUniformLocation(this.program, 'u_modelView');
        this.uTexture = gl.getUniformLocation(this.program, 'u_texture');
        this.uAlpha = gl.getUniformLocation(this.program, 'u_alpha');

        this.initBuffers();
        this.initTextures();
    }

    initBuffers() {
        const gl = this.gl;
        const s = 0.8;

        // 各面4頂点 × 6面 = 24頂点（外向き法線: 外から見てCCW巻き）
        const positions = new Float32Array([
            // Front (z=+s, 外から見て: 左下→右下→右上→左上)
            -s, -s, s, s, -s, s, s, s, s, -s, s, s,
            // Back (z=-s, 外から見て: 左下→右下→右上→左上)
            s, -s, -s, -s, -s, -s, -s, s, -s, s, s, -s,
            // Top (y=+s, 外から見て)
            -s, s, s, s, s, s, s, s, -s, -s, s, -s,
            // Bottom (y=-s, 外から見て)
            -s, -s, -s, s, -s, -s, s, -s, s, -s, -s, s,
            // Right (x=+s, 外から見て)
            s, -s, s, s, -s, -s, s, s, -s, s, s, s,
            // Left (x=-s, 外から見て)
            -s, -s, -s, -s, -s, s, -s, s, s, -s, s, -s,
        ]);

        // 全面共通のUV（UNPACK_FLIP_Y_WEBGLで上下反転を処理）
        const texCoords = new Float32Array([
            0, 0, 1, 0, 1, 1, 0, 1, // Front
            0, 0, 1, 0, 1, 1, 0, 1, // Back
            0, 0, 1, 0, 1, 1, 0, 1, // Top
            0, 0, 1, 0, 1, 1, 0, 1, // Bottom
            0, 0, 1, 0, 1, 1, 0, 1, // Right
            0, 0, 1, 0, 1, 1, 0, 1, // Left
        ]);

        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
        ]);

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    initTextures() {
        const gl = this.gl;
        const interests = ['Comedy', 'Sports', 'Trip', 'Creating', 'Finance', 'Health'];

        this.textures = interests.map((text) => {
            const c = document.createElement('canvas');
            c.width = 256;
            c.height = 256;
            const ctx = c.getContext('2d');

            // 背景（mainのスタイルを参考: rgba(0,0,0,0.85) + border rgba(255,255,255,0.2)）
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, 256, 256);

            // ボーダー（mainのborderに合わせた白い薄枠）
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 3;
            ctx.strokeRect(4, 4, 248, 248);

            // 中央のグロー
            const glow = ctx.createRadialGradient(128, 128, 0, 128, 128, 110);
            glow.addColorStop(0, 'rgba(170, 143, 123, 0.12)');
            glow.addColorStop(1, 'rgba(170, 143, 123, 0.0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, 256, 256);

            // テキスト
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '600 32px "Josefin Sans", sans-serif';
            ctx.shadowColor = 'rgba(170, 143, 123, 0.8)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, 128, 128);

            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            return texture;
        });
    }

    setupEvents() {
        const c = this.canvas;

        const startDrag = (x, y) => {
            this.isDragging = true;
            this.prevX = x;
            this.prevY = y;
            this.autoRotate = false;
            if (this.dragTimeout) clearTimeout(this.dragTimeout);
        };

        const moveDrag = (x, y) => {
            if (!this.isDragging) return;
            this.rotationY += (x - this.prevX) * 0.01;
            this.rotationX += (y - this.prevY) * 0.01;
            this.prevX = x;
            this.prevY = y;
        };

        const endDrag = () => {
            this.isDragging = false;
            this.dragTimeout = setTimeout(() => { this.autoRotate = true; }, 2000);
        };

        c.addEventListener('mousedown', (e) => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
        document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
        document.addEventListener('mouseup', () => { if (this.isDragging) endDrag(); });
        c.addEventListener('touchstart', (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); });
        document.addEventListener('touchmove', (e) => { if (this.isDragging) moveDrag(e.touches[0].clientX, e.touches[0].clientY); });
        document.addEventListener('touchend', () => { if (this.isDragging) endDrag(); });
    }

    render() {
        const gl = this.gl;

        gl.clearColor(0, 0, 0, 0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.program);

        // 透視投影行列
        const projection = mat4.create();
        mat4.perspective(projection, Math.PI / 4, 1, 0.1, 100);

        // モデルビュー行列
        const modelView = mat4.create();
        mat4.translate(modelView, modelView, [0, 0, -4]);
        mat4.rotate(modelView, modelView, this.rotationX, [1, 0, 0]);
        mat4.rotate(modelView, modelView, this.rotationY, [0, 1, 0]);

        gl.uniformMatrix4fv(this.uProjection, false, projection);
        gl.uniformMatrix4fv(this.uModelView, false, modelView);

        // 頂点属性
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.aPosition);
        gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(this.aTexCoord);
        gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // 各面を個別テクスチャで描画
        for (let i = 0; i < 6; i++) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.uniform1i(this.uTexture, 0);
            gl.uniform1f(this.uAlpha, 0.75);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, i * 6 * 2);
        }
    }

    animate() {
        if (this.autoRotate) {
            this.rotationY += 0.005;
            this.rotationX += 0.002;
        }
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return null;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link failed:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    compileShader(type, source) {
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
    new InterestsCube();
});
