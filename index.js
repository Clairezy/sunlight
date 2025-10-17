const slider = document.getElementById("daynight-slider");
const toggle = document.getElementById("daynight-toggle");
const body = document.body;

// Default mode: start in night mode (true = night, false = day)
let isDark = true;
body.classList.toggle("dark", isDark);
toggle.setAttribute("aria-pressed", String(isDark)); // accessibility: reflect initial state

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

// Compute background color from 0–100
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
// rawValue = the slider's numeric value (0–100) as the user sees it.
// We compute an effective value that the color system uses depending on isDark.
function updateUI(rawValue) {
  // If in night mode, interpret slider percentage from the *night* side:
  // this flips how the numeric slider is mapped to colors without changing the slider itself.
  const effectiveValue = isDark ? (100 - rawValue) : rawValue;

  const bgColor = interpolateColor(effectiveValue);
  body.style.backgroundColor = bgColor;

  // Contrast-aware text uses the effective value
  const textColor = effectiveValue < 50 ? "#fff" : "#0f131c";
  body.style.color = textColor;

  document.querySelectorAll(".glass-panel").forEach(panel => {
    panel.style.color = textColor;
  });

  // Show the slider number as the user expects (do NOT overwrite the slider position here)
  document.getElementById("daynight-value").textContent = `${rawValue}%`;
}

// Slider input — user moves the slider, we update UI using the slider's raw value
slider.addEventListener("input", e => {
  updateUI(parseInt(e.target.value, 10));
});

// Toggle button — flip the interpretation mode, but keep the slider where it is
toggle.addEventListener("click", () => {
  isDark = !isDark;
  body.classList.toggle("dark", isDark);
  toggle.setAttribute("aria-pressed", String(isDark));
  // Re-render using current slider value (do not change slider.value here)
  updateUI(parseInt(slider.value, 10));
});

// Spacebar toggle (same as button)
document.addEventListener("keydown", event => {
  if (event.key === " " || event.keyCode === 32) {
    event.preventDefault();
    isDark = !isDark;
    body.classList.toggle("dark", isDark);
    toggle.setAttribute("aria-pressed", String(isDark));
    updateUI(parseInt(slider.value, 10));
  }
});

// Initialize UI (keeps slider at its stored value — e.g., 49 — but renders in night mode)
updateUI(parseInt(slider.value, 10));
