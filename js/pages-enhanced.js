/* ================================================
   EDS EDIFICACIONES INTELIGENTES
   pages-enhanced.js — Animaciones y mejoras
   ================================================ */

(function () {
    'use strict';

    var PagesEnhanced = {

        init: function () {
            this.initPageHeaderEffects();
            this.initCarousel();
        },

        initPageHeaderEffects: function () {
            var header = document.querySelector('.page-header');
            if (!header) return;
            
            var orbs = header.querySelectorAll('.page-header-orb');
            if (orbs.length === 0) {
                header.insertAdjacentHTML('afterbegin', 
                    '<div class="page-header-orb orb-a"></div>' +
                    '<div class="page-header-orb orb-b"></div>'
                );
            }
            
            var grid = header.querySelector('.grid-bg');
            if (!grid) {
                header.insertAdjacentHTML('afterbegin', '<div class="grid-bg"></div>');
            }
        },

        initCarousel: function () {
            var carousel = document.querySelector('.project-carousel');
            if (!carousel) return;

            var list = carousel.querySelector('.carousel-list');
            var items = carousel.querySelectorAll('.carousel-item');
            var prevBtn = document.getElementById('carousel-prev');
            var nextBtn = document.getElementById('carousel-next');
            var currentIndex = 0;

            function updateCarousel() {
                items.forEach(function (item, index) {
                    item.classList.remove('active');
                    if (index === currentIndex) {
                        item.classList.add('active');
                    }
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    updateCarousel();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    currentIndex = (currentIndex + 1) % items.length;
                    updateCarousel();
                });
            }

            updateCarousel();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { PagesEnhanced.init(); });
    } else {
        PagesEnhanced.init();
    }

    window.PagesEnhanced = PagesEnhanced;
})();