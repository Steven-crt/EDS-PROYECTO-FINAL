/**
 * ================================================
 * MAIN.JS - EDS Edificaciones Inteligentes
 * Main Application Controller v2.0
 * ================================================
 */

import { Animations, Particles } from './animations.js';

const INTRO_SESSION_KEY = 'edsIntroSeen';
const currentPath = window.location.pathname;
const isIntroPage = currentPath.endsWith('intro.html');
const isHomePage = currentPath.endsWith('index.html') || currentPath.endsWith('/eds-web/') || currentPath.endsWith('/eds-web');

if (!sessionStorage.getItem(INTRO_SESSION_KEY) && isHomePage && !isIntroPage) {
    window.location.replace('intro.html');
}

const App = {
    particlesInstance: null,

    init() {
        this.initHeader();
        this.initMobileMenu();
        this.initSmoothScroll();
        this.initAnimations();
        this.initParticles();
        this.initProjectFilters();
        this.initProjectCards();
        this.initFormHandling();
    },

    /**
     * Header Scroll Effect
     */
    initHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    },

    /**
     * Mobile Menu Toggle
     */
    initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!menuToggle || !navMenu) return;

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    },

    /**
     * Smooth Scroll for Anchor Links
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    /**
     * Initialize All Animations
     */
    initAnimations() {
        Animations.init();
    },

    /**
     * Initialize Particle Background
     */
    initParticles() {
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            this.particlesInstance = Particles;
            this.particlesInstance.init('particles');
        }
    },

    /**
     * Project Filters
     */
    initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projects = document.querySelectorAll('.project-card');

        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;

                projects.forEach(project => {
                    if (filter === 'all' || project.dataset.category === filter) {
                        project.style.display = '';
                        setTimeout(() => project.classList.add('aos-animate'), 50);
                    } else {
                        project.classList.remove('aos-animate');
                        setTimeout(() => project.style.display = 'none', 300);
                    }
                });
            });
        });
    },

    initProjectCards() {
        const cards = document.querySelectorAll('.project-card');

        if (!cards.length || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        cards.forEach(card => {
            const setCardTransform = (event) => {
                const rect = card.getBoundingClientRect();
                const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
                const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
                const rotateY = ((pointerX - 50) / 50) * 6;
                const rotateX = ((50 - pointerY) / 50) * 6;

                card.style.setProperty('--pointer-x', `${pointerX}%`);
                card.style.setProperty('--pointer-y', `${pointerY}%`);
                card.style.setProperty('--rotate-x', `${rotateX.toFixed(2)}deg`);
                card.style.setProperty('--rotate-y', `${rotateY.toFixed(2)}deg`);
                card.classList.add('is-tilting');
            };

            const resetCardTransform = () => {
                card.style.setProperty('--pointer-x', '50%');
                card.style.setProperty('--pointer-y', '50%');
                card.style.setProperty('--rotate-x', '0deg');
                card.style.setProperty('--rotate-y', '0deg');
                card.classList.remove('is-tilting');
            };

            card.addEventListener('mousemove', setCardTransform);
            card.addEventListener('mouseleave', resetCardTransform);
        });
    },

    /**
     * Form Handling
     */
    initFormHandling() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });
    },

    handleFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
            submitBtn.classList.add('success');
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('success');
                form.reset();
            }, 2000);
        }, 1500);
    },

    /**
     * Open WhatsApp Chat
     */
    openWhatsApp() {
        const phone = '51950313642';
        const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    },

    /**
     * Lazy Load Images
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();

    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 3000);
    }
});

window.App = App;
