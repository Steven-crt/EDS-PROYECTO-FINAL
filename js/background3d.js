/**
 * ================================================
 * BACKGROUND3D.JS - EDS Edificaciones Inteligentes
 * Sistema de fondos 3D con Three.js avanzado
 * ================================================
 */

(function() {
    'use strict';

    var Background3D = {
        scene: null,
        camera: null,
        renderer: null,
        particles: null,
        geometries: [],
        orbitalRings: [],
        mouseX: 0,
        mouseY: 0,
        targetMouseX: 0,
        targetMouseY: 0,
        animationId: null,
        isMobile: false,
        isVisible: true,
        clock: null,

        init: function() {
            if (typeof THREE === 'undefined') {
                console.warn('Three.js not loaded');
                return;
            }

            this.isMobile = window.innerWidth < 768;
            this.clock = new THREE.Clock();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.createAdvancedParticles();
            this.createOrbitalRings();
            this.createGeometries();
            this.createFloatingShapes();
            this.setupEvents();
            this.animate();
        },

        setupScene: function() {
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2(0xffffff, 0.002);
        },

        setupCamera: function() {
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.z = 50;
        },

        setupRenderer: function() {
            this.renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: !this.isMobile,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1 : 2));
            this.renderer.setClearColor(0xffffff, 0);

            var canvas = this.renderer.domElement;
            canvas.id = 'three-bg-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '-2';
            canvas.style.pointerEvents = 'none';
            document.body.insertBefore(canvas, document.body.firstChild);
        },

        createAdvancedParticles: function() {
            var particleCount = this.isMobile ? 300 : 800;
            var colors = [
                new THREE.Color(0xfbbf24),
                new THREE.Color(0xf59e0b),
                new THREE.Color(0xd97706),
                new THREE.Color(0xb45309),
                new THREE.Color(0x92400e),
                new THREE.Color(0x78350f)
            ];

            var geometry = new THREE.BufferGeometry();
            var positions = new Float32Array(particleCount * 3);
            var colorArray = new Float32Array(particleCount * 3);
            var sizes = new Float32Array(particleCount);
            var velocities = new Float32Array(particleCount * 3);

            for (var i = 0; i < particleCount; i++) {
                var i3 = i * 3;

                positions[i3] = (Math.random() - 0.5) * 150;
                positions[i3 + 1] = (Math.random() - 0.5) * 150;
                positions[i3 + 2] = (Math.random() - 0.5) * 80;

                var color = colors[Math.floor(Math.random() * colors.length)];
                colorArray[i3] = color.r;
                colorArray[i3 + 1] = color.g;
                colorArray[i3 + 2] = color.b;

                sizes[i] = Math.random() * 3 + 0.5;

                velocities[i3] = (Math.random() - 0.5) * 0.02;
                velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
                velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

            var vertexShader = [
                'attribute float size;',
                'varying vec3 vColor;',
                'void main() {',
                '    vColor = color;',
                '    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
                '    gl_PointSize = size * (250.0 / -mvPosition.z);',
                '    gl_Position = projectionMatrix * mvPosition;',
                '}'
            ].join('\n');

            var fragmentShader = [
                'varying vec3 vColor;',
                'void main() {',
                '    float dist = length(gl_PointCoord - vec2(0.5));',
                '    if (dist > 0.5) discard;',
                '    float alpha = smoothstep(0.5, 0.0, dist);',
                '    gl_FragColor = vec4(vColor, alpha * 0.4);',
                '}'
            ].join('\n');

            var material = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                vertexColors: true,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            this.particles = new THREE.Points(geometry, material);
            this.scene.add(this.particles);
        },

        createOrbitalRings: function() {
            if (this.isMobile) return;

            var ringColors = [0xfbbf24, 0xf59e0b, 0xd97706];

            for (var r = 0; r < 3; r++) {
                var ringGeometry = new THREE.TorusGeometry(
                    15 + r * 8,
                    0.3,
                    16,
                    100
                );

                var ringMaterial = new THREE.MeshBasicMaterial({
                    color: ringColors[r],
                    wireframe: true,
                    transparent: true,
                    opacity: 0.15
                });

                var ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.set(
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 30,
                    -20 - r * 10
                );
                ring.userData = {
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.003,
                        y: (Math.random() - 0.5) * 0.005,
                        z: (Math.random() - 0.5) * 0.002
                    },
                    orbitSpeed: 0.0005 + r * 0.0002,
                    orbitRadius: 20 + r * 10,
                    orbitAngle: Math.random() * Math.PI * 2,
                    initialX: ring.position.x,
                    initialY: ring.position.y
                };

                this.scene.add(ring);
                this.orbitalRings.push(ring);
            }
        },

        createGeometries: function() {
            if (this.isMobile) return;

            var wireframeMaterial = function(color, opacity) {
                return new THREE.MeshBasicMaterial({
                    color: color,
                    wireframe: true,
                    transparent: true,
                    opacity: opacity
                });
            };

            var dodecahedron = new THREE.Mesh(
                new THREE.DodecahedronGeometry(5, 0),
                wireframeMaterial(0xf59e0b, 0.12)
            );
            dodecahedron.position.set(-30, 20, -25);
            dodecahedron.userData = {
                rotSpeed: { x: 0.003, y: 0.004, z: 0.002 },
                floatSpeed: 0.001,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(dodecahedron);
            this.geometries.push(dodecahedron);

            var icosahedron = new THREE.Mesh(
                new THREE.IcosahedronGeometry(6, 1),
                wireframeMaterial(0xfbbf24, 0.1)
            );
            icosahedron.position.set(35, -15, -20);
            icosahedron.userData = {
                rotSpeed: { x: 0.002, y: 0.003, z: 0.001 },
                floatSpeed: 0.0008,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(icosahedron);
            this.geometries.push(icosahedron);

            var octahedron = new THREE.Mesh(
                new THREE.OctahedronGeometry(4, 0),
                wireframeMaterial(0xd97706, 0.1)
            );
            octahedron.position.set(-20, -25, -30);
            octahedron.userData = {
                rotSpeed: { x: 0.004, y: 0.002, z: 0.003 },
                floatSpeed: 0.0012,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(octahedron);
            this.geometries.push(octahedron);

            var torusKnot = new THREE.Mesh(
                new THREE.TorusKnotGeometry(4, 1.2, 100, 16),
                wireframeMaterial(0xb45309, 0.08)
            );
            torusKnot.position.set(25, 30, -35);
            torusKnot.userData = {
                rotSpeed: { x: 0.001, y: 0.002, z: 0.001 },
                floatSpeed: 0.0009,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(torusKnot);
            this.geometries.push(torusKnot);

            var ring = new THREE.Mesh(
                new THREE.TorusGeometry(10, 0.4, 8, 50),
                wireframeMaterial(0xf59e0b, 0.09)
            );
            ring.position.set(0, 0, -40);
            ring.userData = {
                rotSpeed: { x: 0.002, y: 0.005, z: 0.001 },
                floatSpeed: 0.0007,
                floatOffset: Math.random() * Math.PI * 2
            };
            this.scene.add(ring);
            this.geometries.push(ring);
        },

        createFloatingShapes: function() {
            if (this.isMobile) return;

            var glowColors = [0xfbbf24, 0xf59e0b, 0xd97706];
            
            for (var i = 0; i < 15; i++) {
                var size = Math.random() * 1.5 + 0.5;
                var geometry = new THREE.SphereGeometry(size, 8, 8);
                var material = new THREE.MeshBasicMaterial({
                    color: glowColors[Math.floor(Math.random() * glowColors.length)],
                    transparent: true,
                    opacity: 0.15 + Math.random() * 0.15
                });

                var shape = new THREE.Mesh(geometry, material);
                shape.position.set(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 80,
                    (Math.random() - 0.5) * 40 - 10
                );
                shape.userData = {
                    pulseSpeed: 0.5 + Math.random() * 1.5,
                    pulseOffset: Math.random() * Math.PI * 2,
                    originalOpacity: material.opacity
                };

                this.scene.add(shape);
                this.geometries.push(shape);
            }
        },

        setupEvents: function() {
            var self = this;

            document.addEventListener('mousemove', function(e) {
                self.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                self.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            });

            window.addEventListener('resize', function() {
                self.onResize();
            });

            document.addEventListener('visibilitychange', function() {
                self.isVisible = !document.hidden;
                if (self.isVisible && !self.animationId) {
                    self.animate();
                }
            });
        },

        onResize: function() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        },

        animate: function() {
            if (!this.isVisible) {
                this.animationId = null;
                return;
            }

            var self = this;
            this.animationId = requestAnimationFrame(function() {
                self.animate();
            });

            var time = this.clock.getElapsedTime();

            this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

            if (this.particles) {
                this.particles.rotation.y += 0.0004;
                this.particles.rotation.x += 0.0002;

                this.particles.position.x = this.mouseX * 4;
                this.particles.position.y = -this.mouseY * 4;

                var positions = this.particles.geometry.attributes.position.array;
                var velocities = this.particles.geometry.attributes.velocity.array;
                for (var i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];

                    if (Math.abs(positions[i]) > 75) velocities[i] *= -1;
                    if (Math.abs(positions[i + 1]) > 75) velocities[i + 1] *= -1;
                    if (Math.abs(positions[i + 2]) > 40) velocities[i + 2] *= -1;
                }
                this.particles.geometry.attributes.position.needsUpdate = true;
            }

            for (var r = 0; r < this.orbitalRings.length; r++) {
                var ring = this.orbitalRings[r];
                var data = ring.userData;

                ring.rotation.x += data.rotationSpeed.x;
                ring.rotation.y += data.rotationSpeed.y;
                ring.rotation.z += data.rotationSpeed.z;

                data.orbitAngle += data.orbitSpeed;
                ring.position.x = data.initialX + Math.cos(data.orbitAngle) * 10;
                ring.position.y = data.initialY + Math.sin(data.orbitAngle) * 8;
            }

            for (var g = 0; g < this.geometries.length; g++) {
                var geo = this.geometries[g];
                
                if (geo.userData.rotSpeed) {
                    geo.rotation.x += geo.userData.rotSpeed.x;
                    geo.rotation.y += geo.userData.rotSpeed.y;
                    geo.rotation.z += geo.userData.rotSpeed.z;
                }

                if (geo.userData.floatSpeed) {
                    geo.position.y += Math.sin(time * 2 + geo.userData.floatOffset) * 0.02;
                }

                if (geo.userData.pulseSpeed) {
                    var pulse = Math.sin(time * geo.userData.pulseSpeed + geo.userData.pulseOffset);
                    geo.material.opacity = geo.userData.originalOpacity * (0.5 + pulse * 0.5);
                }

                geo.position.x += this.mouseX * 0.2;
                geo.position.y -= this.mouseY * 0.2;
            }

            this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.015;
            this.camera.position.y += (-this.mouseY * 2 - this.camera.position.y) * 0.015;
            this.camera.lookAt(this.scene.position);

            this.renderer.render(this.scene, this.camera);
        },

        destroy: function() {
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            if (this.renderer) {
                this.renderer.dispose();
                var canvas = document.getElementById('three-bg-canvas');
                if (canvas) canvas.remove();
            }
        }
    };

    window.Background3D = Background3D;
})();