document.documentElement.classList.add("js");

const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const icon = document.querySelector(".theme-icon");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem("portfolio-theme");
const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

function applyTheme(theme) {
  root.dataset.theme = theme;
  if (icon) icon.textContent = theme === "dark" ? "☀" : "☾";
  if (toggle) toggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  themeMeta?.setAttribute("content", theme === "dark" ? "#171721" : "#f8f8fb");
}

applyTheme(savedTheme || systemTheme);

toggle?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("portfolio-theme", next);
});

const progress = document.querySelector(".scroll-progress span");

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progress?.style.setProperty("--scroll-progress", amount.toFixed(4));
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -5%", threshold: 0.01 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
