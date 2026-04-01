/**
 * ================================================
 * ANIMACIONES MÓDULO PRINCIPAL
 * EDS Edificaciones Inteligentes
 * ================================================
 * Este módulo controla todas las animaciones del sitio web,
 * incluyendo efectos al hacer scroll, contadores animados,
 * efecto parallax y tarjetas 3D interactivas.
 */

// Módulo principal que gestiona todas las animaciones de la página
const Animations = {
    // Inicializa todas las funcionalidades de animación disponibles
    // Este método es el punto de entrada principal que se llama desde el código
    init() {
        this.initAOS();        // Inicializa animaciones al hacer scroll
        this.initCounters();   // Inicializa contadores animados
        this.initParallax();   // Inicializa efecto parallax
        this.init3DCards();    // Inicializa efecto 3D en tarjetas
        this.initScrollReveal(); // Inicializa revelado progresivo al scroll
        this.initSectionParallax(); // Parallax por sección
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
     * Efecto de Tarjeta 3D - 3D Card Tilt Effect
     * Crea una tarjeta interactiva que rota en respuesta al movimiento del mouse
     * Simula una perspectiva 3D realista
     */
    init3DCards() {
        const cards = document.querySelectorAll('.card-3d');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
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

