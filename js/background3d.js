/**
 * ================================================
 * BACKGROUND3D.JS — EDS Edificaciones Inteligentes
 * Fondo 3D "Blueprint de Construcción" con Three.js
 * Canvas TRANSPARENTE sobre fondo blanco
 * Inspirado en: planos técnicos de ingeniería,
 *   threejs.org/examples (lines, points, geometry)
 * ================================================
 */

(function () {
    'use strict';

    var Background3D = {
        scene: null,
        camera: null,
        renderer: null,
        clock: null,
        isMobile: false,
        isVisible: true,
        animationId: null,

        mouseX: 0,
        mouseY: 0,
        targetMouseX: 0,
        targetMouseY: 0,

        // Grupos de objetos
        gridGroup: null,
        buildingGroup: null,
        particleSystem: null,
        connectionLines: [],
        buildingEdges: [],
        pulseRings: [],
        scanLines: [],

        // Colores EDS — visibles sobre fondo blanco
        C_BLUE:      new THREE.Color(0x1565c0),
        C_BLUE_L:    new THREE.Color(0x1e88e5),
        C_YELLOW:    new THREE.Color(0xf0b429),
        C_CYAN:      new THREE.Color(0x00838f),
        C_BLUE_D:    new THREE.Color(0x0d47a1),

        init: function () {
            if (typeof THREE === 'undefined') return;
            this.isMobile = window.innerWidth < 768;
            this.clock = new THREE.Clock();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();

            // Construir el mundo 3D progresivamente
            this.createBlueprintGrid();
            this.createBuildingWireframes();
            this.createEDSTextAndLogo();
            this.createConstructionParticles();
            this.createPulseRings();
            this.createScanLines();
            if (!this.isMobile) {
                this.createConnectionNetwork();
            }

            this.setupEvents();
            this.animate();
        },

        // ===================================================
        // ESCENA Y CÁMARA
        // ===================================================
        setupScene: function () {
            this.scene = new THREE.Scene();
            // Sin fog — canvas transparente sobre fondo blanco
        },

        setupCamera: function () {
            this.camera = new THREE.PerspectiveCamera(
                65,
                window.innerWidth / window.innerHeight,
                0.1,
                800
            );
            this.camera.position.set(0, 8, 60);
            this.camera.lookAt(0, 0, 0);
        },

        setupRenderer: function () {
            this.renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: !this.isMobile,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            // TRANSPARENTE — fondo blanco de la página visible debajo
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

        // ===================================================
        // GRID BLUEPRINT — cuadrícula técnica animada de plano
        // Inspirado en planos de ingeniería y AutoCAD
        // ===================================================
        createBlueprintGrid: function () {
            this.gridGroup = new THREE.Group();

            var gridMat = new THREE.LineBasicMaterial({
                color: 0x1565c0, // Blueprint corporate blue
                transparent: true,
                opacity: this.isMobile ? 0.12 : 0.22
            });

            var step = 8;
            var extent = 180;

            // Líneas horizontales del grid
            for (var z = -extent; z <= extent; z += step) {
                var pts = [
                    new THREE.Vector3(-extent, -15, z),
                    new THREE.Vector3(extent, -15, z)
                ];
                var geo = new THREE.BufferGeometry().setFromPoints(pts);
                var line = new THREE.Line(geo, gridMat.clone());
                line.userData = { baseOpacity: this.isMobile ? 0.12 : 0.18, phase: Math.random() * Math.PI * 2 };
                this.gridGroup.add(line);
            }

            // Líneas verticales del grid
            for (var x = -extent; x <= extent; x += step) {
                var pts2 = [
                    new THREE.Vector3(x, -15, -extent),
                    new THREE.Vector3(x, -15, extent)
                ];
                var geo2 = new THREE.BufferGeometry().setFromPoints(pts2);
                var line2 = new THREE.Line(geo2, gridMat.clone());
                line2.userData = { baseOpacity: this.isMobile ? 0.12 : 0.18, phase: Math.random() * Math.PI * 2 };
                this.gridGroup.add(line2);
            }

            // Líneas de perspectiva (convergen hacia el horizonte)
            var perspMat = new THREE.LineBasicMaterial({
                color: 0x1565c0, // Corporate blue perspective
                transparent: true,
                opacity: 0.16
            });

            var origins = [
                [-120, -15, -120], [120, -15, -120],
                [-120, -15, 120],  [120, -15, 120]
            ];
            var vanish = [0, -15, 0];

            origins.forEach(function (o) {
                var pts3 = [
                    new THREE.Vector3(o[0], o[1], o[2]),
                    new THREE.Vector3(vanish[0], vanish[1], vanish[2])
                ];
                var geo3 = new THREE.BufferGeometry().setFromPoints(pts3);
                var pLine = new THREE.Line(geo3, perspMat.clone());
                pLine.userData = { baseOpacity: 0.14, phase: Math.random() * Math.PI * 2 };
                this.gridGroup.add(pLine);
            }, this);

            this.scene.add(this.gridGroup);
        },

        // ===================================================
        // BUILDING WIREFRAMES — edificios 3D en wireframe
        // Animación de "construcción" progresiva (autodibujo)
        // ===================================================
        createBuildingWireframes: function () {
            this.buildingGroup = new THREE.Group();
            var self = this;

            // Definir edificios expansivos con colores de Blueprint (Azul Empresa)
            var buildings = [
                { x: -75, z: -45, w: 8,  h: 18, d: 8,  color: 0x1565c0, delay: 0.0,  opacity: 0.28 },
                { x:  68, z: -50, w: 10, h: 28, d: 10, color: 0x0d47a1, delay: 0.4,  opacity: 0.24 },
                { x: -48, z: -70, w: 6,  h: 12, d: 6,  color: 0x1e88e5, delay: 0.8,  opacity: 0.22 },
                { x:  42, z: -65, w: 7,  h: 22, d: 7,  color: 0x1565c0, delay: 1.2,  opacity: 0.26 },
                { x: -95, z: -40, w: 9,  h: 14, d: 9,  color: 0x00838f, delay: 1.6,  opacity: 0.20 },
                { x:  95, z: -43, w: 8,  h: 16, d: 8,  color: 0xf0b429, delay: 0.3,  opacity: 0.22 },
                { x:   0, z: -90, w: 14, h: 32, d: 14, color: 0x1565c0, delay: 0.7,  opacity: 0.25 }
            ];

            buildings.forEach(function (b) {
                var geo = new THREE.BoxGeometry(b.w, b.h, b.d);
                var edges = new THREE.EdgesGeometry(geo);
                var mat = new THREE.LineBasicMaterial({
                    color: b.color,
                    transparent: true,
                    opacity: 0.0   // Empieza invisible, se construye animando
                });
                var mesh = new THREE.LineSegments(edges, mat);
                mesh.position.set(b.x, b.h / 2 - 15, b.z);
                mesh.userData = {
                    targetOpacity: b.opacity,
                    buildDelay: b.delay,
                    buildDuration: 1.8,
                    built: false,
                    rotSpeed: (Math.random() - 0.5) * 0.0015,
                    floatAmp: 0.02 + Math.random() * 0.03,
                    floatPhase: Math.random() * Math.PI * 2,
                    initY: b.h / 2 - 15
                };
                self.buildingGroup.add(mesh);
                self.buildingEdges.push(mesh);
            });

            this.scene.add(this.buildingGroup);
        },

        // ===================================================
        // TEXTO EDS Y LOGO
        // Creados como wireframes que se animan con la misma lógica
        // ===================================================
        createEDSTextAndLogo: function () {
            this.edsGroup = new THREE.Group();
            var self = this;

            var edsBlocks = [];
            
            // Función para crear bloques de un tamaño y posición
            function addBlock(bx, by, bz, bw, bh, bd, delay, color) {
                edsBlocks.push({ x: bx, y: by, z: bz, w: bw, h: bh, d: bd, delay: delay, color: color });
            }

            // Ubicamos el texto centrado para "EDS" solamente
            var startX = -12;
            var zPos = -12; // Al frente de los edificios
            var cBlue = 0x00ffff;   // Neon Cyan
            var cYellow = 0xffff00; // Neon Yellow

            // --- LETRA E ---
            addBlock(startX, -10, zPos, 1.5, 10, 1.5, 1.0, cBlue);       // barra vertical
            addBlock(startX+2.5, -5.75, zPos, 4, 1.5, 1.5, 1.2, cBlue);  // top
            addBlock(startX+2.0, -10, zPos, 3, 1.5, 1.5, 1.3, cBlue);    // centro
            addBlock(startX+2.5, -14.25, zPos, 4, 1.5, 1.5, 1.1, cBlue); // bottom

            // --- LETRA D ---
            var dx = startX + 7;
            addBlock(dx, -10, zPos, 1.5, 10, 1.5, 1.4, cBlue);         // barra vertical
            addBlock(dx+2, -5.75, zPos, 3, 1.5, 1.5, 1.5, cBlue);      // top
            addBlock(dx+2, -14.25, zPos, 3, 1.5, 1.5, 1.4, cBlue);     // bottom
            addBlock(dx+3.5, -10, zPos, 1.5, 7, 1.5, 1.6, cBlue);      // curva derecha (barra vert)

            // --- LETRA S ---
            var sx = dx + 7;
            addBlock(sx+2, -5.75, zPos, 4, 1.5, 1.5, 1.7, cBlue);      // top
            addBlock(sx+0.5, -8, zPos, 1.5, 4, 1.5, 1.8, cBlue);       // upper left vert
            addBlock(sx+2, -10, zPos, 4, 1.5, 1.5, 1.9, cBlue);        // mid
            addBlock(sx+3.5, -12, zPos, 1.5, 4, 1.5, 2.0, cBlue);      // lower right vert
            addBlock(sx+2, -14.25, zPos, 4, 1.5, 1.5, 1.8, cBlue);     // bottom

            edsBlocks.forEach(function (b) {
                var geo = new THREE.BoxGeometry(b.w, b.h, b.d);
                var edges = new THREE.EdgesGeometry(geo);
                var mat = new THREE.LineBasicMaterial({
                    color: b.color,
                    transparent: true,
                    opacity: 0.0 // empieza invisible
                });
                var mesh = new THREE.LineSegments(edges, mat);
                // Posicionar relativo al grupo (o al mundo, ya que el grupo está en el centro)
                mesh.position.set(b.x, b.y, b.z);
                
                mesh.userData = {
                    targetOpacity: 0.45, // bien visible
                    buildDelay: b.delay,
                    buildDuration: 2.0,
                    built: false,
                    rotSpeed: 0, // Las letras no giran individualmente para no desarmar el texto
                    floatAmp: 0.015,
                    floatPhase: Math.random() * Math.PI * 2,
                    initY: b.y
                };
                self.edsGroup.add(mesh);
                // Lo agregamos a buildingEdges para animación unificada
                self.buildingEdges.push(mesh);
            });

            // Le damos una leve inclinación inicial para mayor profundidad
            this.edsGroup.rotation.y = -0.05;
            this.scene.add(this.edsGroup);
        },

        // ===================================================
        // PARTÍCULAS DE CONSTRUCCIÓN
        // Partículas que viajan a lo largo de rutas
        // ===================================================
        createConstructionParticles: function () {
            var count = this.isMobile ? 60 : 160;
            var geo = new THREE.BufferGeometry();
            var positions = new Float32Array(count * 3);
            var colors    = new Float32Array(count * 3);
            var sizes     = new Float32Array(count);
            var speeds    = new Float32Array(count * 3);

            var palColors = [this.C_BLUE, this.C_BLUE_L, this.C_YELLOW, this.C_CYAN, this.C_BLUE_D];

            for (var i = 0; i < count; i++) {
                var i3 = i * 3;
                positions[i3]     = (Math.random() - 0.5) * 120;
                positions[i3 + 1] = (Math.random() - 0.5) * 40;
                positions[i3 + 2] = (Math.random() - 0.5) * 60 - 10;

                speeds[i3]     = (Math.random() - 0.5) * 0.08;
                speeds[i3 + 1] = (Math.random() - 0.5) * 0.05;
                speeds[i3 + 2] = (Math.random() - 0.5) * 0.05;

                var c = palColors[Math.floor(Math.random() * palColors.length)];
                colors[i3] = c.r; colors[i3+1] = c.g; colors[i3+2] = c.b;
                sizes[i] = Math.random() * 4.0 + 1.2;
            }

            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
            geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
            geo.setAttribute('velocity', new THREE.BufferAttribute(speeds, 3));

            var vShader = [
                'attribute float size;',
                'attribute vec3 velocity;',
                'varying vec3 vColor;',
                'void main() {',
                '  vColor = color;',
                '  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);',
                '  gl_PointSize = size * (220.0 / -mvPos.z);',
                '  gl_Position = projectionMatrix * mvPos;',
                '}'
            ].join('\n');

            var fShader = [
                'varying vec3 vColor;',
                'void main() {',
                '  float d = length(gl_PointCoord - vec2(0.5));',
                '  if (d > 0.5) discard;',
                '  float a = smoothstep(0.5, 0.0, d) * 0.75;',
                '  gl_FragColor = vec4(vColor, a);',
                '}'
            ].join('\n');

            var mat = new THREE.ShaderMaterial({
                vertexShader: vShader,
                fragmentShader: fShader,
                vertexColors: true,
                transparent: true,
                depthWrite: false
            });

            this.particleSystem = new THREE.Points(geo, mat);
            this.scene.add(this.particleSystem);
        },

        // ===================================================
        // PULSE RINGS — marcos circulares que pulsan
        // Efecto de señal de radar / detección de terreno
        // ===================================================
        createPulseRings: function () {
            if (this.isMobile) return;
            var positions = [
                { x: -35, z: -20, color: 0x1565c0 },
                { x:  28, z: -25, color: 0xf0b429 },
                { x:   0, z: -45, color: 0x1565c0 }
            ];

            positions.forEach(function (p) {
                var mat = new THREE.MeshBasicMaterial({
                    color: p.color,
                    transparent: true,
                    opacity: 0.0,
                    side: THREE.DoubleSide,
                    wireframe: false
                });
                var ring = new THREE.Mesh(
                    new THREE.RingGeometry(0.5, 1.2, 32),
                    mat
                );
                ring.position.set(p.x, -14.8, p.z);
                ring.rotation.x = -Math.PI / 2;
                ring.userData = {
                    phase: Math.random() * Math.PI * 2,
                    speed: 1.5 + Math.random() * 0.8,
                    maxR: 18 + Math.random() * 8
                };
                this.pulseRings.push(ring);
                this.scene.add(ring);
            }, this);
        },

        // ===================================================
        // SCAN LINES — líneas de escaneo horizontales
        // Efecto de lectura láser / medición
        // ===================================================
        createScanLines: function () {
            if (this.isMobile) return;

            for (var s = 0; s < 2; s++) {
                var mat = new THREE.LineBasicMaterial({
                    color: s === 0 ? 0x1565c0 : 0xf0b429,
                    transparent: true,
                    opacity: 0.0
                });
                var pts = [
                    new THREE.Vector3(-80, 0, 0),
                    new THREE.Vector3(80,  0, 0)
                ];
                var geo = new THREE.BufferGeometry().setFromPoints(pts);
                var line = new THREE.Line(geo, mat);
                line.userData = {
                    phase: s * Math.PI,
                    speed: 1.2 + s * 0.5,
                    yMin: -16,
                    yMax:  30
                };
                this.scanLines.push(line);
                this.scene.add(line);
            }
        },

        // ===================================================
        // CONNECTION NETWORK — red de nodos conectados
        // Representa la infraestructura de red EDS
        // ===================================================
        createConnectionNetwork: function () {
            var nodeCount = 30;
            var spread = 100;
            var nodePositions = [];

            for (var i = 0; i < nodeCount; i++) {
                nodePositions.push({
                    x: (Math.random() - 0.5) * spread,
                    y: (Math.random() - 0.5) * 30,
                    z: (Math.random() - 0.5) * 50 - 10
                });
            }

            var linePts = [];
            var lineColors = [];

            for (var a = 0; a < nodeCount; a++) {
                for (var b = a + 1; b < nodeCount; b++) {
                    var dx = nodePositions[a].x - nodePositions[b].x;
                    var dy = nodePositions[a].y - nodePositions[b].y;
                    var dz = nodePositions[a].z - nodePositions[b].z;
                    var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                    if (dist < 28) {
                        linePts.push(
                            nodePositions[a].x, nodePositions[a].y, nodePositions[a].z,
                            nodePositions[b].x, nodePositions[b].y, nodePositions[b].z
                        );
                        var t = dist / 28; // 0 = cerca (azul), 1 = lejos (amarillo)
                        if ((a + b) % 3 === 0) {
                            lineColors.push(0.09, 0.51, 0.56, 0.09, 0.51, 0.56); // cian
                        } else {
                            lineColors.push(0.082, 0.396, 0.753, 0.082, 0.396, 0.753); // azul
                        }
                    }
                }
            }

            if (linePts.length === 0) return;

            var lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePts), 3));
            lineGeo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(lineColors), 3));

            var netMat = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.18,
                depthWrite: false
            });

            var netLines = new THREE.LineSegments(lineGeo, netMat);
            netLines.userData = { type: 'network', initOpacity: 0.18 };
            this.scene.add(netLines);
            this.connectionLines.push(netLines);
        },

        // ===================================================
        // EVENTOS
        // ===================================================
        setupEvents: function () {
            var self = this;
            document.addEventListener('mousemove', function (e) {
                self.targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
                self.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            });
            window.addEventListener('resize', function () { self.onResize(); });
            document.addEventListener('visibilitychange', function () {
                self.isVisible = !document.hidden;
                if (self.isVisible && !self.animationId) self.animate();
            });
        },

        onResize: function () {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        },

        // ===================================================
        // LOOP DE ANIMACIÓN
        // ===================================================
        animate: function () {
            if (!this.isVisible) { this.animationId = null; return; }
            var self = this;
            this.animationId = requestAnimationFrame(function () { self.animate(); });

            var time = this.clock.getElapsedTime();
            var delta = this.clock.getDelta ? 0.016 : 0.016;

            // Suavizar mouse
            this.mouseX += (this.targetMouseX - this.mouseX) * 0.03;
            this.mouseY += (this.targetMouseY - this.mouseY) * 0.03;

            // ---- Grid: pulso de opacidad (como plano que "respira") ----
            if (this.gridGroup) {
                this.gridGroup.children.forEach(function (line) {
                    var ud = line.userData;
                    var pulse = Math.sin(time * 0.4 + ud.phase) * 0.5 + 0.5;
                    line.material.opacity = ud.baseOpacity * (0.6 + pulse * 0.4);
                });
                // Leve rotación del grid completo con el mouse
                this.gridGroup.rotation.y = this.mouseX * 0.04;
                this.gridGroup.rotation.x = this.mouseY * 0.02;
            }

            // ---- Edificios: animación de construcción progresiva ----
            this.buildingEdges.forEach(function (b) {
                var ud = b.userData;
                // Esperar el delay antes de empezar a construir
                var adjustedTime = time - ud.buildDelay;
                if (adjustedTime > 0) {
                    var progress = Math.min(adjustedTime / ud.buildDuration, 1.0);
                    // Ease in-out cúbico
                    var eased = progress < 0.5
                        ? 4 * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    b.material.opacity = eased * ud.targetOpacity;

                    // Escalar de abajo hacia arriba mientras se construye
                    if (!ud.built) {
                        b.scale.y = 0.3 + eased * 0.7;
                        b.position.y = ud.initY - (1 - eased) * 5;
                        if (progress >= 1.0) ud.built = true;
                    }
                }

                // Rotación orbital muy lenta + flotación
                b.rotation.y += ud.rotSpeed;
                b.position.y += Math.sin(time * 1.2 + ud.floatPhase) * ud.floatAmp;

                // Parpadeo periódico (escáner pasando)
                var flicker = Math.sin(time * 3.0 + ud.floatPhase * 2) * 0.5 + 0.5;
                b.material.opacity *= (0.85 + flicker * 0.15);
            });

            // ---- Partículas: movimiento suave ----
            if (this.particleSystem) {
                var pos = this.particleSystem.geometry.attributes.position.array;
                var vel = this.particleSystem.geometry.attributes.velocity.array;
                var count = pos.length / 3;

                for (var i = 0; i < count; i++) {
                    var i3 = i * 3;
                    pos[i3]     += vel[i3];
                    pos[i3 + 1] += vel[i3 + 1];
                    pos[i3 + 2] += vel[i3 + 2];

                    // Rebotar en límites
                    if (Math.abs(pos[i3])     > 60) vel[i3]     *= -1;
                    if (Math.abs(pos[i3 + 1]) > 22) vel[i3 + 1] *= -1;
                    if (Math.abs(pos[i3 + 2]) > 32) vel[i3 + 2] *= -1;
                }
                this.particleSystem.geometry.attributes.position.needsUpdate = true;
                this.particleSystem.position.x = this.mouseX * 2;
                this.particleSystem.position.y = -this.mouseY * 2;
            }

            // ---- Pulse Rings: radar de construcción ----
            this.pulseRings.forEach(function (ring) {
                var ud = ring.userData;
                var phase = (time * ud.speed + ud.phase) % (Math.PI * 2);
                var t = phase / (Math.PI * 2); // 0 → 1

                // Expandir radio del ring
                var scale = 1 + t * ud.maxR;
                ring.scale.set(scale, scale, scale);
                ring.material.opacity = (1 - t) * 0.25;
            });

            // ---- Scan Lines: líneas de escaneo (travesía) ----
            this.scanLines.forEach(function (line) {
                var ud = line.userData;
                var t = (Math.sin(time * ud.speed + ud.phase) * 0.5 + 0.5);
                var y = ud.yMin + t * (ud.yMax - ud.yMin);
                line.position.y = y;
                // Pulsar opacidad — más visible en el medio del recorrido
                var midFade = Math.sin(Math.PI * t) * 0.35;
                line.material.opacity = midFade;
            });

            // ---- Redes: pulso de opacidad ----
            this.connectionLines.forEach(function (net) {
                var pulse = Math.sin(time * 0.5) * 0.5 + 0.5;
                net.material.opacity = net.userData.initOpacity * (0.6 + pulse * 0.4);
            });

            // ---- Parallax y flotación de Grupo EDS ----
            if (this.edsGroup) {
                this.edsGroup.position.y = Math.sin(time * 1.5) * 1.5;
                this.edsGroup.rotation.y = -0.05 + this.mouseX * 0.15;
                this.edsGroup.rotation.x = this.mouseY * 0.08;
            }

            // ---- Parallax de cámara con mouse ----
            this.camera.position.x += (this.mouseX * 6 - this.camera.position.x) * 0.02;
            this.camera.position.y += (-this.mouseY * 5 + 8 - this.camera.position.y) * 0.02;
            this.camera.lookAt(0, 0, 0);

            this.renderer.render(this.scene, this.camera);
        },

        destroy: function () {
            if (this.animationId) cancelAnimationFrame(this.animationId);
            if (this.renderer) {
                this.renderer.dispose();
                var canvas = document.getElementById('three-bg-canvas');
                if (canvas) canvas.remove();
            }
        }
    };

    window.Background3D = Background3D;
})();