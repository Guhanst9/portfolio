document.documentElement.classList.add("js");

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const savedTheme = localStorage.getItem("portfolio-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

function setTheme(theme) {
  root.dataset.theme = theme;
  if (themeIcon) themeIcon.textContent = theme === "dark" ? "☼" : "☾";
  if (themeToggle) themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
}

setTheme(savedTheme || preferredTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
});

const progress = document.querySelector(".scroll-progress span");
const parallax = document.querySelector("[data-parallax]");
let frameRequested = false;

function updateScrollEffects() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const value = available > 0 ? Math.min(window.scrollY / available, 1) : 0;
  progress?.style.setProperty("--scroll-progress", value.toFixed(4));

  if (parallax && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const rect = parallax.getBoundingClientRect();
    const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    parallax.style.transform = `translate3d(0, ${centerOffset * -22}px, 0)`;
  }
  frameRequested = false;
}

window.addEventListener("scroll", () => {
  if (!frameRequested) {
    frameRequested = true;
    requestAnimationFrame(updateScrollEffects);
  }
}, { passive: true });

updateScrollEffects();

const revealItems = document.querySelectorAll("[data-reveal]");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: "0px 0px -12%", threshold: 0.08 });

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(item);
});

const canvas = document.querySelector("#field-canvas");

if (canvas) {
  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let points = [];
  let animationFrame;

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = Array.from({ length: 34 }, (_, index) => ({
      x: (index * 73 % 101) / 101 * width,
      y: (index * 47 % 97) / 97 * height,
      radius: 1 + (index % 3) * 0.55,
      speed: 0.08 + (index % 5) * 0.018,
      phase: index * 0.62
    }));
  }

  function drawField(time = 0) {
    const styles = getComputedStyle(root);
    const surface = styles.getPropertyValue("--surface").trim();
    const ink = styles.getPropertyValue("--text").trim();
    const accent = styles.getPropertyValue("--accent").trim();
    context.fillStyle = surface;
    context.fillRect(0, 0, width, height);

    points.forEach((point, index) => {
      const offset = reducedMotion.matches ? 0 : Math.sin(time * point.speed * 0.01 + point.phase) * 9;
      const x = point.x + offset;
      const y = point.y + Math.cos(time * point.speed * 0.008 + point.phase) * 7;
      context.beginPath();
      context.fillStyle = index % 7 === 0 ? accent : ink;
      context.globalAlpha = index % 7 === 0 ? 0.92 : 0.28;
      context.arc(x, y, point.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 0.1;
    context.strokeStyle = ink;
    points.slice(0, 16).forEach((point, index) => {
      const next = points[(index * 3 + 7) % points.length];
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    });
    context.globalAlpha = 1;

    if (!reducedMotion.matches) animationFrame = requestAnimationFrame(drawField);
  }

  const canvasObserver = new ResizeObserver(() => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    drawField();
  });

  canvasObserver.observe(canvas);
  reducedMotion.addEventListener("change", () => {
    cancelAnimationFrame(animationFrame);
    drawField();
  });
}
