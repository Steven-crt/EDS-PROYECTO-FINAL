/**
 * ================================================
 * HOLOGRAPHIC SHADER MODULE
 * Efecto holográfico WebGL para elementos destacados
 * ================================================
 */

const HolographicShader = {
    scenes: [],
    materials: [],
    animationId: null,
    
    init() {
        const containers = document.querySelectorAll('.hologram-container');
        if (!containers.length) return;
        
        containers.forEach(container => {
            this.createHologram(container);
        });
        
        this.animate();
    },
    
    createHologram(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'hologram-canvas';
        canvas.width = container.offsetWidth * 2;
        canvas.height = container.offsetHeight * 2;
        
        const gl = canvas.getContext('webgl', {
            alpha: true,
            antialias: true,
            premultipliedAlpha: false
        });
        
        if (!gl) return;
        
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `);
        
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
            precision mediump float;
            uniform float time;
            uniform vec2 resolution;
            uniform vec3 color;
            uniform float intensity;
            
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123;
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution;
                
                float scanline = sin(uv.y * resolution.y * 2.0 - time * 5.0) * 0.5 + 0.5;
                scanline = pow(scanline, 3.0) * 0.15;
                
                float flicker = noise(vec2(time * 10.0, uv.y * 5.0)) * 0.08;
                
                float scan = sin(uv.y * resolution.y * 0.5 - time * 2.0) * 0.5 + 0.5;
                scan = pow(scan, 8.0) * 0.2;
                
                float noiseTex = noise(uv * 50.0 + time * 0.5) * 0.15;
                
                float glow = intensity * (scanline + scan + flicker + noiseTex);
                
                float edgeGlow = smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
                edgeGlow *= smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
                
                float alpha = glow * edgeGlow;
                
                vec3 colorGlow = color * glow;
                
                gl_FragColor = vec4(colorGlow, alpha * 0.6);
            }
        `);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);
        
        const positionLocation = gl.getAttribLocation(program, 'position');
        
        const uniforms = {
            time: gl.getUniformLocation(program, 'time'),
            resolution: gl.getUniformLocation(program, 'resolution'),
            color: gl.getUniformLocation(program, 'color'),
            intensity: gl.getUniformLocation(program, 'intensity')
        };
        
        this.scenes.push({
            container,
            canvas,
            gl,
            program,
            positionBuffer,
            positionLocation,
            uniforms
        });
    },
    
    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    },
    
    animate() {
        const time = performance.now() * 0.001;
        
        this.scenes.forEach(scene => {
            const { gl, program, positionBuffer, positionLocation, uniforms } = scene;
            
            gl.viewport(0, 0, scene.canvas.width, scene.canvas.height);
            gl.useProgram(program);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            
            gl.uniform1f(uniforms.time, time);
            gl.uniform2f(uniforms.resolution, scene.canvas.width, scene.canvas.height);
            gl.uniform3f(uniforms.color, 0.086, 0.396, 0.753);
            gl.uniform1f(uniforms.intensity, 1.0);
            
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.scenes.forEach(scene => {
            scene.gl.deleteProgram(scene.program);
        });
        this.scenes = [];
    }
};

/**
 * ================================================
 * 3D SERVICE CONFIGURATOR
 * Configurador visual de servicios con preview
 * ================================================
 */

const ServiceConfigurator = {
    container: null,
    services: [],
    selectedServices: [],
    totalPrice: 0,
    
    data: {
        services: [
            {
                id: 'video',
                name: 'Video Vigilancia',
                icon: 'fa-video',
                price: 25000,
                description: 'Cámaras IP, NVR, monitoreo 24/7',
                color: '#1565c0'
            },
            {
                id: 'redes',
                name: 'Redes Inalámbricas',
                icon: 'fa-wifi',
                price: 18000,
                description: 'Links punto a punto, cobertura',
                color: '#f0b429'
            },
            {
                id: 'radio',
                name: 'Radio Comunicación',
                icon: 'fa-broadcast-tower',
                price: 35000,
                description: 'Sistemas Motorola, cobertura regional',
                color: '#e53935'
            },
            {
                id: 'acceso',
                name: 'Control de Accesos',
                icon: 'fa-fingerprint',
                price: 15000,
                description: 'Biometría, tarjetas, badges',
                color: '#2e7d32'
            },
            {
                id: 'audio',
                name: 'Audio y Video',
                icon: 'fa-volume-up',
                price: 22000,
                description: 'Sistemas AV profesionales',
                color: '#7b1fa2'
            },
            {
                id: 'alarmas',
                name: 'Centrales de Alarma',
                icon: 'fa-bell',
                price: 12000,
                description: 'Detección intrusos, monitoreo',
                color: '#ff6f00'
            }
        ]
    },
    
    init() {
        this.container = document.querySelector('.service-configurator');
        if (!this.container) return;
        
        this.render();
        this.bindEvents();
    },
    
    render() {
        this.container.innerHTML = `
            <div class="configurator-layout">
                <div class="configurator-services">
                    <h3 class="config-title">
                        <i class="fas fa-cogs"></i>
                        Selecciona tus Servicios
                    </h3>
                    <div class="services-list">
                        ${this.data.services.map(s => `
                            <div class="service-option" data-service="${s.id}">
                                <div class="service-check">
                                    <i class="fas fa-check"></i>
                                </div>
                                <div class="service-icon" style="color: ${s.color}">
                                    <i class="fas ${s.icon}"></i>
                                </div>
                                <div class="service-info">
                                    <h4>${s.name}</h4>
                                    <p>${s.description}</p>
                                </div>
                                <div class="service-price">
                                    S/ ${(s.price / 1000).toFixed(0)}k
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="configurator-preview">
                    <h3 class="config-title">
                        <i class="fas fa-eye"></i>
                        Preview 3D
                    </h3>
                    <div class="preview-container">
                        <div class="preview-building">
                            <div class="building-core"></div>
                            <div class="building-modules"></div>
                            <div class="building-glow"></div>
                        </div>
                        <div class="preview-stats">
                            <div class="stat">
                                <span class="stat-value">0</span>
                                <span class="stat-label">Servicios</span>
                            </div>
                            <div class="stat total">
                                <span class="stat-value">S/ 0</span>
                                <span class="stat-label">Inversión Est.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="configurator-cta">
                <button class="btn btn-whatsapp btn-lg" disabled>
                    <i class="fab fa-whatsapp"></i>
                    Solicitar Cotización
                </button>
            </div>
        `;
    },
    
    bindEvents() {
        const options = this.container.querySelectorAll('.service-option');
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                const serviceId = option.dataset.service;
                
                if (option.classList.contains('selected')) {
                    option.classList.remove('selected');
                    this.selectedServices = this.selectedServices.filter(s => s !== serviceId);
                } else {
                    option.classList.add('selected');
                    this.selectedServices.push(serviceId);
                }
                
                this.updatePreview();
            });
        });
        
        const whatsappBtn = this.container.querySelector('.configurator-cta button');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => {
                this.sendToWhatsApp();
            });
        }
    },
    
    updatePreview() {
        const serviceData = this.data.services.filter(s => 
            this.selectedServices.includes(s.id)
        );
        
        this.totalPrice = serviceData.reduce((sum, s) => sum + s.price, 0);
        
        const countEl = this.container.querySelector('.stat:first-child .stat-value');
        const totalEl = this.container.querySelector('.stat.total .stat-value');
        const whatsappBtn = this.container.querySelector('.configurator-cta button');
        const modulesContainer = this.container.querySelector('.building-modules');
        
        if (countEl) countEl.textContent = this.selectedServices.length;
        if (totalEl) totalEl.textContent = 'S/ ' + (this.totalPrice / 1000).toFixed(0) + 'k';
        
        if (whatsappBtn) {
            whatsappBtn.disabled = this.selectedServices.length === 0;
        }
        
        if (modulesContainer) {
            modulesContainer.innerHTML = serviceData.map((s, i) => `
                <div class="module" style="
                    --color: ${s.color};
                    --delay: ${i * 0.1}s;
                ">
                    <i class="fas ${s.icon}"></i>
                </div>
            `).join('');
        }
    },
    
    sendToWhatsApp() {
        const selectedNames = this.data.services
            .filter(s => this.selectedServices.includes(s.id))
            .map(s => s.name)
            .join(', ');
        
        const message = encodeURIComponent(
            `Hola, me gustaría cotizar los siguientes servicios:\n\n` +
            `Servicios: ${selectedNames || 'Ninguno seleccionado'}\n` +
            `Inversión estimada: S/ ${this.totalPrice.toLocaleString('es-ES')}\n\n` +
            `¿Podrían darme más información?`
        );
        
        window.open(`https://wa.me/51950313642?text=${message}`, '_blank');
    }
};

/**
 * ================================================
 * 3D SERVICE PREVIEW
 * Preview 3D interactivo de servicios
 * ================================================
 */

const ServicePreview3D = {
    scene: null,
    camera: null,
    renderer: null,
    modules: [],
    container: null,
    
    init() {
        this.container = document.querySelector('.service-preview-3d');
        if (!this.container || typeof THREE === 'undefined') return;
        
        this.setupScene();
        this.createModules();
        this.animate();
        
        window.addEventListener('resize', () => this.onResize());
    },
    
    setupScene() {
        this.scene = new THREE.Scene();
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.z = 5;
        
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.container.appendChild(this.renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x1565c0, 1, 100);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
        
        const pointLight2 = new THREE.PointLight(0xf0b429, 0.5, 100);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);
    },
    
    createModules() {
        const moduleData = [
            { name: 'Video', icon: 'fa-video', color: 0x1565c0, angle: 0 },
            { name: 'Redes', icon: 'fa-wifi', color: 0xf0b429, angle: Math.PI * 0.5 },
            { name: 'Radio', icon: 'fa-broadcast-tower', color: 0xe53935, angle: Math.PI },
            { name: 'Acceso', icon: 'fa-fingerprint', color: 0x2e7d32, angle: Math.PI * 1.5 }
        ];
        
        moduleData.forEach((data, i) => {
            const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });
            
            const module = new THREE.Mesh(geometry, material);
            module.position.x = Math.cos(data.angle) * 2;
            module.position.z = Math.sin(data.angle) * 2;
            module.userData = { ...data, baseY: 0 };
            
            this.scene.add(module);
            this.modules.push(module);
        });
        
        const coreGeometry = new THREE.OctahedronGeometry(0.6);
        const coreMaterial = new THREE.MeshPhongMaterial({
            color: 0xf0b429,
            transparent: true,
            opacity: 0.9,
            emissive: 0xf0b429,
            emissiveIntensity: 0.3
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.scene.add(core);
        this.modules.push(core);
    },
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = performance.now() * 0.001;
        
        this.modules.forEach((module, i) => {
            module.rotation.y += 0.01;
            module.rotation.x += 0.005;
            
            if (module.userData.baseY !== undefined) {
                module.position.y = Math.sin(time + i) * 0.2;
            } else {
                module.position.y = Math.sin(time * 2) * 0.1;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    },
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
};