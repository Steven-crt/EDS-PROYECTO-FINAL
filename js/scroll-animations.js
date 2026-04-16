/**
 * ================================================
 * GSAP SCROLL ANIMATIONS - EDS Edificaciones Inteligentes
 * Animaciones cinematográficas con GSAP + ScrollTrigger
 * ================================================
 */

(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var ScrollAnimations = {
        init: function () {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                console.warn('GSAP or ScrollTrigger not loaded');
                return;
            }

            gsap.registerPlugin(ScrollTrigger);

            if (prefersReducedMotion) {
                this.initSectionFadeIns();
                return;
            }

            this.initSectionFadeIns();
            this.initParallaxSections();
            this.initHeroElements();
            this.initSmoothSectionTransitions();
            this.initServiceCardsReveal();
            this.initStatItemsReveal();
            this.initProjectCardsReveal();
            this.initCoverageCardsReveal();
            this.initAboutReveal();
            this.initMVCardsReveal();
            this.initMagneticButtons();
            this.initCTAReveal();
            this.initSectionTitleReveal();
        },

        /* ──────────────────────────────────────────
           SECTION FADE INS
        ────────────────────────────────────────── */
        initSectionFadeIns: function () {
            var sections = document.querySelectorAll('.section-3d-bg');
            sections.forEach(function (section) {
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

        /* ──────────────────────────────────────────
           PARALLAX
        ────────────────────────────────────────── */
        initParallaxSections: function () {
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
                    { y: 60 },
                    {
                        y: -40,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: '#nosotros',
                            start: 'top 80%',
                            end: 'bottom 20%',
                            scrub: 1.5
                        }
                    }
                );
            }

            // Parallax suave en orbes de todo el sitio
            gsap.utils.toArray('.gradient-orb').forEach(function (orb, i) {
                gsap.to(orb, {
                    y: i % 2 === 0 ? -80 : 80,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: orb.parentElement,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 2
                    }
                });
            });
        },

        /* ──────────────────────────────────────────
           HERO ENTRANCE — Dramático
        ────────────────────────────────────────── */
        initHeroElements: function () {
            var tl = gsap.timeline({ delay: 0.2 });

            var heroCard = document.querySelector('.hero-glass-card');
            if (heroCard) {
                tl.fromTo(
                    heroCard,
                    { opacity: 0, x: -42, scale: 0.97, rotateY: -4 },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        rotateY: 0,
                        duration: 1.1,
                        ease: 'power3.out'
                    }
                );

                // Revelar elementos internos en cascada
                var badge = heroCard.querySelector('.glass-badge');
                var title = heroCard.querySelector('.hero-title');
                var desc = heroCard.querySelector('.hero-description');
                var btns = heroCard.querySelector('.hero-buttons');

                if (badge) tl.fromTo(badge, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.75');
                if (title) tl.fromTo(title, { opacity: 0, y: 22, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power3.out' }, '-=0.42');
                if (desc) tl.fromTo(desc, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
                if (btns) tl.fromTo(btns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
            }

            // Floating badges entrada escalonada
            var floatingBadges = document.querySelectorAll('.floating-badge');
            floatingBadges.forEach(function (badge, i) {
                tl.fromTo(
                    badge,
                    { opacity: 0, x: 30, scale: 0.92, rotateZ: 2 },
                    {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        rotateZ: 0,
                        duration: 0.7,
                        ease: 'power3.out'
                    },
                    0.6 + i * 0.25
                );
            });
        },

        /* ──────────────────────────────────────────
           SECTION TITLE REVEAL — Text clip-path
        ────────────────────────────────────────── */
        initSectionTitleReveal: function () {
            gsap.utils.toArray('.section-title').forEach(function (title) {
                gsap.fromTo(
                    title,
                    { opacity: 0, y: 50, clipPath: 'inset(0 0 100% 0)' },
                    {
                        opacity: 1,
                        y: 0,
                        clipPath: 'inset(0 0 0% 0)',
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: title,
                            start: 'top 88%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        },

        /* ──────────────────────────────────────────
           SMOOTH SUBTITLES
        ────────────────────────────────────────── */
        initSmoothSectionTransitions: function () {
            var subtitles = document.querySelectorAll('.section-subtitle');
            subtitles.forEach(function (subtitle) {
                gsap.fromTo(
                    subtitle,
                    { opacity: 0, y: 25 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: subtitle,
                            start: 'top 90%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        },

        /* ──────────────────────────────────────────
           SERVICE CARDS — Stagger dramático
        ────────────────────────────────────────── */
        initServiceCardsReveal: function () {
            var grid = document.querySelector('.services-grid');
            if (!grid) return;

            var cards = grid.querySelectorAll('.service-card');
            if (!cards.length) return;

            // Ocultar inicialmente via GSAP (overrides AOS para estos)
            gsap.set(cards, { opacity: 0, y: 36, scale: 0.97, rotateX: 4 });

            ScrollTrigger.create({
                trigger: grid,
                start: 'top 80%',
                once: true,
                onEnter: function () {
                    gsap.to(cards, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        duration: 0.68,
                        ease: 'power3.out',
                        stagger: {
                            each: 0.08,
                            from: 'start'
                        }
                    });
                }
            });

            // Hover 3D tilt mejorado con GSAP
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                cards.forEach(function (card) {
                    card.addEventListener('mouseenter', function () {
                        gsap.to(card, { scale: 1.02, boxShadow: '0 24px 44px rgba(21,101,192,0.16)', duration: 0.28, ease: 'power2.out' });
                    });
                    card.addEventListener('mouseleave', function () {
                        gsap.to(card, { scale: 1, boxShadow: '', duration: 0.4, ease: 'power2.out' });
                    });
                });
            }
        },

        /* ──────────────────────────────────────────
           STAT ITEMS — Pop-in con bounce
        ────────────────────────────────────────── */
        initStatItemsReveal: function () {
            var statsGrid = document.querySelector('.stats-grid');
            if (!statsGrid) return;

            var items = statsGrid.querySelectorAll('.stat-item');
            if (!items.length) return;

            gsap.set(items, { opacity: 0, scale: 0.5, y: 40 });

            ScrollTrigger.create({
                trigger: statsGrid,
                start: 'top 75%',
                once: true,
                onEnter: function () {
                    gsap.to(items, {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'back.out(2)',
                        stagger: { each: 0.12, from: 'start' }
                    });
                }
            });
        },

        /* ──────────────────────────────────────────
           PROJECT CARDS — Reveal desde abajo
        ────────────────────────────────────────── */
        initProjectCardsReveal: function () {
            var grid = document.querySelector('.projects-grid');
            if (!grid) return;

            var cards = grid.querySelectorAll('.project-card');
            if (!cards.length) return;

            gsap.set(cards, { opacity: 0, y: 80, scale: 0.9 });

            ScrollTrigger.create({
                trigger: grid,
                start: 'top 82%',
                once: true,
                onEnter: function () {
                    gsap.to(cards, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.9,
                        ease: 'power3.out',
                        stagger: { each: 0.1, from: 'start' }
                    });
                }
            });
        },

        /* ──────────────────────────────────────────
           COVERAGE CARDS — Cascade diagonal
        ────────────────────────────────────────── */
        initCoverageCardsReveal: function () {
            var grid = document.querySelector('.coverage-grid');
            if (!grid) return;

            var cards = grid.querySelectorAll('.coverage-card');
            if (!cards.length) return;

            gsap.set(cards, { opacity: 0, y: 50, rotateY: 20 });

            ScrollTrigger.create({
                trigger: grid,
                start: 'top 80%',
                once: true,
                onEnter: function () {
                    gsap.to(cards, {
                        opacity: 1,
                        y: 0,
                        rotateY: 0,
                        duration: 0.85,
                        ease: 'power3.out',
                        stagger: { each: 0.15, from: 'start' }
                    });
                }
            });
        },

        /* ──────────────────────────────────────────
           ABOUT SECTION — Reveal split
        ────────────────────────────────────────── */
        initAboutReveal: function () {
            var aboutGrid = document.querySelector('.about-grid');
            if (!aboutGrid) return;

            var imgEl = aboutGrid.querySelector('.about-image');
            var contentEl = aboutGrid.querySelector('.about-content');

            if (imgEl) {
                gsap.fromTo(
                    imgEl,
                    { opacity: 0, x: -80, rotateY: -15 },
                    {
                        opacity: 1,
                        x: 0,
                        rotateY: 0,
                        duration: 1.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: aboutGrid,
                            start: 'top 78%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            }

            if (contentEl) {
                var children = contentEl.children;
                gsap.fromTo(
                    Array.from(children),
                    { opacity: 0, x: 60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.7,
                        ease: 'power3.out',
                        stagger: 0.12,
                        scrollTrigger: {
                            trigger: aboutGrid,
                            start: 'top 75%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            }
        },

        /* ──────────────────────────────────────────
           MISIÓN / VISIÓN / VALORES CARDS
        ────────────────────────────────────────── */
        initMVCardsReveal: function () {
            var grid = document.querySelector('.mv-grid');
            if (!grid) return;

            var cards = grid.querySelectorAll('.mv-card');
            if (!cards.length) return;

            gsap.set(cards, { opacity: 0, y: 70, rotateX: 15 });

            ScrollTrigger.create({
                trigger: grid,
                start: 'top 80%',
                once: true,
                onEnter: function () {
                    gsap.to(cards, {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.95,
                        ease: 'back.out(1.4)',
                        stagger: { each: 0.18, from: 'center' }
                    });
                }
            });
        },

        /* ──────────────────────────────────────────
           CTA REVEAL — Zoom con glow
        ────────────────────────────────────────── */
        initCTAReveal: function () {
            var ctaContent = document.querySelector('.cta-content');
            if (!ctaContent) return;

            gsap.fromTo(
                ctaContent,
                { opacity: 0, scale: 0.85, y: 40 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 1.1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: ctaContent,
                        start: 'top 82%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animar botones del CTA en stagger
            var ctaBtns = ctaContent.querySelectorAll('.btn');
            gsap.fromTo(
                ctaBtns,
                { opacity: 0, y: 20, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: ctaContent,
                        start: 'top 78%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        },

        /* ──────────────────────────────────────────
           MAGNETIC BUTTONS
           Los botones siguen el cursor sutilmente
        ────────────────────────────────────────── */
        initMagneticButtons: function () {
            if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

            var btns = document.querySelectorAll('.btn-primary, .btn-whatsapp, .btn-outline, .carousel-arrow');

            btns.forEach(function (btn) {
                var strength = 0.3;

                btn.addEventListener('mousemove', function (e) {
                    var rect = btn.getBoundingClientRect();
                    var cx = rect.left + rect.width / 2;
                    var cy = rect.top + rect.height / 2;
                    var dx = (e.clientX - cx) * strength;
                    var dy = (e.clientY - cy) * strength;

                    gsap.to(btn, {
                        x: dx,
                        y: dy,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                });

                btn.addEventListener('mouseleave', function () {
                    gsap.to(btn, {
                        x: 0,
                        y: 0,
                        duration: 0.6,
                        ease: 'elastic.out(1, 0.4)'
                    });
                });
            });
        }
    };

    window.ScrollAnimations = ScrollAnimations;
})();
