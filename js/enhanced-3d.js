const Enhanced3D = {
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    elements: [],
    tiltElements: [],
    raycaster: null,
    camera: null,
    scene: null,
    hologramPass: null,

    init() {
        this.setupMouseTracking();
        this.initHologramEffect();
        this.init3DTiltCards();
        this.initFloatingParticles();
        this.initInteractiveHero();
        this.initGlowingElements();
        this.initTechGrid();
    },

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    },
    
    initHologramEffect() {
        const hologramElements = document.querySelectorAll('.hologram-effect, .service-card');
        
        hologramElements.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                this.createHologramScan(e.target);
            });
        });
    },

    createHologramScan(element) {
        if (!element) return;
        
        const scan = document.createElement('div');
        scan.className = 'hologram-scan';
        scan.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #f0b429, transparent);
            opacity: 0;
            pointer-events: none;
            z-index: 100;
        `;
        
        element.style.position = 'relative';
        element.appendChild(scan);
        
        // Animación de escaneo
        scan.animate([
            { top: '0%', opacity: 1 },
            { top: '100%', opacity: 1 },
            { top: '100%', opacity: 0 }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => scan.remove();
    },

    /**
     * Tarjetas 3D con Tilt Mejorado
     */
    init3DTiltCards() {
        const cards = document.querySelectorAll('.service-card, .project-card, .coverage-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleTilt(e, card));
            card.addEventListener('mouseleave', () => this.resetTilt(card));
        });
    },

    handleTilt(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'transform 0.1s ease-out';
        
        // Add glow effect
        this.addCardGlow(card, x, y, rect.width, rect.height);
    },

    resetTilt(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.3s ease-out';
        
        const glow = card.querySelector('.card-glow-effect');
        if (glow) glow.remove();
    },

    addCardGlow(card, x, y, width, height) {
        let glow = card.querySelector('.card-glow-effect');
        if (!glow) {
            glow = document.createElement('div');
            glow.className = 'card-glow-effect';
            glow.style.cssText = `
                position: absolute;
                inset: 0;
                background: radial-gradient(800px circle at ${x}px ${y}px, rgba(240, 180, 41, 0.15), transparent 40%);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            card.appendChild(glow);
        }
        glow.style.background = `radial-gradient(800px circle at ${x}px ${y}px, rgba(240, 180, 41, 0.15), transparent 40%)`;
        glow.style.opacity = '1';
    },

    /**
      Partículas Flotantes Interactivas
     */
    initFloatingParticles() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        this.createFloatingParticlesIn(hero);
    },

    createFloatingParticlesIn(container) {
        const rect = container.getBoundingClientRect();
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            
            const size = Math.random() * 6 + 2;
            const x = Math.random() * rect.width;
            const y = Math.random() * rect.height;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: ${Math.random() > 0.5 ? 'rgba(21, 101, 192, 0.4)' : 'rgba(240, 180, 41, 0.4)'};
                border-radius: 50%;
                pointer-events: none;
                animation: floatParticle ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                z-index: 1;
            `;
            
            container.appendChild(particle);
        }
    },

    /**
     * Hero Interactivo con following del mouse
     */
    initInteractiveHero() {
        const hero = document.querySelector('.hero-3d');
        if (!hero) return;

        this.createHeroInteractiveElements(hero);
    },

    createHeroInteractiveElements(hero) {
        // Floating badges que siguen el mouse
        const badges = hero.querySelectorAll('.floating-badge');
        badges.forEach((badge, index) => {
            badge.style.transition = 'transform 0.3s ease-out';
            
            badge.addEventListener('mouseenter', () => {
                badge.style.animation = 'none';
            });
        });

        // Mouse-following 3D elements
        document.addEventListener('mousemove', (e) => {
            this.mouseX += (this.targetX - this.mouseX) * 0.05;
            this.mouseY += (this.targetY - this.mouseY) * 0.05;

            badges.forEach((badge, index) => {
                const speed = (index + 1) * 0.5;
                const offsetX = this.mouseX * 20 * speed;
                const offsetY = this.mouseY * 20 * speed;
                const rotateZ = this.mouseX * 15 * (index + 1);
                
                badge.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotateZ}deg)`;
            });
        });
    },

    /**
     * Elementos Brillantes/Glowing
     */
    initGlowingElements() {
        const glowingElements = document.querySelectorAll('.glass-badge, .floating-badge, .badge-primary');
        
        glowingElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.pulseGlow(el);
            });
        });
    },

    pulseGlow(element) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'pulseGlow 0.5s ease-out';
    },

    /**
     * Grid Técnico Animado
     */
    initTechGrid() {
        const sections = document.querySelectorAll('.section-3d-bg, .hero');
        
        sections.forEach(section => {
            if (!section.querySelector('.tech-grid')) {
                const grid = document.createElement('div');
                grid.className = 'tech-grid';
                grid.style.cssText = `
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(rgba(21, 101, 192, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(21, 101, 192, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                    z-index: 0;
                `;
                section.insertBefore(grid, section.firstChild);
            }
        });
    },

    /**
     *破 effects
     */
    initRippleEffects() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
            });
        });
    },

    createRipple(e, button) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${e.clientX - rect.left - size/2}px;
            top: ${e.clientY - rect.top - size/2}px;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    },

    /**
     * Tech Text Reveal
     */
    initTechTextReveal() {
        const titles = document.querySelectorAll('.hero-title, .section-title');
        
        titles.forEach(title => {
            if (!title.classList.contains('tech-revealed')) {
                title.classList.add('tech-revealed');
                this.animateTechText(title);
            }
        });
    },

    animateTechText(element) {
        const text = element.textContent;
        element.textContent = '';
        
        let i = 0;
        const interval = setInterval(() => {
            element.textContent += text[i];
            i++;
            if (i >= text.length) clearInterval(interval);
        }, 50);
    }
};

// Agregar estilos dinámicos
const dynamicStyles = `
    @keyframes floatParticle {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
        50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
    }
    
    @keyframes pulseGlow {
        0% { box-shadow: 0 0 5px rgba(240, 180, 41, 0.3); }
        50% { box-shadow: 0 0 25px rgba(240, 180, 41, 0.6), 0 0 50px rgba(240, 180, 41, 0.3); }
        100% { box-shadow: 0 0 5px rgba(240, 180, 41, 0.3); }
    }
    
    @keyframes rippleEffect {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    .tech-grid {
        animation: gridMove 20s linear infinite;
    }
    
    @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
    }
    
    .hologram-scan {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #f0b429, transparent);
        box-shadow: 0 0 10px #f0b429;
    }
`;

// Injectar estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// Iniciar efectos cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Enhanced3D.init());
} else {
    Enhanced3D.init();
}

window.Enhanced3D = Enhanced3D;