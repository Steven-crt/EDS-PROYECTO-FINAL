/**
 * MAIN.JS - Controlador Principal
 * EDS Edificaciones Inteligentes
 */
(function() {
    'use strict';

    // Configuración de rutas y estado
    var currentPath = window.location.pathname;
    var urlParams = new URLSearchParams(window.location.search);
    var isIntroPage = currentPath.endsWith('intro.html');
    var isHomePage = currentPath === '/' || currentPath.endsWith('index.html') || currentPath.endsWith('/eds-web/') || currentPath.endsWith('/eds-web');
    var instantSectionHashes = ['#inicio', '#nosotros', '#servicios', '#cobertura'];
    var shouldSkipPreloaderForSection = isHomePage && instantSectionHashes.indexOf(window.location.hash) !== -1;
    var introDone = urlParams.get('intro') === '1';

    if (!isIntroPage && isHomePage && !introDone && !shouldSkipPreloaderForSection) {
        window.location.replace('intro.html');
        return;
    }

    var App = {
        particlesInstance: null,

        init: function() {
            this.initHeader();
            this.initMobileMenu();
            this.initSmoothScroll();
            this.initInitialHashScroll();
            this.initBackground3D();
            this.initScrollAnimations();
            this.initAnimations();
            this.initParticles();
            this.initProjectFilters();
            this.initProjectCards();
            this.initServiceCardGlow();
            this.initSocialIconGlow();
            this.initProjectCarousel();
            this.initFormHandling();
            this.initPageLoaded();
        },

        /**
         * INIT HEADER: Gestión del estado visual del header
         * - Detecta scroll Y > 50px para aplicar clase .scrolled (CSS styling)
         * - Listener con { passive: true } para no bloquear el hilo principal
         */
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

        /**
         * INIT MOBILE MENU: Toggle de navegación responsive
         * - Alterna clase .active en botón hamburguesa y menú
         * - Bloquea overflow del body cuando el menú está abierto (evita scroll de fondo)
         * - Cierra menú automáticamente al hacer clic en cualquier enlace (<a>)
         */
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

        /**
         * INIT SMOOTH SCROLL: Polyfill de navegación suave para anclas internas
         * - Previene comportamiento por defecto de enlaces href="#algo"
         * - Calcula offset dinámico basado en altura del header (.header)
         * - Utiliza window.scrollTo con behavior: 'smooth' (nativo)
         */
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

        initInitialHashScroll: function() {
            if (!shouldSkipPreloaderForSection) return;

            var target = document.querySelector(window.location.hash);
            if (!target) return;

            var scrollToHash = function() {
                var headerEl = document.querySelector('.header');
                var headerHeight = headerEl ? headerEl.offsetHeight : 0;
                var targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'auto'
                });
            };

            requestAnimationFrame(function() {
                requestAnimationFrame(scrollToHash);
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

        initServiceCardGlow: function() {
            var cards = document.querySelectorAll('.service-card');
            var servicesGrid = document.querySelector('.services-grid');

            if (!cards.length || !servicesGrid) return;

            servicesGrid.addEventListener('mousemove', function(e) {
                cards.forEach(function(card) {
                    var rect = card.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;
                    card.style.setProperty('--mouse-x', x + 'px');
                    card.style.setProperty('--mouse-y', y + 'px');
                });
            });
        },

        initSocialIconGlow: function() {
            var socialIcons = document.querySelectorAll('.footer-social a[data-social]');

            if (!socialIcons.length) return;

            socialIcons.forEach(function(icon) {
                icon.addEventListener('mousemove', function(e) {
                    var rect = icon.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;
                    icon.style.setProperty('--icon-mouse-x', x + 'px');
                    icon.style.setProperty('--icon-mouse-y', y + 'px');
                });
            });
        },

        /**
         * INIT PROJECT CAROUSEL: Carrusel 3D con navegación múltiple
         * - Navegación por botones prev/next (DOM manipulation de lista)
         * - Soporte táctil: touchstart/touchend con detección de swipe (threshold 50px)
         * - Navegación por teclado: ArrowRight/ArrowLeft/Escape
         * - Control de flujo con flag canClick para evitar spam de clicks (debounce 2s)
         * - Estado visual: clases .next, .prev, .showDetail para CSS transitions
         */
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

            var canClick = true;  // Debounce flag para prevenir múltiples clics rápidos

            var showSlider = function(type) {
                if (!canClick) return;
                canClick = false;

                carousel.classList.remove('next', 'prev');
                
                var currentItems = carousel.querySelectorAll('.carousel-item');
                
                if (type === 'next') {
                    listHTML.appendChild(currentItems[0]);           // Mueve primer elemento al final (rotación circular)
                    carousel.classList.add('next');
                } else {
                    listHTML.prepend(currentItems[currentItems.length - 1]);  // Mueve último elemento al inicio
                    carousel.classList.add('prev');
                }

                setTimeout(function() {
                    canClick = true;  // Reactiva clics después de 2s (duración de transición CSS)
                }, 2000);
            };

            nextButton.addEventListener('click', function() { showSlider('next'); });
            prevButton.addEventListener('click', function() { showSlider('prev'); });

            seeMoreButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    carousel.classList.remove('next', 'prev');
                    carousel.classList.add('showDetail');  // Expande tarjeta a vista detallada
                });
            });

            if (backButton) {
                backButton.addEventListener('click', function() {
                    carousel.classList.remove('showDetail');  // Contrae vista detallada
                });
            }

            // Navegación por teclado (solo cuando el carrusel tiene focus/hover)
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

            // Gestos táctiles para móviles
            var touchStartX = 0;
            var touchEndX = 0;

            carousel.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carousel.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                var diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > 50) {  // Umbral de 50px para detectar swipe
                    if (diff > 0) {
                        showSlider('next');  // Swipe izquierda = siguiente
                    } else {
                        showSlider('prev');  // Swipe derecha = anterior
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

    document.addEventListener('DOMContentLoaded', function() {
        App.init();

        var preloader = document.getElementById('preloader');
        if (preloader) {
            if ((isHomePage && introDone) || shouldSkipPreloaderForSection) {
                preloader.style.display = 'none';
                return;
            }

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