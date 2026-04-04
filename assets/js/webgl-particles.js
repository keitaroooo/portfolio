class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.opacity = '0.5';

        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.warn('WebGL not supported');
            return;
        }

        this.particles = [];
        this.particleCount = 150;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;

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
            attribute vec2 a_position;
            attribute float a_size;
            attribute vec3 a_color;
            
            varying vec3 v_color;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                gl_PointSize = a_size;
                v_color = a_color;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec3 v_color;
            
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float distance = length(coord);
                
                if (distance > 0.5) {
                    discard;
                }
                
                float alpha = 1.0 - (distance * 2.0);
                gl_FragColor = vec4(v_color, alpha * 0.8);
            }
        `;

        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.sizeAttributeLocation = this.gl.getAttribLocation(this.program, 'a_size');
        this.colorAttributeLocation = this.gl.getAttribLocation(this.program, 'a_color');

        this.positionBuffer = this.gl.createBuffer();
        this.sizeBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();

        this.initParticles();
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

    initParticles() {
        this.particles = [];

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                vx: (Math.random() - 0.5) * 0.002,
                vy: (Math.random() - 0.5) * 0.002,
                size: Math.random() * 3 + 1,
                color: [Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.5, Math.random() * 0.3 + 0.9]
            });
        }
    }

    updateParticles() {
        for (let particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;

            const mouseInfluence = 0.0001;
            const dx = (this.mouseX / window.innerWidth - 0.5) * 2 - particle.x;
            const dy = (this.mouseY / window.innerHeight - 0.5) * 2 - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 0.5) {
                particle.vx += dx * mouseInfluence;
                particle.vy += dy * mouseInfluence;
            }

            // 追加アニメーション: 正弦波運動
            particle.vx += Math.sin(this.time * 0.001 + particle.y * 5) * 0.0001;
            particle.vy += Math.cos(this.time * 0.001 + particle.x * 5) * 0.0001;

            // 追加アニメーション: サイズ変化
            particle.size = (Math.sin(this.time * 0.002 + particle.x * 10) + 1) * 2 + 1;

            // 追加アニメーション: 色の変化
            const hueShift = Math.sin(this.time * 0.0005 + particle.x * 3) * 0.1;
            particle.color[0] = Math.max(0.5, Math.min(1.0, particle.color[0] + hueShift));
            particle.color[1] = Math.max(0.3, Math.min(0.8, particle.color[1] - hueShift * 0.5));

            particle.vx *= 0.99;
            particle.vy *= 0.99;

            if (particle.x > 1.2) particle.x = -1.2;
            if (particle.x < -1.2) particle.x = 1.2;
            if (particle.y > 1.2) particle.y = -1.2;
            if (particle.y < -1.2) particle.y = 1.2;
        }
    }

    render() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);

        const positions = [];
        const sizes = [];
        const colors = [];

        for (let particle of this.particles) {
            positions.push(particle.x, particle.y);
            sizes.push(particle.size);
            colors.push(...particle.color);
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(sizes), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.sizeAttributeLocation);
        this.gl.vertexAttribPointer(this.sizeAttributeLocation, 1, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.colorAttributeLocation);
        this.gl.vertexAttribPointer(this.colorAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.drawArrays(this.gl.POINTS, 0, this.particles.length);
    }

    animate() {
        this.time += 16; // 約60fpsを想定
        this.updateParticles();
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
    new ParticleSystem();
});
