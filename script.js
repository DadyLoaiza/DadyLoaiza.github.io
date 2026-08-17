/* =========================================================
   CARTA DE CUMPLEAÑOS — EIMY SOFIA
   Lógica: apertura de invitación, confeti, contador regresivo,
   reproductor de música y animaciones al hacer scroll.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------
     1. ELEMENTOS PRINCIPALES
     ----------------------------------------------------- */
  const btnAbrir      = document.getElementById('btn-abrir');
  const pantallaInicio = document.getElementById('bienvenida');
  const contenido      = document.getElementById('contenido');
  const reproductor    = document.getElementById('reproductor');
  const audio          = document.getElementById('audio-fondo');
  const btnPlay        = document.getElementById('btn-play');
  const iconoPlay      = document.getElementById('icono-play');
  const controlVolumen = document.getElementById('control-volumen');

  /* -----------------------------------------------------
     2. ABRIR LA INVITACIÓN
     ----------------------------------------------------- */
  btnAbrir.addEventListener('click', () => {
    // Ráfaga de confeti para celebrar la apertura
    lanzarConfeti();

    // Ocultar pantalla de bienvenida con una transición suave
    pantallaInicio.classList.add('cerrando');

    setTimeout(() => {
      pantallaInicio.classList.add('oculto');
      contenido.classList.remove('oculto');
      reproductor.classList.remove('oculto');
      document.body.style.overflow = 'auto';
      activarRevelado();
    }, 650);

    // Intentar reproducir la música (el click cuenta como interacción
    // del usuario, por lo que cumple con las políticas de autoplay)
    intentarReproducir();
  });

  // Bloquear el scroll mientras se muestra la pantalla de bienvenida
  document.body.style.overflow = 'hidden';

  /* -----------------------------------------------------
     3. REPRODUCTOR DE MÚSICA
     ----------------------------------------------------- */
  audio.volume = controlVolumen.value / 100;

  function intentarReproducir() {
    const promesa = audio.play();
    if (promesa !== undefined) {
      promesa
        .then(() => actualizarIconoPlay(true))
        .catch(() => {
          // El navegador bloqueó el autoplay: dejamos el botón listo
          // para que la persona lo active manualmente.
          actualizarIconoPlay(false);
        });
    }
  }

  function actualizarIconoPlay(reproduciendo) {
    iconoPlay.textContent = reproduciendo ? '⏸️' : '▶️';
    btnPlay.setAttribute('aria-label', reproduciendo ? 'Pausar música' : 'Reproducir música');
  }

  btnPlay.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => actualizarIconoPlay(true)).catch(() => {});
    } else {
      audio.pause();
      actualizarIconoPlay(false);
    }
  });

  controlVolumen.addEventListener('input', () => {
    audio.volume = controlVolumen.value / 100;
  });

  /* -----------------------------------------------------
     4. CONTADOR REGRESIVO HASTA EL 29 DE AGOSTO DE 2026, 3:00 P.M.
     ----------------------------------------------------- */
  const fechaEvento = new Date('2026-08-29T15:00:00-05:00').getTime();

  const elDias     = document.getElementById('dias');
  const elHoras    = document.getElementById('horas');
  const elMinutos  = document.getElementById('minutos');
  const elSegundos = document.getElementById('segundos');
  const contadorBox   = document.getElementById('contador');
  const contadorFinal = document.getElementById('contador-final');

  let intervaloContador = null;

  function actualizarContador() {
    const ahora = new Date().getTime();
    const restante = fechaEvento - ahora;

    if (restante <= 0) {
      clearInterval(intervaloContador);
      contadorBox.classList.add('oculto');
      contadorFinal.classList.remove('oculto');
      return;
    }

    const dias    = Math.floor(restante / (1000 * 60 * 60 * 24));
    const horas   = Math.floor((restante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((restante % (1000 * 60)) / 1000);

    elDias.textContent     = String(dias).padStart(2, '0');
    elHoras.textContent    = String(horas).padStart(2, '0');
    elMinutos.textContent  = String(minutos).padStart(2, '0');
    elSegundos.textContent = String(segundos).padStart(2, '0');
  }

  actualizarContador();
  intervaloContador = setInterval(actualizarContador, 1000);

  /* -----------------------------------------------------
     5. ANIMACIÓN PROGRESIVA AL HACER SCROLL (reveal)
     ----------------------------------------------------- */
  function activarRevelado() {
    const elementos = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      elementos.forEach(el => el.classList.add('visible'));
      return;
    }

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15 });

    elementos.forEach(el => observador.observe(el));
  }

  /* -----------------------------------------------------
     6. CONFETI (canvas ligero, pensado para móviles)
     ----------------------------------------------------- */
  const lienzo = document.getElementById('confeti-canvas');
  const ctx = lienzo.getContext('2d');
  const coloresConfeti = ['#f28fb0', '#f7b8cf', '#f2c94c', '#7fa876', '#ffffff'];

  function ajustarLienzo() {
    lienzo.width = window.innerWidth;
    lienzo.height = window.innerHeight;
  }
  ajustarLienzo();
  window.addEventListener('resize', ajustarLienzo);

  function lanzarConfeti() {
    const cantidad = window.innerWidth < 500 ? 45 : 80; // menos partículas en móvil
    const particulas = [];

    for (let i = 0; i < cantidad; i++) {
      particulas.push({
        x: Math.random() * lienzo.width,
        y: -20 - Math.random() * lienzo.height * 0.3,
        tam: 5 + Math.random() * 5,
        color: coloresConfeti[Math.floor(Math.random() * coloresConfeti.length)],
        velocidadY: 2 + Math.random() * 3,
        velocidadX: -1.5 + Math.random() * 3,
        rotacion: Math.random() * 360,
        velocidadRotacion: -6 + Math.random() * 12
      });
    }

    let cuadros = 0;
    const maxCuadros = 260; // ~4-5 segundos a 60fps, se detiene solo

    function dibujar() {
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);

      particulas.forEach(p => {
        p.x += p.velocidadX;
        p.y += p.velocidadY;
        p.rotacion += p.velocidadRotacion;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotacion * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.tam / 2, -p.tam / 2, p.tam, p.tam * 0.6);
        ctx.restore();
      });

      cuadros++;
      if (cuadros < maxCuadros) {
        requestAnimationFrame(dibujar);
      } else {
        ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      }
    }

    requestAnimationFrame(dibujar);
  }

});
