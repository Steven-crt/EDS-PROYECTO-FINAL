/**
 * ================================================
 * MAIN.JS - EDS Edificaciones Inteligentes
 * Controlador Principal de la Aplicación v2.0
 * ================================================
 */

(function() {
    'use strict';

/* ============================================
   SECCIÓN 2: CONFIGURACIÓN DE LA PÁGINA DE INTRO
   ============================================
   Se definen las constantes para controlar la página de introducción
   (intro.html). Se usa sessionStorage para verificar si el usuario
   ya vio la intro en su sesión actual. Si es la primera visita a la
   página principal y no ha visto la intro, se redirige automáticamente
   a intro.html.
   
   - INTRO_SESSION_KEY: Clave usada en sessionStorage para rastrear
     si la intro ya fue mostrada.
   - currentPath: Ruta actual de la URL de la página.
   - isIntroPage: Verifica si estamos en la página de intro.
   - isHomePage: Verifica si estamos en la página principal (index.html).
   ============================================ */
const INTRO_SESSION_KEY = 'edsIntroSeen';
const currentPath = window.location.pathname;
const isIntroPage = currentPath.endsWith('intro.html');
const isHomePage = currentPath.endsWith('index.html') || currentPath.endsWith('/eds-web/') || currentPath.endsWith('/eds-web');

// Redirigir a la intro si el usuario no la ha visto y está en la página principal
if (!sessionStorage.getItem(INTRO_SESSION_KEY) && isHomePage && !isIntroPage) {
    window.location.replace('intro.html');
}

    /* ============================================
       OBJETO PRINCIPAL DE LA APLICACIÓN
       ============================================ */
    var App = {
        particlesInstance: null,

        init: function() {
            this.initHeader();
            this.initMobileMenu();
            this.initSmoothScroll();
            this.initBackground3D();
            this.initScrollAnimations();
            this.initAnimations();
            this.initParticles();
            this.initProjectFilters();
            this.initProjectCards();
            this.initProjectCarousel();
            this.initFormHandling();
            this.initPageLoaded();
        },

        initHeader: function() {
            var header = document.querySelector('.header');
            if (!header) return;

            var handleScroll = function() {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
        },

        initMobileMenu: function() {
            var menuToggle = document.querySelector('.menu-toggle');
            var navMenu = document.querySelector('.nav-menu');
            
            if (!menuToggle || !navMenu) return;

            menuToggle.addEventListener('click', function() {
                menuToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            });

            navMenu.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function() {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        },

        initSmoothScroll: function() {
            document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
                anchor.addEventListener('click', function(e) {
                    var href = anchor.getAttribute('href');
                    if (href === '#') return;

                    e.preventDefault();
                    var target = document.querySelector(href);
                    
                    if (target) {
                        var headerEl = document.querySelector('.header');
                        var headerHeight = headerEl ? headerEl.offsetHeight : 0;
                        var targetPosition = target.offsetTop - headerHeight;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        },

        initBackground3D: function() {
            if (typeof Background3D !== 'undefined' && typeof THREE !== 'undefined') {
                Background3D.init();
            }
        },

        initScrollAnimations: function() {
            if (typeof ScrollAnimations !== 'undefined') {
                ScrollAnimations.init();
            }
        },

        initPageLoaded: function() {
            requestAnimationFrame(function() {
                document.body.classList.add('page-loaded');
                var hero = document.querySelector('.hero-3d');
                if (hero) {
                    setTimeout(function() {
                        hero.classList.add('loaded');
                    }, 100);
                }
            });
        },

        initAnimations: function() {
            if (typeof Animations !== 'undefined') {
                Animations.init();
            }
        },

        initParticles: function() {
            var particlesContainer = document.getElementById('particles');
            if (particlesContainer && typeof Particles !== 'undefined') {
                this.particlesInstance = Particles;
                this.particlesInstance.init('particles');
            }
        },

        initProjectFilters: function() {
            var filterBtns = document.querySelectorAll('.filter-btn');
            var projects = document.querySelectorAll('.project-card');

            if (!filterBtns.length) return;

            filterBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');

                    var filter = btn.dataset.filter;

                    projects.forEach(function(project) {
                        if (filter === 'all' || project.dataset.category === filter) {
                            project.style.display = '';
                            setTimeout(function() { project.classList.add('aos-animate'); }, 50);
                        } else {
                            project.classList.remove('aos-animate');
                            setTimeout(function() { project.style.display = 'none'; }, 300);
                        }
                    });
                });
            });
        },

        initProjectCards: function() {
            var cards = document.querySelectorAll('.project-card');

            if (!cards.length || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                return;
            }

            cards.forEach(function(card) {
                var setCardTransform = function(event) {
                    var rect = card.getBoundingClientRect();
                    var pointerX = ((event.clientX - rect.left) / rect.width) * 100;
                    var pointerY = ((event.clientY - rect.top) / rect.height) * 100;
                    var rotateY = ((pointerX - 50) / 50) * 6;
                    var rotateX = ((50 - pointerY) / 50) * 6;

                    card.style.setProperty('--pointer-x', pointerX + '%');
                    card.style.setProperty('--pointer-y', pointerY + '%');
                    card.style.setProperty('--rotate-x', rotateX.toFixed(2) + 'deg');
                    card.style.setProperty('--rotate-y', rotateY.toFixed(2) + 'deg');
                    card.classList.add('is-tilting');
                };

                var resetCardTransform = function() {
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

        initProjectCarousel: function() {
            var carousel = document.querySelector('.project-carousel');
            if (!carousel) return;

            var listHTML = carousel.querySelector('.carousel-list');
            var items = carousel.querySelectorAll('.carousel-item');
            var nextButton = document.getElementById('carousel-next');
            var prevButton = document.getElementById('carousel-prev');
            var backButton = document.getElementById('carousel-back');
            var seeMoreButtons = carousel.querySelectorAll('.seeMore');

            if (!items.length || !nextButton || !prevButton) return;

            var canClick = true;

            var showSlider = function(type) {
                if (!canClick) return;
                canClick = false;

                carousel.classList.remove('next', 'prev');
                
                var currentItems = carousel.querySelectorAll('.carousel-item');
                
                if (type === 'next') {
                    listHTML.appendChild(currentItems[0]);
                    carousel.classList.add('next');
                } else {
                    listHTML.prepend(currentItems[currentItems.length - 1]);
                    carousel.classList.add('prev');
                }

                setTimeout(function() {
                    canClick = true;
                }, 2000);
            };

            nextButton.addEventListener('click', function() { showSlider('next'); });
            prevButton.addEventListener('click', function() { showSlider('prev'); });

            seeMoreButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    carousel.classList.remove('next', 'prev');
                    carousel.classList.add('showDetail');
                });
            });

            if (backButton) {
                backButton.addEventListener('click', function() {
                    carousel.classList.remove('showDetail');
                });
            }

            document.addEventListener('keydown', function(e) {
                if (!carousel.matches(':hover')) return;
                
                if (e.key === 'ArrowRight') {
                    showSlider('next');
                } else if (e.key === 'ArrowLeft') {
                    showSlider('prev');
                } else if (e.key === 'Escape') {
                    carousel.classList.remove('showDetail');
                }
            });

            var touchStartX = 0;
            var touchEndX = 0;

            carousel.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carousel.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                var diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        showSlider('next');
                    } else {
                        showSlider('prev');
                    }
                }
            }, { passive: true });
        },

        initFormHandling: function() {
            var self = this;
            var forms = document.querySelectorAll('form');
            
            forms.forEach(function(form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    self.handleFormSubmit(form);
                });
            });
        },

        handleFormSubmit: function(form) {
            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
            submitBtn.disabled = true;

            setTimeout(function() {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
                submitBtn.classList.add('success');
                
                setTimeout(function() {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('success');
                    form.reset();
                }, 2000);
            }, 1500);
        },

        openWhatsApp: function() {
            var phone = '51950313642';
            var message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.');
            window.open('https://wa.me/' + phone + '?text=' + message, '_blank');
        },

        lazyLoadImages: function() {
            var images = document.querySelectorAll('img[data-src]');
            
            var imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(function(img) { imageObserver.observe(img); });
        }
    };

    /* ============================================
       INICIALIZACIÓN AL CARGAR EL DOM
       ============================================ */
    document.addEventListener('DOMContentLoaded', function() {
        App.init();

        var preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(function() {
                preloader.classList.add('fade-out');
                setTimeout(function() {
                    preloader.style.display = 'none';
                }, 500);
            }, 3000);
        }
    });

    window.App = App;
})();
