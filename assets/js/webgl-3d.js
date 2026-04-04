class Particle3DSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-3d-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.4';

        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.warn('WebGL not supported for 3D particles');
            return;
        }

        this.particles = [];
        this.particleCount = 200;
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    init() {
        this.resize();

        const vertexShaderSource = `
            attribute vec3 a_position;
            attribute float a_size;
            attribute vec3 a_color;
            
            uniform mat4 u_projection;
            uniform mat4 u_view;
            
            varying vec3 v_color;
            varying float v_depth;
            
            void main() {
                vec4 worldPosition = vec4(a_position, 1.0);
                vec4 viewPosition = u_view * worldPosition;
                vec4 clipPosition = u_projection * viewPosition;
                
                gl_Position = clipPosition;
                gl_PointSize = a_size * (300.0 / -viewPosition.z);
                v_color = a_color;
                v_depth = viewPosition.z;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec3 v_color;
            varying float v_depth;
            
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float distance = length(coord);
                
                if (distance > 0.5) {
                    discard;
                }
                
                float alpha = 1.0 - (distance * 2.0);
                float depthFade = 1.0 - (abs(v_depth) / 10.0);
                alpha *= depthFade;
                
                gl_FragColor = vec4(v_color, alpha * 0.8);
            }
        `;

        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.sizeAttributeLocation = this.gl.getAttribLocation(this.program, 'a_size');
        this.colorAttributeLocation = this.gl.getAttribLocation(this.program, 'a_color');

        this.projectionUniformLocation = this.gl.getUniformLocation(this.program, 'u_projection');
        this.viewUniformLocation = this.gl.getUniformLocation(this.program, 'u_view');

        this.positionBuffer = this.gl.createBuffer();
        this.sizeBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();

        this.initParticles();
        this.setupMatrices();
    }

    createShaderProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize 3D shader program:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the 3D shaders:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    setupMatrices() {
        // 投影行列
        const aspect = this.canvas.width / this.canvas.height;
        this.projectionMatrix = this.perspective(45 * Math.PI / 180, aspect, 0.1, 100.0);
    }

    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);

        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ]);
    }

    lookAt(eye, center, up) {
        const zAxis = this.normalize(this.subtract(eye, center));
        const xAxis = this.normalize(this.cross(up, zAxis));
        const yAxis = this.cross(zAxis, xAxis);

        return new Float32Array([
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1
        ]);
    }

    normalize(v) {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / length, v[1] / length, v[2] / length];
    }

    subtract(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    initParticles() {
        this.particles = [];

        for (let i = 0; i < this.particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = Math.random() * 5 + 2;

            this.particles.push({
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.sin(phi) * Math.sin(theta),
                z: radius * Math.cos(phi),
                vx: (Math.random() - 0.5) * 0.01,
                vy: (Math.random() - 0.5) * 0.01,
                vz: (Math.random() - 0.5) * 0.01,
                size: Math.random() * 3 + 1,
                color: [
                    Math.random() * 0.3 + 0.7,
                    Math.random() * 0.3 + 0.5,
                    Math.random() * 0.3 + 0.9
                ]
            });
        }
    }

    updateParticles() {
        for (let particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;

            // 3D螺旋運動
            const spiralForce = 0.001;
            particle.vx += Math.sin(this.time * 0.001 + particle.y) * spiralForce;
            particle.vy += Math.cos(this.time * 0.001 + particle.x) * spiralForce;
            particle.vz += Math.sin(this.time * 0.0015 + particle.z) * spiralForce;

            // 中心への引力
            const distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y + particle.z * particle.z);
            if (distance > 8) {
                const gravity = 0.001;
                particle.vx -= (particle.x / distance) * gravity;
                particle.vy -= (particle.y / distance) * gravity;
                particle.vz -= (particle.z / distance) * gravity;
            }

            // マウス影響
            const mouseInfluence = 0.0005;
            const mouse3DX = (this.mouseX / window.innerWidth - 0.5) * 10;
            const mouse3DY = (this.mouseY / window.innerHeight - 0.5) * 10;
            const mouseDx = mouse3DX - particle.x;
            const mouseDy = mouse3DY - particle.y;
            const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

            if (mouseDistance < 3) {
                particle.vx += mouseDx * mouseInfluence;
                particle.vy += mouseDy * mouseInfluence;
            }

            // サイズと色のアニメーション
            particle.size = (Math.sin(this.time * 0.002 + particle.x * 2) + 1) * 2 + 1;
            const hueShift = Math.sin(this.time * 0.0005 + particle.z) * 0.1;
            particle.color[0] = Math.max(0.5, Math.min(1.0, particle.color[0] + hueShift));

            // 減衰
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            particle.vz *= 0.99;

            // 境界チェック
            if (Math.abs(particle.x) > 10) particle.x = -particle.x;
            if (Math.abs(particle.y) > 10) particle.y = -particle.y;
            if (Math.abs(particle.z) > 10) particle.z = -particle.z;
        }
    }

    render() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.useProgram(this.program);

        // カメラの設定
        const cameraX = Math.sin(this.time * 0.0003) * 5;
        const cameraY = Math.cos(this.time * 0.0002) * 3;
        const cameraZ = Math.cos(this.time * 0.0004) * 8 + 10;

        const viewMatrix = this.lookAt(
            [cameraX, cameraY, cameraZ], // カメラ位置
            [0, 0, 0], // 注視点
            [0, 1, 0]  // 上方向
        );

        this.gl.uniformMatrix4fv(this.projectionUniformLocation, false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.viewUniformLocation, false, viewMatrix);

        const positions = [];
        const sizes = [];
        const colors = [];

        for (let particle of this.particles) {
            positions.push(particle.x, particle.y, particle.z);
            sizes.push(particle.size);
            colors.push(...particle.color);
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(sizes), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.sizeAttributeLocation);
        this.gl.vertexAttribPointer(this.sizeAttributeLocation, 1, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.drawArrays(this.gl.POINTS, 0, this.particles.length);
    }

    animate() {
        this.time += 16;
        this.updateParticles();
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.setupMatrices();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Particle3DSystem();
});
