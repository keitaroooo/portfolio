class WebGLFallback {
    static checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch(e) {
            return false;
        }
    }
    
    static init() {
        if (!this.checkWebGLSupport()) {
            console.log('WebGL not supported, applying fallback styles');
            document.body.classList.add('no-webgl');
            this.createFallbackBackground();
        }
        
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('Reduced motion preferred, optimizing WebGL performance');
            this.optimizeForAccessibility();
        }
    }
    
    static createFallbackBackground() {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.id = 'fallback-canvas';
        fallbackCanvas.style.position = 'fixed';
        fallbackCanvas.style.top = '0';
        fallbackCanvas.style.left = '0';
        fallbackCanvas.style.width = '100%';
        fallbackCanvas.style.height = '100%';
        fallbackCanvas.style.zIndex = '-2';
        fallbackCanvas.style.opacity = '0.8';
        
        document.body.insertBefore(fallbackCanvas, document.body.firstChild);
        
        const ctx = fallbackCanvas.getContext('2d');
        
        function resizeCanvas() {
            fallbackCanvas.width = window.innerWidth;
            fallbackCanvas.height = window.innerHeight;
            drawFallbackBackground();
        }
        
        function drawFallbackBackground() {
            const gradient = ctx.createLinearGradient(0, 0, fallbackCanvas.width, fallbackCanvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#16213e');
            gradient.addColorStop(1, '#0f3460');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
            
            // Add some animated stars
            const time = Date.now() * 0.001;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            
            for (let i = 0; i < 50; i++) {
                const x = (Math.sin(time * 0.1 + i) + 1) * fallbackCanvas.width / 2;
                const y = (Math.cos(time * 0.15 + i * 1.5) + 1) * fallbackCanvas.height / 2;
                const size = Math.sin(time + i) * 2 + 3;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            requestAnimationFrame(drawFallbackBackground);
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }
    
    static optimizeForAccessibility() {
        // Reduce particle count for better performance
        if (window.ParticleSystem) {
            window.ParticleSystem.prototype.particleCount = 50;
        }
        
        // Add visibility controls for animations
        const style = document.createElement('style');
        style.textContent = `
            @media (prefers-reduced-motion: reduce) {
                #particle-canvas,
                #shader-canvas {
                    opacity: 0.3 !important;
                }
                
                .title span {
                    transition: none !important;
                    transform: translate(0, 0) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Performance monitoring
class PerformanceMonitor {
    static init() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        function checkPerformance() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                if (fps < 30) {
                    console.warn('Low FPS detected:', fps);
                    PerformanceMonitor.reduceQuality();
                }
            }
            
            requestAnimationFrame(checkPerformance);
        }
        
        checkPerformance();
    }
    
    static reduceQuality() {
        // Reduce particle count
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas && particleCanvas.style.opacity !== '0.2') {
            particleCanvas.style.opacity = '0.2';
            console.log('Reduced particle opacity for performance');
        }
        
        // Reduce shader canvas opacity
        const shaderCanvas = document.getElementById('shader-canvas');
        if (shaderCanvas && shaderCanvas.style.opacity !== '0.3') {
            shaderCanvas.style.opacity = '0.3';
            console.log('Reduced shader opacity for performance');
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    WebGLFallback.init();
    PerformanceMonitor.init();
});
