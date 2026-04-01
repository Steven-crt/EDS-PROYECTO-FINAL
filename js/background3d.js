/**
 * ================================================
 * BACKGROUND3D.JS - EDS Edificaciones Inteligentes
 * Sistema de fondos 3D con Three.js r128
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
        mouseX: 0,
        mouseY: 0,
        targetMouseX: 0,
        targetMouseY: 0,
        animationId: null,
        isMobile: false,
        isVisible: true,

        init: function() {
            if (typeof THREE === 'undefined') {
                console.warn('Three.js not loaded');
                return;
            }

            this.isMobile = window.innerWidth < 768;
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.createParticleLayers();
            this.createGeometries();
            this.setupEvents();
            this.animate();
        },

        setupScene: function() {
            this.scene = new THREE.Scene();
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
            this.renderer.setClearColor(0x000000, 0);

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

        createParticleLayers: function() {
            var particleCount = this.isMobile ? 200 : 600;
            var colors = [
                new THREE.Color(0xf0b429),
                new THREE.Color(0x1565c0),
                new THREE.Color(0xe53935),
                new THREE.Color(0x1e88e5),
                new THREE.Color(0xf5c842)
            ];

            var geometry = new THREE.BufferGeometry();
            var positions = new Float32Array(particleCount * 3);
            var colorArray = new Float32Array(particleCount * 3);
            var sizes = new Float32Array(particleCount);
            var depths = new Float32Array(particleCount);

            for (var i = 0; i < particleCount; i++) {
                var i3 = i * 3;
                var depth = Math.random();

                positions[i3] = (Math.random() - 0.5) * 120;
                positions[i3 + 1] = (Math.random() - 0.5) * 120;
                positions[i3 + 2] = (Math.random() - 0.5) * 60;

                var color = colors[Math.floor(Math.random() * colors.length)];
                colorArray[i3] = color.r;
                colorArray[i3 + 1] = color.g;
                colorArray[i3 + 2] = color.b;

                sizes[i] = Math.random() * 2 + 0.5;
                depths[i] = depth;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('depth', new THREE.BufferAttribute(depths, 1));

            var vertexShader = [
                'attribute float size;',
                'attribute float depth;',
                'varying vec3 vColor;',
                'varying float vDepth;',
                'void main() {',
                '    vColor = color;',
                '    vDepth = depth;',
                '    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
                '    gl_PointSize = size * (200.0 / -mvPosition.z);',
                '    gl_Position = projectionMatrix * mvPosition;',
                '}'
            ].join('\n');

            var fragmentShader = [
                'varying vec3 vColor;',
                'varying float vDepth;',
                'void main() {',
                '    float dist = length(gl_PointCoord - vec2(0.5));',
                '    if (dist > 0.5) discard;',
                '    float alpha = smoothstep(0.5, 0.1, dist) * (0.3 + vDepth * 0.4);',
                '    gl_FragColor = vec4(vColor, alpha);',
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

        createGeometries: function() {
            if (this.isMobile) return;

            function wireframeMaterial(color, opacity) {
                return new THREE.MeshBasicMaterial({
                    color: color,
                    wireframe: true,
                    transparent: true,
                    opacity: opacity
                });
            }

            var torus = new THREE.Mesh(
                new THREE.TorusGeometry(8, 2, 16, 50),
                wireframeMaterial(0xf0b429, 0.06)
            );
            torus.position.set(-25, 15, -20);
            torus.userData = { rotSpeed: { x: 0.002, y: 0.003, z: 0.001 } };
            this.scene.add(torus);
            this.geometries.push(torus);

            var sphere = new THREE.Mesh(
                new THREE.IcosahedronGeometry(6, 1),
                wireframeMaterial(0x1565c0, 0.05)
            );
            sphere.position.set(30, -10, -15);
            sphere.userData = { rotSpeed: { x: 0.001, y: 0.002, z: 0.003 } };
            this.scene.add(sphere);
            this.geometries.push(sphere);

            var torusKnot = new THREE.Mesh(
                new THREE.TorusKnotGeometry(5, 1.5, 80, 16),
                wireframeMaterial(0xe53935, 0.03)
            );
            torusKnot.position.set(20, 25, -30);
            torusKnot.userData = { rotSpeed: { x: 0.001, y: 0.001, z: 0.002 } };
            this.scene.add(torusKnot);
            this.geometries.push(torusKnot);

            var octahedron = new THREE.Mesh(
                new THREE.OctahedronGeometry(4, 0),
                wireframeMaterial(0x1e88e5, 0.05)
            );
            octahedron.position.set(-30, -20, -10);
            octahedron.userData = { rotSpeed: { x: 0.003, y: 0.002, z: 0.001 } };
            this.scene.add(octahedron);
            this.geometries.push(octahedron);

            var ring = new THREE.Mesh(
                new THREE.TorusGeometry(12, 0.5, 8, 60),
                wireframeMaterial(0xf5c842, 0.04)
            );
            ring.position.set(0, 0, -25);
            ring.userData = { rotSpeed: { x: 0.001, y: 0.004, z: 0.001 } };
            this.scene.add(ring);
            this.geometries.push(ring);
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

            this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

            if (this.particles) {
                this.particles.rotation.y += 0.0003;
                this.particles.rotation.x += 0.0001;

                this.particles.position.x = this.mouseX * 3;
                this.particles.position.y = -this.mouseY * 3;

                var positions = this.particles.geometry.attributes.position.array;
                var depths = this.particles.geometry.attributes.depth.array;
                var time = Date.now() * 0.001;
                for (var i = 0; i < positions.length; i += 3) {
                    var depth = depths[i / 3];
                    positions[i + 1] += Math.sin(time + i) * 0.01 * (depth + 0.5);
                }
                this.particles.geometry.attributes.position.needsUpdate = true;
            }

            for (var g = 0; g < this.geometries.length; g++) {
                var geo = this.geometries[g];
                var speed = geo.userData.rotSpeed;
                geo.rotation.x += speed.x;
                geo.rotation.y += speed.y;
                geo.rotation.z += speed.z;

                geo.position.x += this.mouseX * 0.3;
                geo.position.y -= this.mouseY * 0.3;
            }

            this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.02;
            this.camera.position.y += (-this.mouseY * 2 - this.camera.position.y) * 0.02;
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
