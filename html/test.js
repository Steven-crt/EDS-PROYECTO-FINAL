      // Datos de los proyectos
      const proyectos = [
        {
          nombre: "Centro de Seguridad Ciudadana",
          cliente: "Municipalidad Provincial de Melgar",
          categoria: "seguridad",
          imagen: "../assets/eds_useful_images/centro_monitoreo2.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Seguridad",
          descripcion: "Sistema integral de videovigilancia con 120 cámaras HD, centro de control y software de gestión en tiempo real.",
          inversion: "S/ 4.2M",
          partners: ["Hikvision", "Dahua", "FibraTel"],
          featured: true
        },
        {
          nombre: "Semáforos Inteligentes",
          cliente: "Dist. J.L. Bustamante y Rivero",
          categoria: "comunicacion",
          imagen: "../assets/eds_useful_images/control_vehiculos.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Comunicación",
          descripcion: "Sistema semafórico inteligentes con control centralizado para 15 intersecciones con reducción del 35% en tiempos de espera.",
          inversion: "S/ 8.5M",
          partners: ["Siemens", "Sice"],
          featured: false
        },
        {
          nombre: "Radio Base de Comunicaciones",
          cliente: "Iquitos, Loreto",
          categoria: "comunicacion",
          imagen: "../assets/eds_useful_images/motorola_radio2.jpg",
          badge: "ejecucion",
          badgeText: "En Ejecución",
          categoriaText: "Comunicación",
          descripcion: "Torre de telecomunicaciones de 45m con cobertura de 50km para zonas remotas con respaldo de energía de 72h.",
          inversion: "S/ 6.8M",
          partners: ["Motorola", "Hytera"],
          featured: false
        },
        {
          nombre: "I.E. Nº 40208",
          cliente: "UGEL Arequipa Norte",
          categoria: "construccion",
          imagen: "../assets/eds_useful_images/auditorio.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Construcción",
          descripcion: "Institución educativa de 3 niveles con 18 aulas antisísmicas, laboratorios y áreas recreativas para 900 alumnos.",
          inversion: "S/ 5.1M",
          partners: ["Sika", "Cemento Yura"],
          featured: false
        },
        {
          nombre: "Video Vigilancia Industrial",
          cliente: "Complejo Industrial Arequipa",
          categoria: "seguridad",
          imagen: "../assets/eds_useful_images/camara_analisis.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Seguridad",
          descripcion: "Sistema de videovigilancia industrial con 200 cámaras IP 4K con inteligencia artificial y análisis en tiempo real.",
          inversion: "S/ 2.8M",
          partners: ["Axis", "Avigilon"],
          featured: false
        },
        {
          nombre: "Cableado Estructurado Hospital Regional",
          cliente: "Hospital Regional de Arequipa",
          categoria: "construccion",
          imagen: "../assets/eds_useful_images/cableado1.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Construcción",
          descripcion: "+2,500 puntos Cat 6A con redundancia, UPS y sistemas de monitoreo para garantizar 99.99% de uptime en operaciones hospitalarias críticas y sistemas de emergencia.",
          inversion: "S/ 3.5M",
          partners: ["Panduit", "Legrand", "APC"],
          featured: true
        },
        {
          nombre: "Alcaldía Municipal — Incendios",
          cliente: "Municipalidad Local",
          categoria: "seguridad",
          imagen: "../assets/eds_useful_images/alarma_control_building.png",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Seguridad",
          descripcion: "50+ sensores, 30 estrobos, 12 zonas de detección con central de monitoreo integrada y respuesta automática.",
          inversion: "S/ 1.3M",
          partners: ["Honeywell", "Bosch"],
          featured: false
        },
        {
          nombre: "Centro Empresarial — Telecomunicaciones",
          cliente: "Centro de Negocios Sur",
          categoria: "construccion",
          imagen: "../assets/eds_useful_images/sala_control.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Construcción",
          descripcion: "MDF con FTTH 10G, Cat 6A, UPS respaldo 48h y plan de mantenimiento preventivo anual garantizado.",
          inversion: "S/ 2.1M",
          partners: ["Cisco", "APC"],
          featured: false
        },
        {
          nombre: "Planta Solar Joya — IoT Industrial",
          cliente: "Consorcio Energético",
          categoria: "energia",
          imagen: "../assets/eds_useful_images/iot_industrial.jpg",
          badge: "ejecucion",
          badgeText: "En Ejecución",
          categoriaText: "Energía",
          descripcion: "Supervisión SCADA con telemetría 99.9% uptime y adquisición de datos en tiempo real para optimización de paneles fotovoltaicos.",
          inversion: "S/ 12M",
          partners: ["Siemens", "Schneider"],
          featured: false
        },
        {
          nombre: "Campus Universitario — WiFi 6",
          cliente: "Universidad Privada",
          categoria: "comunicacion",
          imagen: "../assets/eds_useful_images/comunicacion_seguridad.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Comunicación",
          descripcion: "Red inalámbrica WiFi 6 con cobertura 100% del campus, firewall NGFW y capacidad para 10,000+ alumnos simultáneos.",
          inversion: "S/ 4.7M",
          partners: ["Aruba", "Palo Alto"],
          featured: false
        },
        {
          nombre: "Obras Viales — Videovigilancia",
          cliente: "Gobierno Regional",
          categoria: "seguridad",
          imagen: "../assets/eds_useful_images/camara_poste.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Seguridad",
          descripcion: "Cámaras PTZ con fibra óptica, sistema LPR vehicular integrado a la red de monitoreo de la Policía Nacional.",
          inversion: "S/ 6.5M",
          partners: ["Axis", "Motorola"],
          featured: false
        },
        {
          nombre: "Control de Accesos Biométrico",
          cliente: "Condominio Premium",
          categoria: "seguridad",
          imagen: "../assets/eds_useful_images/control_acceso1.jpg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Seguridad",
          descripcion: "Reconocimiento facial, huella dactilar y UHF vehicular con molinete doble carril y app de gestión centralizada.",
          inversion: "S/ 0.8M",
          partners: ["ZKTeco", "Hikvision"],
          featured: false
        },
        {
          nombre: "Pantallas Publicitarias Digitales",
          cliente: "Municipalidad Distrital J.L. Bustamante y Rivero",
          categoria: "energia",
          imagen: "../assets/eds_useful_images/jose luis bustamante y rivero/WhatsApp Image 2026-04-01 at 1.53.32 PM (1).jpeg",
          badge: "concluido",
          badgeText: "Concluido",
          categoriaText: "Audio/Video",
          descripcion: "6 pantallas LED 4K de gran formato con sistema de audio JBL Harman integrado y plataforma de gestión de contenido centralizada para comunicación municipal y publicidad digital.",
          inversion: "S/ 7.3M",
          partners: ["LG", "JBL Harman", "Cisco"],
          featured: true
        }
      ];

      // Renderizar proyectos
      function renderProyectos(filtro) {
        if (!filtro) filtro = 'all';
        var grid = document.getElementById('projectsGrid');
        var countEl = document.getElementById('visible-count');
        if (!grid) return;

        // Limpiar grid
        grid.innerHTML = '';

        // Filtrar proyectos
        var proyectosFiltrados = filtro === 'all'
          ? proyectos
          : proyectos.filter(function(p) { return p.categoria === filtro; });

        // Actualizar contador
        if (countEl) countEl.textContent = proyectosFiltrados.length;

        // Si no hay proyectos, mostrar mensaje
        if (proyectosFiltrados.length === 0) {
          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#6b7280;font-family:Rajdhani,sans-serif;font-size:1.1rem;">No hay proyectos en esta categoría</div>';
          return;
        }

        // Renderizar cada proyecto
        proyectosFiltrados.forEach(function(proyecto, index) {
          var card = document.createElement('div');
          card.className = 'proj-card' + (proyecto.featured ? ' featured' : '');
          card.dataset.category = proyecto.categoria;

          // Animación de entrada
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px)';
          card.style.transition = 'all 0.5s ease';

          var partnersHTML = '';
          proyecto.partners.forEach(function(p) {
            partnersHTML += '<span class="proj-partner-pill">' + p + '</span>';
          });

          card.innerHTML = '<div class="proj-card-image">' +
            '<img src="' + proyecto.imagen + '" alt="' + proyecto.nombre + '" loading="lazy" />' +
            '<span class="proj-card-badge ' + proyecto.badge + '">' + proyecto.badgeText + '</span>' +
            '<span class="proj-card-category-tag">' + proyecto.categoriaText + '</span>' +
            '</div>' +
            '<div class="proj-card-body">' +
            '<p class="proj-card-client">' + proyecto.cliente + '</p>' +
            '<h3 class="proj-card-title">' + proyecto.nombre + '</h3>' +
            '<p class="proj-card-desc">' + proyecto.descripcion + '</p>' +
            '<div class="proj-card-meta">' +
            '<div class="proj-card-investment">' + proyecto.inversion + ' <span>Inversión</span></div>' +
            '<div class="proj-card-partners">' + partnersHTML + '</div>' +
            '</div>' +
            '<div class="proj-card-action">Ver detalles <i class="fas fa-arrow-right"></i></div>' +
            '</div>';

          grid.appendChild(card);

          // Animar entrada con delay
          (function(card, idx) {
            setTimeout(function() {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, idx * 100);
          })(card, index);
        });
      }

      // Event listeners para filtros
      document.addEventListener('DOMContentLoaded', function() {
        // Renderizar todos los proyectos inicialmente
        renderProyectos('all');

        // Configurar filtros
        var chips = document.querySelectorAll('.filter-chip');
        chips.forEach(function(chip) {
          chip.addEventListener('click', function() {
            chips.forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
            var filter = chip.dataset.filter;
            renderProyectos(filter);
          });
        });

        // Ocultar preloader cuando la página esté lista
        setTimeout(function() {
          var preloader = document.getElementById('preloader');
          if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(function() {
              preloader.style.display = 'none';
            }, 500);
          }
        }, 1500);
      });
