// Header + Hero animations + navegación
document.addEventListener("DOMContentLoaded", () => {
  /* ========== HEADER ========== */
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");

  // 1) Estado sticky (color + blur al hacer scroll)
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add("is-stuck");
    else header.classList.remove("is-stuck");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // 2) Abrir/cerrar menú móvil
  if (navToggle && header) {
    navToggle.addEventListener("click", () => {
      const open = header.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // 3) Smooth scroll + cerrar menú al elegir opción
  siteNav?.querySelectorAll("a[data-route]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        header.classList.remove("menu-open");
        navToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  // 4) Active por sección (scroll-espía simple)
  const links = Array.from(siteNav?.querySelectorAll("a[data-route]") || []);
  const targets = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) =>
            l.classList.toggle(
              "active",
              l.getAttribute("href") === `#${entry.target.id}`
            )
          );
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  targets.forEach((t) => spy.observe(t));

  // 5) Disparar fade-in del nav al cargar
  header.classList.add("nav-in");

  /* ========== HERO ========== */
  const title = document.getElementById("hero-title");

  // Palabra por palabra
  function splitTitle(node) {
    const words = node.textContent.trim().split(" ");
    node.textContent = "";
    words.forEach((word, i) => {
      const w = document.createElement("span");
      w.className = "w";
      const s = document.createElement("span");
      s.textContent = word + (i < words.length - 1 ? " " : "");
      s.style.setProperty("--delay", `${120 + i * 60}ms`);
      w.appendChild(s);
      node.appendChild(w);
    });
  }
  if (title) {
    splitTitle(title);
    requestAnimationFrame(() => title.classList.add("in"));
  }

  // Reveal para elementos con .reveal
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("show");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((el) => io.observe(el));
});
// Header sticky + nav-in (si no lo tenías)
const header = document.querySelector(".site-header");
const onScroll = () => {
  const stuck = window.scrollY > 10;
  header?.classList.toggle("is-stuck", stuck);
  header?.classList.add("nav-in");
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Reveal escalonado en viewport
const toReveal = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const delay = e.target.style.getPropertyValue("--d") || "0ms";
        e.target.style.transitionDelay = delay;
        e.target.classList.add("show");
        io.unobserve(e.target);
      }
    });
  },
  { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
);
toReveal.forEach((el) => io.observe(el));
// Tilt 3D + luz que sigue al mouse (solo desktop con puntero fino)
(() => {
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  const cards = document.querySelectorAll(".step-card");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 8; // inclinación X
      const ry = (x - 0.5) * 10; // inclinación Y
      card.style.setProperty("--rx", rx + "deg");
      card.style.setProperty("--ry", ry + "deg");
      card.style.setProperty("--mx", (x * 100).toFixed(2) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(2) + "%");
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });
})();
// Tilt 3D para .about-tilt (solo puntero fino)
(() => {
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  const el = document.querySelector(".about-tilt");
  if (!el) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * 8;
    const ry = (x - 0.5) * 10;
    el.style.setProperty("--rx", rx + "deg");
    el.style.setProperty("--ry", ry + "deg");
  });
  ["pointerleave", "blur"].forEach((type) =>
    el.addEventListener(type, () => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    })
  );
})();
// ===== Escritura letra por letra para listas con bullets =====
function typeList(
  selector,
  {
    speed = 28, // ms por carácter
    linePause = 260, // pausa entre líneas
    cursor = true,
  } = {}
) {
  const root = document.querySelector(selector);
  if (!root) return;

  const items = Array.from(root.querySelectorAll("li"));
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Marca que la lista está en modo "typing"
  root.classList.add("bt-typing");

  // Si el usuario prefiere reducir animaciones, mostrar todo y salir
  if (prefersReduced) {
    items.forEach((li) => {
      li.textContent = li.dataset.text || li.textContent;
      li.classList.add("show");
    });
    root.classList.remove("bt-typing");
    return;
  }

  (async () => {
    for (const li of items) {
      const text = (li.dataset.text || li.textContent || "").trim();
      li.textContent = ""; // limpiar el contenido visible
      li.classList.add("show"); // hacer visible la línea (controlado por CSS)

      let caret;
      if (cursor) {
        caret = document.createElement("span");
        caret.className = "cursor";
        li.appendChild(caret);
      }

      for (let i = 0; i < text.length; i++) {
        if (caret) {
          caret.before(document.createTextNode(text[i]));
        } else {
          li.append(text[i]);
        }
        await new Promise((r) => setTimeout(r, speed));
      }

      if (caret) caret.remove();
      await new Promise((r) => setTimeout(r, linePause));
    }

    // terminado: quitamos la clase para dejar todo 100% visible
    root.classList.remove("bt-typing");
  })();
}

/* ========= Utilidades ========= */
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Escribe texto en un solo TextNode (suave con rAF) */
async function typeText(node, text, msPerChar = 36) {
  const tnode = document.createTextNode("");
  node.textContent = "";
  node.appendChild(tnode);

  let shown = 0;
  const start = performance.now();
  while (shown < text.length) {
    await nextFrame();
    const elapsed = performance.now() - start;
    const should = Math.floor(elapsed / msPerChar);
    if (should > shown) {
      tnode.data += text.slice(shown, should);
      shown = should;
    }
  }
}

/* Escribe la lista, línea por línea */
async function typeListOnce(
  root,
  { speed = 36, linePause = 280, cursor = true } = {}
) {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const items = Array.from(root.querySelectorAll("li"));

  root.classList.add("bt-typing");

  if (prefersReduced) {
    items.forEach((li) => {
      const t = (li.dataset.text || li.textContent || "").trim();
      li.innerHTML = `<span class="bt-text">${t}</span>`;
      li.classList.add("show");
    });
    root.classList.remove("bt-typing");
    return;
  }

  for (const li of items) {
    const text = (li.dataset.text || li.textContent || "").trim();
    li.classList.add("show");
    li.innerHTML = `<span class="bt-text"></span>`;
    const tspan = li.querySelector(".bt-text");

    let caret;
    if (cursor) {
      caret = document.createElement("span");
      caret.className = "cursor";
      li.appendChild(caret);
    }

    await typeText(tspan, text, speed);

    if (caret) caret.remove();
    await sleep(linePause);
  }

  root.classList.remove("bt-typing");
}

/* Repite la animación cada vez que entra al viewport (sin rebotes) */
function setupTypingOnView(selector, options = {}) {
  const root = document.querySelector(selector);
  if (!root) return;

  const originals = Array.from(root.querySelectorAll("li")).map((li) =>
    (li.dataset.text || li.textContent || "").trim()
  );

  const reset = () => {
    root.querySelectorAll("li").forEach((li, i) => {
      li.classList.remove("show");
      li.innerHTML = `<span class="bt-text">${originals[i]}</span>`;
    });
  };

  let running = false;
  let inside = false;

  const run = async () => {
    if (running) return;
    running = true;
    await typeListOnce(root, options);
    running = false;
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.6 && !inside) {
          inside = true;
          reset();
          run();
        } else if (entry.intersectionRatio < 0.1 && inside) {
          inside = false;
          reset();
          root.classList.remove("bt-typing");
        }
      });
    },
    { threshold: [0, 0.1, 0.6, 1] }
  );

  reset();
  io.observe(root);
}

/* Init único */
document.addEventListener("DOMContentLoaded", () => {
  // <ul id="beneficiosTyping" class="bullet-typing sub bt-plus">...</ul>
  setupTypingOnView("#beneficiosTyping", {
    // un toque más lento pero fluido; subí a 38–40 si querés más “tranqui”
    speed: 36,
    linePause: 280,
    cursor: true,
  });
});
// ===== Proyectos (foto real) · autoplay + restart =====
(function () {
  const vids = Array.from(document.querySelectorAll(".mock-photo .screen"));
  if (!vids.length) return;

  vids.forEach((v) => {
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
  });

  const ensureStart = (v) => {
    // Si aún no cargó metadatos, esperar y luego setear a 0
    if (v.readyState < 1) {
      v.addEventListener(
        "loadedmetadata",
        () => {
          try {
            v.currentTime = 0;
          } catch (e) {}
        },
        { once: true }
      );
    } else {
      try {
        v.currentTime = 0;
      } catch (e) {}
    }
  };

  const onView = (entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        // Reinicia desde el principio y reproduce
        ensureStart(v);
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  const io = new IntersectionObserver(onView, { threshold: 0.35 });
  vids.forEach((v) => io.observe(v));

  // Pausar si la pestaña se oculta; reanudar y reiniciar al volver a foco si está visible
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        vids.forEach((v) => v.pause());
      } else {
        vids.forEach((v) => {
          const r = v.getBoundingClientRect();
          const inView =
            r.top < innerHeight * 0.65 && r.bottom > innerHeight * 0.35;
          if (inView) {
            ensureStart(v);
            v.play().catch(() => {});
          }
        });
      }
    },
    { passive: true }
  );
})();
// ===== Proyectos flotantes · autoplay, pausa fuera de vista y reinicio =====
(function () {
  const vids = Array.from(document.querySelectorAll(".mock-photo .screen"));
  if (!vids.length) return;

  vids.forEach((v) => {
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
  });

  const restartToZero = (v) => {
    if (v.readyState < 1) {
      v.addEventListener(
        "loadedmetadata",
        () => {
          try {
            v.currentTime = 0;
          } catch (e) {}
        },
        { once: true }
      );
    } else {
      try {
        v.currentTime = 0;
      } catch (e) {}
    }
  };

  const onView = (entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        restartToZero(v); // arranca desde el principio
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  const io = new IntersectionObserver(onView, { threshold: 0.35 });
  vids.forEach((v) => io.observe(v));

  // Pausa si la pestaña se oculta; reanuda y reinicia cuando vuelve a foco y está visible
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        vids.forEach((v) => v.pause());
      } else {
        vids.forEach((v) => {
          const r = v.getBoundingClientRect();
          const visible =
            r.top < innerHeight * 0.65 && r.bottom > innerHeight * 0.35;
          if (visible) {
            restartToZero(v);
            v.play().catch(() => {});
          }
        });
      }
    },
    { passive: true }
  );
})();
// Reveal on scroll SIN tocar .laptop* ni tamaños
document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(
    "#proyectos .pf-head, #proyectos .pf-stack > .proj-row"
  );

  if (reduce) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
  );

  targets.forEach((el) => io.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("yy");
  if (y) y.textContent = new Date().getFullYear();
});
// ==== Feature flags según dispositivo / accesibilidad ====
const canHover = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ================== Tilt en tarjetas ==================
(function tiltCards() {
  if (!canHover || reduceMotion) return;
  const tiles = document.querySelectorAll(".contact-tile");
  if (!tiles.length) return;

  tiles.forEach((tile) => {
    let raf;
    const onMove = (e) => {
      const r = tile.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const rx = y * -6;
      const ry = x * 8;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Mantenemos el "lift" de hover y rotamos suave
        tile.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      });
    };

    const onLeave = () => {
      tile.style.transform = "";
    };

    tile.addEventListener("pointermove", onMove, { passive: true });
    tile.addEventListener("pointerleave", onLeave, { passive: true });
  });
})();

// ============== Parallax de la figura (desactivado si pointer-events:none) ==============
(function sceneParallax() {
  const scene = document.getElementById("scene3d");
  if (!scene || reduceMotion) return;

  // Si el CSS la dejó sin interacción, no hacemos nada (evita que "se vaya").
  if (getComputedStyle(scene).pointerEvents === "none") return;

  const layers = scene.querySelectorAll(".layer");
  if (!layers.length) return;

  // Guardar transform base de cada capa para no acumular
  layers.forEach((el) => {
    el.__baseTransform =
      getComputedStyle(el).transform === "none"
        ? ""
        : getComputedStyle(el).transform;
  });

  let raf;
  const onMove = (e) => {
    const r = scene.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      layers.forEach((el, i) => {
        const depth = (i + 1) * 4; // más índice, más parallax
        el.style.transform = `${el.__baseTransform} translateX(${
          x * depth
        }px) translateY(${y * depth}px)`;
      });
    });
  };

  const onLeave = () => {
    layers.forEach((el) => {
      el.style.transform = el.__baseTransform || "";
    });
  };

  scene.addEventListener("pointermove", onMove, { passive: true });
  scene.addEventListener("pointerleave", onLeave, { passive: true });
})();
