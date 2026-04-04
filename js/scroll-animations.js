/**
 * ================================================
 * GSAP SCROLL ANIMATIONS - EDS Edificaciones Inteligentes
 * Animaciones con GSAP + ScrollTrigger
 * ================================================
 */

(function() {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var ScrollAnimations = {
        init: function() {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                console.warn('GSAP or ScrollTrigger not loaded');
                return;
            }

            gsap.registerPlugin(ScrollTrigger);

            if (prefersReducedMotion) {
                // Si el usuario prefiere movimiento reducido, solo hacer fade-ins simples
                this.initSectionFadeIns();
                return;
            }

            this.initSectionFadeIns();
            this.initParallaxSections();
            this.initHeroElements();
            this.initSmoothSectionTransitions();
        },

        initSectionFadeIns: function() {
            var sections = document.querySelectorAll('.section-3d-bg');
            var self = this;

            sections.forEach(function(section) {
                gsap.fromTo(
                    section,
                    { opacity: 0.85, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 85%',
                            end: 'top 50%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        },

        initParallaxSections: function() {
            var heroBg = document.querySelector('.hero-bg');
            if (heroBg) {
                gsap.to(heroBg, {
                    yPercent: 30,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }

            var aboutImage = document.querySelector('.about-image');
            if (aboutImage) {
                gsap.fromTo(
                    aboutImage,
                    { y: 50 },
                    {
                        y: -30,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: '#nosotros',
                            start: 'top 80%',
                            end: 'bottom 20%',
                            scrub: 1
                        }
                    }
                );
            }
        },

        initHeroElements: function() {
            var heroCard = document.querySelector('.hero-glass-card');
            if (heroCard) {
                gsap.fromTo(
                    heroCard,
                    { opacity: 0, x: -60, scale: 0.95 },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: 1.2,
                        ease: 'power3.out',
                        delay: 0.3
                    }
                );
            }

            var floatingBadges = document.querySelectorAll('.floating-badge');
            floatingBadges.forEach(function(badge, i) {
                gsap.fromTo(
                    badge,
                    { opacity: 0, x: 40, scale: 0.9 },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        duration: 0.8,
                        ease: 'back.out(1.7)',
                        delay: 0.5 + i * 0.2
                    }
                );
            });
        },

        initSmoothSectionTransitions: function() {
            var subtitles = document.querySelectorAll('.section-subtitle');
            subtitles.forEach(function(subtitle) {
                gsap.fromTo(
                    subtitle,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: subtitle,
                            start: 'top 90%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        }
    };

    window.ScrollAnimations = ScrollAnimations;
})();
