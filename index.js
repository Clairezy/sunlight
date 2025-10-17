const slider = document.getElementById("daynight-slider");
const toggle = document.getElementById("daynight-toggle");
const body = document.body;

// Key colors for daytime interpolation
const keyColors = [
  { stop: 0, color: "#0f131c" },    // night
  { stop: 10, color: "#16132b" },   // dawn
  { stop: 35, color: "#9fb3bf" },   // morning
  { stop: 100, color: "#fffdfa" }   // day
];

// Helper: hex → RGB
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16)
  ];
}

// Interpolate between two RGB arrays
function lerpColor(rgb1, rgb2, t) {
  return rgb1.map((v, i) => Math.round(v + (rgb2[i] - v) * t));
}

// Compute background color from slider 0–100
function interpolateColor(value) {
  let lower = keyColors[0], upper = keyColors[keyColors.length - 1];
  for (let i = 0; i < keyColors.length - 1; i++) {
    if (value >= keyColors[i].stop && value <= keyColors[i + 1].stop) {
      lower = keyColors[i];
      upper = keyColors[i + 1];
      break;
    }
  }

  const ratio = (value - lower.stop) / (upper.stop - lower.stop);
  const rgb = lerpColor(hexToRgb(lower.color), hexToRgb(upper.color), ratio);
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

// Update background and text
function updateUI(value) {
  const bgColor = interpolateColor(value);
  body.style.backgroundColor = bgColor;

  // Contrast-aware text
  body.style.color = value < 50 ? "#fff" : "#0f131c";

  document.querySelectorAll(".glass-panel").forEach(panel => {
    panel.style.color = body.style.color;
  });

  document.getElementById("daynight-value").textContent = `${value}%`;
  slider.value = value;
}

// Slider input
slider.addEventListener("input", e => {
  updateUI(parseInt(e.target.value));
});

// Toggle button
toggle.addEventListener("click", () => {
  const isDark = body.classList.toggle("dark");
  updateUI(isDark ? 0 : 100); // night = 0, day = 100
});

// Spacebar toggle
document.addEventListener("keydown", event => {
  if (event.key === " " || event.keyCode === 32) {
    event.preventDefault();
    const isDark = body.classList.toggle("dark");
    updateUI(isDark ? 0 : 100);
  }
});

// Initialize
updateUI(parseInt(slider.value));
