/**
 * BACKGROUND3D.JS — Fondo 3D con Three.js
 * Blueprint de Construcción estilo EDS
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

        // Grupos de objetos 3D
        gridGroup: null,
        buildingGroup: null,
        cranesGroup: null,
        particleSystem: null,
        connectionLines: [],
        buildingEdges: [],
        pulseRings: [],
        scanLines: [],
        cranes: [],
        floatingCubes: [],
        lightPoints: [],

        // Colores corporativos EDS
        C_WHITE:     new THREE.Color(0xffffff),
        C_BLUE:      new THREE.Color(0x29b6f6),
        C_BLUE_LIGHT: new THREE.Color(0x81d4fa),
        C_BLUE_DARK: new THREE.Color(0x0277bd),
        C_YELLOW:    new THREE.Color(0xffc107),
        C_YELLOW_LIGHT: new THREE.Color(0xffd54f),
        C_CYAN:      new THREE.Color(0x26c6da),

        viewportWidth: 0,
        viewportHeight: 0,

        init: function () {
            if (typeof THREE === 'undefined') return;
            this.isMobile = window.innerWidth < 768;
            this.viewportWidth = window.innerWidth;
            this.viewportHeight = window.innerHeight;
            this.clock = new THREE.Clock();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();

            // Construcción de la escena 3D
            this.createBlueprintGrid();          // Cuadrícula de construcción
            this.createBuildingWireframes();     // Edificios wireframe
            this.createFloatingCubes();          // Cubos flotantes animados
            this.createLightPoints();            // Puntos de luz distribuidos
            this.createEDSTextBackground();      // Texto EDS de fondo
            this.createCranesAndRails();         // Grúas de construcción
            this.createEDSTextAndLogo();         // Logo y texto EDS
            this.createConstructionParticles();   // Partículas de construcción
            this.createPulseRings();             // Anillos de pulso
            this.createScanLines();              // Líneas de escaneo
            if (!this.isMobile) {
                this.createConnectionNetwork();  // Red de conexiones (no móvil)
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
            // CORRECCIÓN: Usar dimensiones completas del viewport
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            // TRANSPARENTE — fondo blanco de la página visible debajo
            this.renderer.setClearColor(0x000000, 0);

            var canvas = this.renderer.domElement;
            canvas.id = 'three-bg-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100vw';  // Ancho completo del viewport
            canvas.style.height = '100vh'; // Alto completo del viewport
            canvas.style.zIndex = '-2';
            canvas.style.pointerEvents = 'none';
            document.body.insertBefore(canvas, document.body.firstChild);
        },

// ===================================================
        // GRID BLUEPRINT — cuadrícula del piso
        // Mas completa como antes, con movimiento parallax
        // ===================================================
        createBlueprintGrid: function () {
            this.gridGroup = new THREE.Group();

            var gridMat = new THREE.LineBasicMaterial({
                color: 0x29b6f6,  // Azul vibrante
                transparent: true,
                opacity: 0.18
            });

            // Líneas horizontales - más densidad como antes
            var step = 10;
            var extent = 160;

            for (var z = -extent; z <= extent; z += step) {
                var pts = [
                    new THREE.Vector3(-extent, -15, z),
                    new THREE.Vector3(extent, -15, z)
                ];
                var geo = new THREE.BufferGeometry().setFromPoints(pts);
                var line = new THREE.Line(geo, gridMat.clone());
                line.userData = { 
                    baseOpacity: 0.10 + Math.random() * 0.08, 
                    phase: Math.random() * Math.PI * 2
                };
                this.gridGroup.add(line);
            }

            // Líneas verticales del piso
            for (var x = -extent; x <= extent; x += step) {
                var pts2 = [
                    new THREE.Vector3(x, -15, -extent),
                    new THREE.Vector3(x, -15, extent)
                ];
                var geo2 = new THREE.BufferGeometry().setFromPoints(pts2);
                var line2 = new THREE.Line(geo2, gridMat.clone());
                line2.userData = { 
                    baseOpacity: 0.10 + Math.random() * 0.08, 
                    phase: Math.random() * Math.PI * 2
                };
                this.gridGroup.add(line2);
            }

            // Líneas de perspectiva
            var perspMat = new THREE.LineBasicMaterial({
                color: 0x29b6f6,
                transparent: true,
                opacity: 0.14
            });

            var origins = [
                [-140, -15, -140], [140, -15, -140],
                [-140, -15, 140],  [140, -15, 140]
            ];
            var vanish = [0, -15, 0];

            origins.forEach(function (o) {
                var pts3 = [
                    new THREE.Vector3(o[0], o[1], o[2]),
                    new THREE.Vector3(vanish[0], vanish[1], vanish[2])
                ];
                var geo3 = new THREE.BufferGeometry().setFromPoints(pts3);
                var pLine = new THREE.Line(geo3, perspMat.clone());
                pLine.userData = { baseOpacity: 0.10, phase: Math.random() * Math.PI * 2 };
                this.gridGroup.add(pLine);
            }, this);

            this.scene.add(this.gridGroup);
        },

        // ===================================================
        // BUILDING WIREFRAMES — edificios 3D en wireframe
        // Ahora distribuidos por toda la pantalla (izquierda y derecha)
        // ===================================================
        createBuildingWireframes: function () {
            this.buildingGroup = new THREE.Group();
            var self = this;

            // DEFINICIÓN: Edificios distribuidos en toda la pantalla
            // Desde x: -100 (izquierda) hasta x: +100 (derecha)
            var buildings = [
                // Lado izquierdo
                { x: -100, z: -45, w: 8,  h: 18, d: 8,  color: 0x4fc3f7, delay: 0.0,  opacity: 0.28 },
                { x: -75,  z: -70, w: 6,  h: 12, d: 6,  color: 0x1a237e, delay: 0.8,  opacity: 0.22 },
                { x: -95,  z: -40, w: 9,  h: 14, d: 9,  color: 0xffd54f, delay: 1.6,  opacity: 0.20 },
                // Centro
                { x: -30,  z: -80, w: 7,  h: 20, d: 7,  color: 0x4fc3f7, delay: 0.3,  opacity: 0.25 },
                { x:   0,  z: -90, w: 14, h: 32, d: 14, color: 0x4fc3f7, delay: 0.7,  opacity: 0.25 },
                { x:  30,  z: -75, w: 8,  h: 24, d: 8,  color: 0x1a237e, delay: 1.1,  opacity: 0.24 },
                // Lado derecho
                { x:  68,  z: -50, w: 10, h: 28, d: 10, color: 0x1a237e, delay: 0.4,  opacity: 0.24 },
                { x:  85,  z: -65, w: 7,  h: 22, d: 7,  color: 0x4fc3f7, delay: 1.2,  opacity: 0.26 },
                { x:  100, z: -43, w: 8,  h: 16, d: 8,  color: 0xffd54f, delay: 0.3,  opacity: 0.22 }
            ];

            buildings.forEach(function (b) {
                var geo = new THREE.BoxGeometry(b.w, b.h, b.d);
                var edges = new THREE.EdgesGeometry(geo);
                var mat = new THREE.LineBasicMaterial({
                    color: b.color,
                    transparent: true,
                    opacity: 0.0   // Empieza invisible
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
                    initY: b.h / 2 - 15,
                    rotSpeedX: (Math.random() - 0.5) * 0.0008,
                    rotSpeedZ: (Math.random() - 0.5) * 0.0006,
                    lateralAmpX: 0.15 + Math.random() * 0.25,
                    lateralAmpZ: 0.1 + Math.random() * 0.2,
                    lateralPhaseX: Math.random() * Math.PI * 2,
                    lateralPhaseZ: Math.random() * Math.PI * 2,
                    floatSpeed: 0.8 + Math.random() * 0.8,
                    lateralSpeedX: 0.6 + Math.random() * 0.6,
                    lateralSpeedZ: 0.7 + Math.random() * 0.7,
                    initX: b.x,
                    initZ: b.z
                };
                self.buildingGroup.add(mesh);
                self.buildingEdges.push(mesh);
            });

            this.scene.add(this.buildingGroup);
        },

        // ===================================================
        // FLOATING CUBES — Cubos wireframe distribuidos en TODA la pantalla
        // Movimiento individual con 3 comportamientos mezclados
        // Profundidad: lejanos = lentos, cercanos = rápidos
        // ===================================================
        createFloatingCubes: function () {
            this.floatingCubes = [];
            var self = this;

            // Cantidad de cubos flotantes - menos para que no sature
            var cubeCount = this.isMobile ? 5 : 10;

            for (var i = 0; i < cubeCount; i++) {
                // Distribuir por toda la pantalla: X de -100 a +100
                var posX = (Math.random() - 0.5) * 200;
                var posY = (Math.random() - 0.5) * 40 + 5;
                var posZ = (Math.random() - 0.5) * 50 - 25;

                // Tamaño basado en profundidad
                var depthFactor = (posZ + 30) / 50;
                var sizeBase = 2 + Math.random() * 2.5;
                var size = sizeBase * (0.6 + depthFactor * 0.4);

                // Color: azul vibrante, dorado o cian
                var colorRand = Math.random();
                var edgeColor = colorRand > 0.6 ? 0x29b6f6 : (colorRand > 0.3 ? 0xffc107 : 0x26c6da);

                var geo = new THREE.BoxGeometry(size, size, size);
                var edges = new THREE.EdgesGeometry(geo);
                var mat = new THREE.LineBasicMaterial({
                    color: edgeColor,
                    transparent: true,
                    opacity: 0.45 + Math.random() * 0.25
                });
                var cube = new THREE.LineSegments(edges, mat);
                cube.position.set(posX, posY, posZ);

                var speedFactor = 0.5 + depthFactor * 0.5;

                cube.userData = {
                    baseY: posY,
                    floatOffset: Math.random() * Math.PI * 2,
                    floatAmp: 15 + Math.random() * 20,
                    floatSpeed: (0.5 + Math.random() * 0.4) * speedFactor,

                    baseX: posX,
                    lateralOffset: Math.random() * Math.PI * 2,
                    lateralAmp: 12 + Math.random() * 18,
                    lateralSpeed: (0.3 + Math.random() * 0.3) * speedFactor,

                    rotSpeedX: (Math.random() - 0.5) * 0.006 * speedFactor,
                    rotSpeedY: (Math.random() - 0.5) * 0.01 * speedFactor,

                    minX: -110,
                    maxX: 110,
                    originalSize: size
                };

                self.floatingCubes.push(cube);
                self.scene.add(cube);
            }
        },

        // ===================================================
        // LIGHT POINTS — Puntos de luz sutiles
        // ===================================================
        createLightPoints: function () {
            this.lightPoints = [];
            var pointCount = this.isMobile ? 15 : 30;
            var spread = 150;

            for (var i = 0; i < pointCount; i++) {
                var x = (Math.random() - 0.5) * spread;
                var y = (Math.random() - 0.5) * 40;
                var z = (Math.random() - 0.5) * 60 - 15;

                var geo = new THREE.SphereGeometry(0.25, 8, 8);
                // Colores más vibrantes: azul, dorado, cian
                var colorRand = Math.random();
                var color = colorRand > 0.5 ? 0x29b6f6 : (colorRand > 0.25 ? 0xffc107 : 0x26c6da);
                var mat = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.6 + Math.random() * 0.35
                });
                var point = new THREE.Mesh(geo, mat);
                point.position.set(x, y, z);

                point.userData = {
                    baseOpacity: 0.5 + Math.random() * 0.4,
                    blinkSpeed: 1.5 + Math.random() * 2.5,
                    blinkPhase: Math.random() * Math.PI * 2,
                    moveSpeed: (Math.random() - 0.5) * 0.02,
                    moveSpeedY: (Math.random() - 0.5) * 0.015
                };

                this.lightPoints.push(point);
                this.scene.add(point);
            }
        },

        // ===================================================
        // EDS TEXT BACKGROUND — Texto gigante semitransparente de fondo
        // z-index muy bajo, detrás de todo, puramente decorativo
        // ===================================================
        createEDSTextBackground: function () {
            // Crear elemento DOM para texto EDS de fondo
            var edsBg = document.createElement('div');
            edsBg.id = 'eds-background-text';
            edsBg.textContent = 'EDS';
            
            // Estilos en línea para el texto de fondo
            Object.assign(edsBg.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '35vw',
                fontWeight: 'bold',
                color: '#1a237e',
                opacity: '0.05',
                margin: 0,
                padding: 0,
                pointerEvents: 'none',
                zIndex: '-3',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
                userSelect: 'none'
            });

            document.body.insertBefore(edsBg, document.body.firstChild);

            // Guardar referencia para animación
            this.edsBackgroundElement = edsBg;
        },

        // ===================================================
        // CRANES AND RAILS SYSTEM — Option B
        // Grúas que transportan cubos con movimiento pendular
        // ===================================================
        createCranesAndRails: function () {
            this.cranesGroup = new THREE.Group();
            var self = this;

            // Grúas distribuidas a lo largo de toda la pantalla
            var craneConfigs = [
                { x: -120, z: -20, speed: 0.3, phase: 0, color: 0x4fc3f7 },
                { x:    0, z: -50, speed: 0.25, phase: Math.PI * 0.5, color: 0xffd54f },
                { x:  120, z: -30, speed: 0.35, phase: Math.PI, color: 0x4fc3f7 }
            ];

            craneConfigs.forEach(function (config, index) {
                var crane = self.createSingleCrane(config.x, config.z, config.speed, config.phase, config.color);

                if (index < self.buildingEdges.length) {
                    var cube = self.buildingEdges[index];
                    cube.userData.isOnCrane = true;
                    cube.userData.craneIndex = index;
                    cube.userData.swingPhase = Math.random() * Math.PI * 2;
                    cube.userData.swingAmp = 0.8 + Math.random() * 0.4;
                    cube.userData.cableLength = 12 + Math.random() * 8;
                    crane.cube = cube;
                }

                self.cranes.push(crane);
                self.cranesGroup.add(crane.group);
            });

            this.scene.add(this.cranesGroup);
        },

        createSingleCrane: function (startX, z, speed, phase, color) {
            var crane = { group: new THREE.Group(), speed: speed, phase: phase, startX: startX, z: z };

            // Crear riel horizontal (estructura superior)
            var railMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4
            });
            var railPts = [
                new THREE.Vector3(startX - 40, 25, z),
                new THREE.Vector3(startX + 120, 25, z)
            ];
            var railGeo = new THREE.BufferGeometry().setFromPoints(railPts);
            var rail = new THREE.Line(railGeo, railMat);
            crane.group.add(rail);

            // Crear brazo de la grúa (carro móvil)
            var armMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.6
            });
            var armPts = [
                new THREE.Vector3(0, 25, z),
                new THREE.Vector3(0, 15, z)
            ];
            var armGeo = new THREE.BufferGeometry().setFromPoints(armPts);
            var arm = new THREE.Line(armGeo, armMat);
            crane.arm = arm;
            crane.group.add(arm);

            // Crear cable (línea desde brazo hasta cubo)
            var cableMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.3
            });
            var cablePts = [
                new THREE.Vector3(0, 15, z),
                new THREE.Vector3(0, -10, z) // Se actualizará dinámicamente
            ];
            var cableGeo = new THREE.BufferGeometry().setFromPoints(cablePts);
            var cable = new THREE.Line(cableGeo, cableMat);
            crane.cable = cable;
            crane.group.add(cable);

            // Crear gancho simple (punto en el extremo del cable)
            var hookGeo = new THREE.SphereGeometry(0.3, 8, 8);
            var hookMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.7
            });
            var hook = new THREE.Mesh(hookGeo, hookMat);
            crane.hook = hook;
            crane.group.add(hook);

            return crane;
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
            var count = this.isMobile ? 30 : 60;
            var geo = new THREE.BufferGeometry();
            var positions = new Float32Array(count * 3);
            var colors    = new Float32Array(count * 3);
            var sizes     = new Float32Array(count);
            var speeds    = new Float32Array(count * 3);

            // Paleta de colores vibrantes
            var palColors = [this.C_BLUE, this.C_BLUE_LIGHT, this.C_YELLOW, this.C_CYAN, this.C_WHITE];

            for (var i = 0; i < count; i++) {
                var i3 = i * 3;
                // Distribuir por toda la pantalla: X de -120 a +120
                positions[i3]     = (Math.random() - 0.5) * 240;
                positions[i3 + 1] = (Math.random() - 0.5) * 50;
                positions[i3 + 2] = (Math.random() - 0.5) * 80 - 20;

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
            this.viewportWidth = window.innerWidth;
            this.viewportHeight = window.innerHeight;
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
                // Movimiento parallax del piso con el mouse
                this.gridGroup.rotation.y = this.mouseX * 0.08;
                this.gridGroup.rotation.x = this.mouseY * 0.04;
            }

            // ---- Edificios: animación de construcción progresiva ----
            this.buildingEdges.forEach(function (b, index) {
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

                // Check if this cube is attached to a crane
                if (ud.isOnCrane && this.cranes[ud.craneIndex]) {
                    var crane = this.cranes[ud.craneIndex];

                    // Crane-attached cubes: pendulum swinging motion
                    var craneX = crane.arm.position.x;
                    var baseSwing = Math.sin(time * crane.speed * 2 + ud.swingPhase) * ud.swingAmp;

                    // Add inertia effect (lag behind crane movement)
                    var inertiaFactor = 0.3;
                    ud.lastCraneX = ud.lastCraneX || craneX;
                    var craneDelta = craneX - ud.lastCraneX;
                    ud.swingMomentum = (ud.swingMomentum || 0) * 0.95 + craneDelta * inertiaFactor;
                    ud.lastCraneX = craneX;

                    // Calculate swinging position
                    var swingOffset = baseSwing + ud.swingMomentum;
                    b.position.x = craneX + swingOffset;
                    b.position.z = crane.z + Math.abs(swingOffset) * 0.3; // Slight depth variation
                    b.position.y = ud.initY; // Base height, cable stretches from here

                    // Add slight rotation based on swing
                    b.rotation.z = swingOffset * 0.1;
                    b.rotation.x = Math.abs(swingOffset) * 0.05;

                } else {
                    // Enhanced organic floating animation (Option A) - for non-crane cubes
                    b.rotation.x += ud.rotSpeedX;
                    b.rotation.y += ud.rotSpeed;
                    b.rotation.z += ud.rotSpeedZ;

                    // Smooth bobbing movement up/down
                    b.position.y = ud.initY + Math.sin(time * ud.floatSpeed + ud.floatPhase) * ud.floatAmp;

                    // Lateral oscillation for more organic movement
                    b.position.x = ud.initX + Math.sin(time * ud.lateralSpeedX + ud.lateralPhaseX) * ud.lateralAmpX;
                    b.position.z = ud.initZ + Math.cos(time * ud.lateralSpeedZ + ud.lateralPhaseZ) * ud.lateralAmpZ;
                }

                // Parpadeo periódico (escáner pasando) - for all cubes
                var flicker = Math.sin(time * 3.0 + ud.floatPhase * 2) * 0.5 + 0.5;
                b.material.opacity *= (0.85 + flicker * 0.15);
            }, this);

            // ---- Crane Animation: horizontal movement and swinging cubes ----
            this.cranes.forEach(function (crane, index) {
                // Horizontal movement along the rail (continuous loop)
                var railLength = 160; // Total length of rail
                var craneX = crane.startX + Math.sin(time * crane.speed + crane.phase) * (railLength / 2);
                craneX = Math.max(crane.startX - 40, Math.min(crane.startX + 120, craneX)); // Clamp to rail bounds

                // Update crane arm position
                crane.arm.position.x = craneX;

                // Update cable and hook position
                crane.cable.position.x = craneX;
                crane.hook.position.x = craneX;
                crane.hook.position.z = crane.z;

                // Update cable geometry to connect arm to cube/hook
                if (crane.cube) {
                    var cubePos = crane.cube.position;
                    var cablePoints = crane.cable.geometry.attributes.position.array;
                    cablePoints[0] = craneX; // Start at arm
                    cablePoints[1] = 15;     // Arm height
                    cablePoints[2] = crane.z;
                    cablePoints[3] = cubePos.x; // End at cube
                    cablePoints[4] = cubePos.y + crane.cube.userData.cableLength / 2; // Above cube
                    cablePoints[5] = cubePos.z;
                    crane.cable.geometry.attributes.position.needsUpdate = true;

                    // Position hook at cable end
                    crane.hook.position.x = cubePos.x;
                    crane.hook.position.y = cubePos.y + crane.cube.userData.cableLength / 2;
                    crane.hook.position.z = cubePos.z;
                }
            });

            // ---- Partículas: movimiento suave ----
            if (this.particleSystem) {
                var pos = this.particleSystem.geometry.attributes.position.array;
                var vel = this.particleSystem.geometry.attributes.velocity.array;
                var count = pos.length / 3;

                // Límites basados en viewport
                var limitX = 120;
                var limitY = 25;
                var limitZ = 40;

                for (var i = 0; i < count; i++) {
                    var i3 = i * 3;
                    pos[i3]     += vel[i3];
                    pos[i3 + 1] += vel[i3 + 1];
                    pos[i3 + 2] += vel[i3 + 2];

                    // Rebotar en límites (extendidos a pantalla completa)
                    if (Math.abs(pos[i3])     > limitX) vel[i3]     *= -1;
                    if (Math.abs(pos[i3 + 1]) > limitY) vel[i3 + 1] *= -1;
                    if (Math.abs(pos[i3 + 2]) > limitZ) vel[i3 + 2] *= -1;
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

            // ===================================================
            // FLOATING CUBES — Animación de cubos flotantes
            // 3 comportamentos mezclados + loop infinito + profundad
            // ===================================================
            this.floatingCubes.forEach(function (cube) {
                var ud = cube.userData;

                // Comportamiento 1: Flotación sinusoidal (y)
                // y = baseY + Math.sin(time * 0.8 + offset) * 30
                cube.position.y = ud.baseY + Math.sin(time * ud.floatSpeed * 0.8 + ud.floatOffset) * ud.floatAmp;

                // Comportamiento 2: Desplazamiento horizontal con rebote
                // Movimiento de lado a lado con loop infinito
                var newX = ud.baseX + Math.sin(time * ud.lateralSpeed + ud.lateralOffset) * ud.lateralAmp;
                
                // Loop infinito: reaparecer por el lado opuesto
                if (newX > ud.maxX) {
                    ud.baseX -= (ud.maxX - ud.minX);
                    ud.baseX = Math.max(ud.minX, ud.baseX);
                } else if (newX < ud.minX) {
                    ud.baseX += (ud.maxX - ud.minX);
                    ud.baseX = Math.min(ud.maxX, ud.baseX);
                }
                cube.position.x = ud.baseX + Math.sin(time * ud.lateralSpeed + ud.lateralOffset) * ud.lateralAmp;

                // Comportamiento 3: Rotación continua
                cube.rotation.x += ud.rotSpeedX;
                cube.rotation.y += ud.rotSpeedY;

                // Parpadeo sutil en aristas (brillo)
                var edgePulse = Math.sin(time * 2 + ud.floatOffset) * 0.3 + 0.7;
                cube.material.opacity *= edgePulse;
            });

            // ===================================================
            // LIGHT POINTS — Animación de puntos parpadeantes
            // ===================================================
            this.lightPoints.forEach(function (point) {
                var ud = point.userData;
                var blink = Math.sin(time * ud.blinkSpeed + ud.blinkPhase) * 0.5 + 0.5;
                point.material.opacity = ud.baseOpacity * (0.4 + blink * 0.6);
            });

            // ===================================================
            // EDS BACKGROUND TEXT — Animación de escala pulsante
            // Scale de 1 a 1.04 en loop de 6 segundos
            // ===================================================
            if (this.edsBackgroundElement) {
                var scalePulse = 1 + Math.sin(time * (Math.PI * 2 / 6)) * 0.04;
                this.edsBackgroundElement.style.transform = 
                    'translate(-50%, -50%) scale(' + scalePulse + ')';
            }

            // ---- Parallax y flotación de Grupo EDS ----
            if (this.edsGroup) {
                this.edsGroup.position.y = Math.sin(time * 1.5) * 1.5;
                this.edsGroup.rotation.y = -0.05 + this.mouseX * 0.15;
                this.edsGroup.rotation.x = this.mouseY * 0.08;
            }

            // ---- Parallax de cámara con mouse — movimiento más pronunciado ----
            this.camera.position.x += (this.mouseX * 12 - this.camera.position.x) * 0.03;
            this.camera.position.y += (-this.mouseY * 8 + 8 - this.camera.position.y) * 0.03;
            this.camera.lookAt(0, 0, 0);

            // ---- Movimiento parallax del fondo completo ----
            // Mover toda la escena ligeramente opuesta al mouse
            this.scene.position.x = this.mouseX * 3;
            this.scene.position.y = -this.mouseY * 2;

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