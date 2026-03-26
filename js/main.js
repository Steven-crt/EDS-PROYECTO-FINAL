/**
 * ================================================
 * MAIN.JS - EDS Edificaciones Inteligentes
 * Controlador Principal de la Aplicación v2.0
 * ================================================
 * 
 * Este archivo es el punto de entrada principal de la aplicación web.
 * Coordina la inicialización de todos los módulos y funcionalidades
 * del sitio, incluyendo animaciones, navegación, filtros de proyectos
 * y manejo de formularios.
 */

/* ============================================
   SECCIÓN 1: IMPORTACIÓN DE MÓDULOS
   ============================================
   Se importan las clases Animations y Particles desde el archivo
   animations.js. Estas clases se encargan de las animaciones visuales
   y el efecto de partículas en el fondo del sitio.
   ============================================ */
import { Animations, Particles } from './animations.js';

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
   SECCIÓN 3: OBJETO PRINCIPAL DE LA APLICACIÓN
   ============================================
   El objeto 'App' es el controlador central de toda la aplicación.
   Contiene todos los métodos de inicialización y funcionalidades
   del sitio web. Cada método 'init*' se encarga de configurar una
   funcionalidad específica de la página.
   ============================================ */
const App = {
    // Instancia del sistema de partículas del fondo
    particlesInstance: null,

    /**
     * Método de inicialización principal.
     * Llama a todos los métodos de configuración en orden para
     * inicializar cada funcionalidad de la aplicación.
     * Se ejecuta cuando el DOM está completamente cargado.
     */
    init() {
        this.initHeader();          // Configurar efecto del header al hacer scroll
        this.initMobileMenu();      // Configurar menú móvil (hamburguesa)
        this.initSmoothScroll();    // Configurar scroll suave para enlaces
        this.initAnimations();      // Inicializar animaciones visuales
        this.initParticles();       // Inicializar efecto de partículas
        this.initProjectFilters();  // Configurar filtros de proyectos
        this.initProjectCards();    // Configurar interactividad de tarjetas
        this.initFormHandling();    // Configurar manejo de formularios
    },

    /**
     * ============================================
     * EFECTO DEL HEADER AL HACER SCROLL
     * ============================================
     * Agrega o quita la clase 'scrolled' al header cuando el usuario
     * desplaza la página más de 50 píxeles hacia abajo. Esto permite
     * cambiar el estilo del header (fondo, sombra, etc.) cuando se
     * hace scroll, mejorando la experiencia visual del usuario.
     * 
     * Uso del evento 'scroll' con la opción { passive: true } para
     * mejorar el rendimiento en dispositivos móviles.
     */
    initHeader() {
        const header = document.querySelector('.header');
        if (!header) return; // Si no existe el header, salir del método

        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        // Escuchar el evento scroll de forma pasiva (mejor rendimiento)
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Verificar estado inicial al cargar
    },

    /**
     * ============================================
     * MENÚ MÓVIL (HAMBURGUESA)
     * ============================================
     * Controla la apertura y cierre del menú de navegación en
     * dispositivos móviles. Al hacer clic en el botón hamburguesa:
     * 1. Se activa/desactiva la clase 'active' en el botón y menú
     * 2. Se bloquea el scroll del body cuando el menú está abierto
     * 3. Se cierra automáticamente al hacer clic en un enlace del menú
     */
    initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!menuToggle || !navMenu) return;

        // Evento click en el botón hamburguesa para abrir/cerrar menú
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Bloquear scroll del body cuando el menú está abierto
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Cerrar menú automáticamente al hacer clic en cualquier enlace
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    },

    /**
     * ============================================
     * SCROLL SUAVE PARA ENLACES DE ANCLAJE
     * ============================================
     * Intercepta los clics en enlaces internos (que comienzan con #)
     * y realiza un desplazamiento suave hasta la sección destino.
     * 
     * Calcula la posición considerando la altura del header fijo
     * para que el contenido no quede oculto detrás de la barra de
     * navegación.
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return; // Ignorar enlaces vacíos

                e.preventDefault(); // Prevenir comportamiento por defecto del navegador
                const target = document.querySelector(href);
                
                if (target) {
                    // Obtener altura del header para compensar el offset
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight;

                    // Desplazamiento suave hasta la posición calculada
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    /**
     * ============================================
     * INICIALIZAR ANIMACIONES VISUALES
     * ============================================
     * Llama al método init() de la clase Animations importada.
     * Esta clase se encarga de las animaciones de entrada de los
     * elementos cuando aparecen en el viewport del usuario.
     */
    initAnimations() {
        Animations.init();
    },

    /**
     * ============================================
     * INICIALIZAR PARTÍCULAS DE FONDO
     * ============================================
     * Configura el efecto de partículas animadas en el fondo
     * del sitio. Busca el contenedor con id 'particles' y, si
     * existe, inicializa el sistema de partículas en él.
     */
    initParticles() {
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            this.particlesInstance = Particles;
            this.particlesInstance.init('particles');
        }
    },

    /**
     * ============================================
     * FILTROS DE PROYECTOS
     * ============================================
     * Implementa el sistema de filtrado de proyectos por categoría.
     * 
     * Funcionamiento:
     * 1. Selecciona todos los botones de filtro (.filter-btn)
     * 2. Selecciona todas las tarjetas de proyecto (.project-card)
     * 3. Al hacer clic en un filtro:
     *    - Marca el botón como activo
     *    - Lee el valor de data-filter del botón
     *    - Muestra/oculta proyectos según la categoría seleccionada
     *    - Usa animaciones CSS para una transición suave
     * 
     * El filtro 'all' muestra todos los proyectos.
     */
    initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projects = document.querySelectorAll('.project-card');

        if (!filterBtns.length) return; // No hay filtros, salir

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover clase active de todos los botones
                filterBtns.forEach(b => b.classList.remove('active'));
                // Activar el botón clickeado
                btn.classList.add('active');

                const filter = btn.dataset.filter; // Categoría seleccionada

                // Filtrar proyectos según la categoría
                projects.forEach(project => {
                    if (filter === 'all' || project.dataset.category === filter) {
                        project.style.display = '';
                        // Agregar animación de entrada con pequeño retraso
                        setTimeout(() => project.classList.add('aos-animate'), 50);
                    } else {
                        project.classList.remove('aos-animate');
                        // Ocultar después de completar la animación de salida
                        setTimeout(() => project.style.display = 'none', 300);
                    }
                });
            });
        });
    },

    /**
     * ============================================
     * EFECTO 3D EN TARJETAS DE PROYECTOS
     * ============================================
     * Aplica un efecto de inclinación 3D (tilt) a las tarjetas de
     * proyectos cuando el usuario mueve el mouse sobre ellas.
     * 
     * El efecto calcula la posición del cursor relativa a la tarjeta
     * y aplica una rotación CSS en los ejes X e Y para crear la
     * ilusión de profundidad.
     * 
     * Solo se activa en dispositivos con mouse (hover: hover).
     * 
     * Variables CSS usadas:
     * - --pointer-x / --pointer-y: Posición del cursor (porcentaje)
     * - --rotate-x / --rotate-y: Ángulos de rotación (grados)
     */
    initProjectCards() {
        const cards = document.querySelectorAll('.project-card');

        // Verificar si hay tarjetas y si el dispositivo soporta hover
        if (!cards.length || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        cards.forEach(card => {
            /**
             * Calcula y aplica la transformación 3D basada en la
             * posición del mouse sobre la tarjeta.
             * La rotación máxima es de ±6 grados en cada eje.
             */
            const setCardTransform = (event) => {
                const rect = card.getBoundingClientRect();
                // Calcular posición del cursor como porcentaje del tamaño de la tarjeta
                const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
                const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
                // Calcular ángulos de rotación (máximo ±6 grados)
                const rotateY = ((pointerX - 50) / 50) * 6;
                const rotateX = ((50 - pointerY) / 50) * 6;

                // Aplicar variables CSS para el efecto visual
                card.style.setProperty('--pointer-x', `${pointerX}%`);
                card.style.setProperty('--pointer-y', `${pointerY}%`);
                card.style.setProperty('--rotate-x', `${rotateX.toFixed(2)}deg`);
                card.style.setProperty('--rotate-y', `${rotateY.toFixed(2)}deg`);
                card.classList.add('is-tilting');
            };

            /**
             * Restablece la tarjeta a su estado original cuando
             * el mouse sale de ella.
             */
            const resetCardTransform = () => {
                card.style.setProperty('--pointer-x', '50%');
                card.style.setProperty('--pointer-y', '50%');
                card.style.setProperty('--rotate-x', '0deg');
                card.style.setProperty('--rotate-y', '0deg');
                card.classList.remove('is-tilting');
            };

            // Registrar eventos del mouse para la interactividad
            card.addEventListener('mousemove', setCardTransform);
            card.addEventListener('mouseleave', resetCardTransform);
        });
    },

    /**
     * ============================================
     * MANEJO DE FORMULARIOS
     * ============================================
     * Intercepta el envío de todos los formularios de la página
     * y procesa el envío de forma controlada. Previene el
     * comportamiento por defecto del navegador y llama al método
     * handleFormSubmit() para mostrar feedback visual al usuario.
     */
    initFormHandling() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault(); // Prevenir envío tradicional del formulario
                this.handleFormSubmit(form);
            });
        });
    },

    /**
     * ============================================
     * PROCESAR ENVÍO DE FORMULARIO
     * ============================================
     * Simula el envío de un formulario con feedback visual:
     * 1. Cambia el texto del botón a "Enviando..." con spinner
     * 2. Deshabilita el botón para evitar envíos múltiples
     * 3. Después de 1.5s muestra mensaje de éxito "¡Enviado!"
     * 4. Después de 2s restablece el formulario a su estado original
     * 
     * Nota: Esta implementación es solo visual. Para un formulario
     * real, se debe integrar con un backend o servicio de email.
     */
    handleFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML; // Guardar texto original del botón
        
        // Cambiar a estado de carga
        submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            // Cambiar a estado de éxito
            submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
            submitBtn.classList.add('success');
            
            // Restablecer formulario después de mostrar el éxito
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('success');
                form.reset(); // Limpiar campos del formulario
            }, 2000);
        }, 1500);
    },

    /**
     * ============================================
     * ABRIR CHAT DE WHATSAPP
     * ============================================
     * Abre una nueva pestaña con el chat de WhatsApp de la empresa.
     * Incluye un mensaje predefinido en español que el usuario puede
     * editar antes de enviar.
     * 
     * El número de teléfono debe ser actualizado con el número real
     * de la empresa (actualmente es un ejemplo).
     */
    openWhatsApp() {
        const phone = '51950313642'; // Número de teléfono (formato internacional sin +)
        const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    },

    /**
     * ============================================
     * CARGA PEREZOSA DE IMÁGENES (LAZY LOAD)
     * ============================================
     * Implementa la carga diferida de imágenes usando IntersectionObserver.
     * Las imágenes deben tener un atributo data-src en lugar de src.
     * Cuando la imagen entra en el viewport, se carga automáticamente.
     * 
     * Esto mejora el rendimiento inicial de la página al no cargar
     * imágenes que el usuario aún no ve.
     * 
     * Uso en HTML: <img data-src="ruta/imagen.jpg" alt="...">
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        // Crear observador para detectar cuando las imágenes entran en vista
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src; // Cargar la imagen real
                    img.removeAttribute('data-src'); // Limpiar atributo temporal
                    imageObserver.unobserve(img); // Dejar de observar esta imagen
                }
            });
        });

        // Observar todas las imágenes con data-src
        images.forEach(img => imageObserver.observe(img));
    }
};

/* ============================================
   SECCIÓN 4: INICIALIZACIÓN AL CARGAR EL DOM
   ============================================
   Evento que se ejecuta cuando el DOM está completamente cargado.
   Realiza dos tareas principales:
   1. Inicializa la aplicación llamando a App.init()
   2. Controla el preloader (pantalla de carga):
      - Espera 3 segundos para mostrar la animación de carga
      - Agrega la clase 'fade-out' para iniciar la transición de salida
      - Oculta completamente el preloader después de 0.5 segundos
   
   El preloader mejor la experiencia del usuario al mostrar una
   animación mientras se cargan los recursos de la página.
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    App.init(); // Inicializar todas las funcionalidades de la aplicación

    // Control del preloader (pantalla de carga)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('fade-out'); // Iniciar animación de salida
            setTimeout(() => {
                preloader.style.display = 'none'; // Ocultar completamente
            }, 500);
        }, 3000);
    }
});

/* ============================================
   SECCIÓN 5: EXPOSICIÓN GLOBAL DEL OBJETO APP
   ============================================
   Hace que el objeto App esté disponible globalmente a través de
   window.App. Esto permite llamar a sus métodos desde cualquier
   parte del código JavaScript o desde el HTML (ej: onclick="App.openWhatsApp()").
   ============================================ */
window.App = App;
