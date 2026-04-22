/**
 * ================================================
 * ANIMACIONES MÓDULO PRINCIPAL
 * EDS Edificaciones Inteligentes
 * ================================================
 * Este módulo controla todas las animaciones del sitio web,
 * incluyendo efectos al hacer scroll, contadores animados,
 * efecto parallax y tarjetas 3D interactivas.
 */

// ================================================
// TYPOGRAPHER - Typing Effect con colores alternados
// ================================================
const Typographer = {
    elements: [],
    queue: [],
    isTyping: false,
    
    init() {
        this.elements = document.querySelectorAll('[data-type]');
        if (!this.elements.length) return;
        
        this.elements.forEach(el => {
            const texts = el.dataset.type.split('|');
            const speed = parseInt(el.dataset.typeSpeed) || 80;
            const delay = parseInt(el.dataset.typeDelay) || 0;
            el._texts = texts;
            el._speed = speed;
            el._index = 0;
            el._charIndex = 0;
            el._isDeleting = false;
            el._fullText = '';
            
            if (delay > 0) {
                setTimeout(() => this.queueType(el), delay);
            } else {
                this.queueType(el);
            }
        });
    },
    
    queueType(el) {
        this.queue.push(el);
        if (!this.isTyping) this.processQueue();
    },
    
    processQueue() {
        if (this.queue.length === 0) {
            this.isTyping = false;
            return;
        }
        
        this.isTyping = true;
        const el = this.queue.shift();
        this.typeText(el);
    },
    
    typeText(el) {
        const texts = el._texts;
        const currentIndex = el._index;
        const currentText = texts[currentIndex];
        const isDeleting = el._isDeleting;
        const speed = el._speed;
        
        if (isDeleting) {
            el.textContent = currentText.substring(0, el._charIndex - 1);
            el._charIndex--;
        } else {
            el.textContent = currentText.substring(0, el._charIndex + 1);
            el._charIndex++;
        }
        
        let typeSpeed = speed;
        if (isDeleting) typeSpeed /= 2;
        
        if (!isDeleting && el._charIndex === currentText.length) {
            if (el._index < texts.length - 1) {
                typeSpeed = 2000;
                el._isDeleting = true;
            } else {
                this.finalizeText(el);
                this.processQueue();
                return;
            }
        }
        
        if (isDeleting && el._charIndex === 0) {
            el._isDeleting = false;
            el._index++;
            if (el._index >= texts.length) {
                el._index = 0;
                this.finalizeText(el);
                this.processQueue();
                return;
            }
            typeSpeed = 500;
        }
        
        setTimeout(() => this.typeText(el), typeSpeed);
    },
    
    finalizeText(el) {
        const texts = el._texts;
        el.innerHTML = texts.map((phrase, i) => {
            const isEven = i % 2 === 0;
            return `<span class="phrase-${i}" style="color: ${isEven ? 'white' : '#f0b429'}">${phrase}</span>`;
        }).join(' ');
    }
};

// ================================================
// FLOATING PHYSICS - Elementos con física simulada
// ================================================
const FloatingPhysics = {
    items: [],
    mouse: { x: 0, y: 0 },
    rafId: null,
    
    init() {
        const items = document.querySelectorAll('.floating-physics');
        if (!items.length) return;
        
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            this.items.push({
                el: item,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                vx: 0,
                vy: 0,
                targetX: rect.left + rect.width / 2,
                targetY: rect.top + rect.height / 2,
                friction: 0.92,
                spring: 0.08,
                maxSpeed: 8,
                offsetY: Math.random() * 40 - 20,
                speedY: 0.02 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2
            });
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        this.animate();
    },
    
    animate() {
        const time = performance.now() * 0.001;
        
        this.items.forEach(item => {
            const dx = this.mouse.x - item.x;
            const dy = this.mouse.y - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 200) {
                const force = (200 - dist) / 200 * 0.02;
                item.vx -= dx * force;
                item.vy -= dy * force;
            }
            
            item.vy += Math.sin(time * item.speedY + item.phase) * 0.3;
            
            item.vx *= item.friction;
            item.vy *= item.friction;
            
            const speed = Math.sqrt(item.vx * item.vx + item.vy * item.vy);
            if (speed > item.maxSpeed) {
                item.vx = (item.vx / speed) * item.maxSpeed;
                item.vy = (item.vy / speed) * item.maxSpeed;
            }
            
            item.x += item.vx;
            item.y += item.vy;
            
            item.el.style.transform = `translate(${item.x - item.targetX}px, ${item.y - item.targetY + Math.sin(time + item.phase) * item.offsetY}px)`;
        });
        
        this.rafId = requestAnimationFrame(() => this.animate());
    }
};

// Módulo principal que gestiona todas las animaciones de la página
const Animations = {
    // Verifica si el usuario prefiere movimiento reducido (accesibilidad)
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

// Inicializa todas las funcionalidades de animación disponibles
    // Este método es el punto de entrada principal que se llama desde el código
    init() {
        this.initAOS();        // Inicializa animaciones al hacer scroll
        this.initCounters();   // Inicializa contadores animados
        try { this.initTypographer(); } catch(e) { console.warn('Typographer error:', e); }
        if (!this.prefersReducedMotion) {
            this.initParallax();   // Inicializa efecto parallax (omitir si prefiere movimiento reducido)
            this.init3DCards();    // Inicializa efecto 3D en tarjetas
            this.initSectionParallax(); // Parallax por sección
            this.initGSAP3D();     // Inicializa animaciones 3D avanzadas con GSAP
            try { this.initFloatingPhysics(); } catch(e) { console.warn('FloatingPhysics error:', e); }
        }
        this.initScrollReveal(); // Inicializa revelado progresivo al scroll
    },

    initTypographer() {
        if (typeof Typographer !== 'undefined') {
            Typographer.init();
        }
    },

    initFloatingPhysics() {
        if (typeof FloatingPhysics !== 'undefined') {
            FloatingPhysics.init();
        }
    },

    /**
     * Contadores Animados Mejorados
     */
    initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    this.animateCounterEnhanced(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    animateCounterEnhanced(element) {
        const target = parseInt(element.dataset.target);
        const suffix = element.dataset.suffix || '';
        const prefix = element.dataset.prefix || '';
        const duration = 2500;
        const frameRate = 60;
        const frames = duration / 1000 * frameRate;
        let current = 0;
        let frame = 0;
        const easeOut = t => 1 - Math.pow(1 - t, 4);
        
        const update = () => {
            frame++;
            const progress = Math.min(frame / frames, 1);
            const easedProgress = easeOut(progress);
            current = Math.floor(easedProgress * target);
            
            const formattedValue = this.formatCounterValue(current);
            element.textContent = prefix + formattedValue + suffix;
            
            if (frame < frames) {
                requestAnimationFrame(update);
            } else {
                element.textContent = prefix + this.formatCounterValue(target) + suffix;
                element.classList.add('counter-complete');
            }
        };
        
        requestAnimationFrame(update);
    },

    formatCounterValue(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
        }
        if (value >= 1000) {
            return value.toLocaleString('es-ES');
        }
        return value.toString();
    },

    /**
     * Animate on Scroll (AOS)
     * Sistema de animaciones que se activan cuando los elementos entran en el viewport
     * Utiliza IntersectionObserver para detectar visibilidad
     */
    initAOS() {
        const elements = document.querySelectorAll('[data-aos]');
        
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.aosDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    },

    /**
     * Contadores Animados - Animated Counters
     * Inicializa los contadores numéricos que se animan cuando son visibles
     * Cada contador tiene un número objetivo que se cuenta gradualmente
     */
    initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    // Función que realiza la animación del contador numérico
    // target: número objetivo a alcanzar
    // suffix: texto adicional a mostrar (ej: %, +)
    // duration: tiempo total de la animación en milisegundos
    animateCounter(element) {
        const target = parseInt(element.dataset.target);  // Obtiene el número meta del atributo data
        const suffix = element.dataset.suffix || '';     // Obtiene el sufijo si existe
        const duration = 2000;                           // Duración de 2 segundos
        const step = target / (duration / 16);           // Calcula el incremento por frame (aprox 60fps)
        let current = 0;                                 // Valor actual comenzado en 0

        // Función recursiva que actualiza el número en cada frame
        const update = () => {
            current += step;
            if (current < target) {
                // Mientras no llegue al objetivo, muestra el valor actual
                element.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(update);           // Solicita el siguiente frame
            } else {
                // Cuando llega al objetivo, muestra el valor final exacto
                element.textContent = target + suffix;
            }
        };

        update();  // Inicia la animación
    },

    /**
     * Efecto Parallax - Parallax Effect
     * Crea un efecto de profundidad moviendo elementos a diferentes velocidades
     * durante el desplazamiento de la página
     */
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (!parallaxElements.length) return;  // Si no hay elementos parallax, salir

        // Escucha el evento de scroll para mover los elementos
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;  // Obtiene la posición actual del scroll vertical
            
            // Para cada elemento con efecto parallax
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;  // Velocidad del efecto (por defecto 0.5)
                const yPos = -(scrollY * speed);  // Calcula la posición vertical invertida
                el.style.transform = `translateY(${yPos}px)`;         // Aplica la transformación CSS
            });
        }, { passive: true });
    },

    /**
     * Efecto de Tarjeta 3D - Avanzado con VanillaTilt si está disponible
     */
    init3DCards() {
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll(".card-3d, .coverage-card, .mv-card"), {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.2,
                scale: 1.02
            });
        }
    },

    /**
     * Animaciones GSAP - Entrada suave de títulos al hacer scroll
     */
    initGSAP3D() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        
        gsap.registerPlugin(ScrollTrigger);

        // Animación de entrada para títulos de sección
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.to(title, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                immediateRender: false
            });
        });

        // Orbes animados flotando estilo 3D
        gsap.to(".gradient-orb", {
            y: "random(-80, 80)",
            x: "random(-80, 80)",
            rotationZ: "random(-45, 45)",
            scale: "random(0.8, 1.2)",
            duration: "random(6, 10)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    },

    /**
     * Scroll Reveal - Revelado progresivo de secciones
     * Añade clase 'reveal-visible' cuando las secciones entran en viewport
     * con efecto de profundidad y aparición desde abajo
     */
    initScrollReveal() {
        const sections = document.querySelectorAll('.section-3d-bg');
        
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        });

        sections.forEach(section => observer.observe(section));
    },

    /**
     * Parallax por Sección
     * Mueve elementos internos de cada sección a velocidades diferentes
     * según el scroll para crear efecto de profundidad
     */
    initSectionParallax() {
        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        
        if (!parallaxLayers.length) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.pageYOffset;
                    
                    parallaxLayers.forEach(layer => {
                        const speed = parseFloat(layer.dataset.speed) || 0.3;
                        const rect = layer.parentElement.getBoundingClientRect();
                        const sectionTop = rect.top + scrollY;
                        const offset = (scrollY - sectionTop) * speed;
                        
                        layer.style.transform = `translateY(${offset}px)`;
                    });

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
};

/**
 * ================================================
 * MÓDULO DE PARTÍCULAS - PARTICLES MODULE
 * ================================================
 * Crea un fondo animado con partículas flotantes que se mueven libremente
 * y se conectan mediante líneas cuando están cerca unas de otras
 * Ideal para efectos decorativos en fondos de secciones
 */

// Módulo para gestionar el sistema de partículas animadas en el canvas
const Particles = {
    canvas: null,           // Elemento canvas donde se dibujan las partículas
    ctx: null,              // Contexto 2D del canvas para dibujo
    particles: [],          // Array que almacena todas las partículas
    animationId: null,      // ID de la animación para poder cancelarla después

    // Inicializa el sistema de partículas en el contenedor especificado
    // containerId: ID del elemento canvas en el HTML
    init(containerId) {
        this.canvas = document.getElementById(containerId);  // Obtiene referencia al canvas
        if (!this.canvas) return;  // Si no existe el canvas, salir

        this.ctx = this.canvas.getContext('2d');  // Obtiene contexto de dibujo 2D
        this.resize();             // Ajusta el tamaño del canvas al contenedor
        this.createParticles();    // Genera las partículas iniciales
        this.animate();            // Inicia el bucle de animación

        // Redimensiona el canvas cuando la ventana cambia de tamaño
        window.addEventListener('resize', () => this.resize());
    },

    // Ajusta las dimensiones del canvas para que coincida con su contenedor padre
    resize() {
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
    },

    // Crea un conjunto de partículas con propiedades aleatorias
    // La cantidad de partículas se calcula según el área del canvas
    createParticles() {
        this.particles = [];  // Limpia el array de partículas
        // Calcula el número de partículas según el área (más área = más partículas)
        const count = Math.floor((this.canvas.width * this.canvas.height) / 15000);

        // Genera cada partícula con propiedades aleatorias
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,          // Posición X aleatoria
                y: Math.random() * this.canvas.height,         // Posición Y aleatoria
                size: Math.random() * 2 + 1,                   // Tamaño entre 1 y 3 pixeles
                speedX: (Math.random() - 0.5) * 0.5,           // Velocidad horizontal
                speedY: (Math.random() - 0.5) * 0.5,           // Velocidad vertical
                opacity: Math.random() * 0.5 + 0.2             // Opacidad entre 0.2 y 0.7
            });
        }
    },

    // Bucle principal de animación que se ejecuta en cada frame
    // Limpia el canvas, mueve partículas, dibuja partículas y conexiones
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(21, 101, 192, ${p.opacity})`;
            this.ctx.fill();
        });

        this.drawLines();
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    // Dibuja líneas de conexión entre partículas cercanas
    // Crea un efecto de "constelación" cuando las partículas están a menos de 120px
    drawLines() {
        // Compara cada par de partículas para ver si están lo suficientemente cerca
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;  // Diferencia en X
                const dy = this.particles[i].y - this.particles[j].y;  // Diferencia en Y
                const distance = Math.sqrt(dx * dx + dy * dy);         // Calcula distancia euclidiana

                // Si la distancia es menor a 120 píxeles, dibujar línea de conexión
                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    // La opacidad depende de la distancia: más cerca = más visible
                    this.ctx.strokeStyle = `rgba(21, 101, 192, ${0.2 * (1 - distance / 120)})`;
                    this.ctx.stroke();
                }
            }
        }
    },

    // Detiene la animación y libera recursos
    // Debe llamarse cuando ya no se necesita el sistema de partículas
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
};

