class ShaderBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'shader-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-2';
        this.canvas.style.opacity = '0.4';

        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.warn('WebGL not supported for shader background');
            return;
        }

        this.time = 0;
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    init() {
        this.resize();

        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_uv = (a_position + 1.0) * 0.5;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec2 v_uv;
            uniform float u_time;
            uniform vec2 u_resolution;
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            void main() {
                vec2 st = v_uv;
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(st, center);
                
                // 追加アニメーション: 複数の波の重ね合わせ
                float wave1 = sin(dist * 8.0 - u_time * 3.0) * 0.5 + 0.5;
                float wave2 = sin(dist * 12.0 + u_time * 2.0) * 0.5 + 0.5;
                float wave3 = sin(dist * 16.0 - u_time * 4.0) * 0.5 + 0.5;
                float wave4 = sin(dist * 20.0 + u_time * 1.5) * 0.5 + 0.5;
                
                float combinedWave = (wave1 + wave2 + wave3 + wave4) / 4.0;
                
                // 追加アニメーション: 時間によるノイズ変化
                float n1 = noise(st * 3.0 + u_time * 0.2);
                float n2 = noise(st * 8.0 - u_time * 0.1);
                float n3 = noise(st * 15.0 + u_time * 0.05);
                float noiseVal = (n1 + n2 + n3) / 3.0;
                
                // 追加アニメーション: 動的な色相変化
                float hue = 0.72 + combinedWave * 0.08 + noiseVal * 0.05 + sin(u_time * 0.5) * 0.03;
                float saturation = 0.15 + dist * 0.1 + sin(u_time * 0.3) * 0.03;
                float brightness = 0.35 + combinedWave * 0.15 + sin(u_time * 0.7) * 0.03;
                
                vec3 color = hsv2rgb(vec3(hue, saturation, brightness));
                
                // 追加アニメーション: 脈動するビネット効果
                float vignette = 1.0 - smoothstep(0.0, 1.2 + sin(u_time * 2.0) * 0.2, dist);
                color *= vignette;
                
                // 追加アニメーション: スキャンライン効果
                float scanline = sin(st.y * u_resolution.y * 2.0 + u_time * 10.0) * 0.02 + 0.98;
                color *= scanline;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.timeUniformLocation = this.gl.getUniformLocation(this.program, 'u_time');
        this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_resolution');

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    }

    createShaderProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize shader program:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    render() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.uniform1f(this.timeUniformLocation, this.time);
        this.gl.uniform2f(this.resolutionUniformLocation, this.canvas.width, this.canvas.height);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    animate() {
        this.time += 0.01;
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ShaderBackground();
});
