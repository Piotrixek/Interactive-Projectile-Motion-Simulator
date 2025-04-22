// Import simulation control and drawing functions
import { initSimulation, startSimulation, resetSimulation, calculateIdealTrajectory, drawIdealPath } from './simulation.js';

// --- DOM Element References ---
let initialSpeedSlider, launchAngleSlider, initialHeightSlider, massSlider, gravitySlider, restitutionSlider, targetXSlider, targetWidthSlider;
let initialSpeedValue, launchAngleValue, initialHeightValue, massValue, gravityValue, restitutionValue, targetXValue, targetWidthValue;
let airResistanceCheckbox, showIdealCheckbox;
let launchButton, resetButton;
let maxHeightInfo, rangeInfo, timeInfo, bounceCountInfo, targetStatus;
let canvasElement;
let themeToggleButton, themeIcon; // Elements for theme switching

// --- SVG Icons for Theme Toggle ---
const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
</svg>`;

const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
</svg>`;


// --- Theme Management ---
/**
 * Applies the theme (light/dark) based on localStorage or system preference.
 */
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (isDark) {
        document.documentElement.classList.add('dark');
        themeIcon.innerHTML = sunIcon; // Show sun icon in dark mode
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.innerHTML = moonIcon; // Show moon icon in light mode
    }
}

/**
 * Toggles the theme between light and dark.
 */
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.innerHTML = isDark ? sunIcon : moonIcon;
     // Optional: Redraw simulation if needed after theme change
     // resetSimulation();
     // handleIdealTrajectoryChange();
}

// --- UI Update Functions ---

/**
 * Updates the text display next to a slider/input.
 */
function updateSliderValue(slider, display, unit, precision = 1) {
    if (!slider || !display) return;
    const value = parseFloat(slider.value).toFixed(precision);
    display.textContent = `${value}${unit}`;
}

/**
 * Reads the current simulation parameters from all UI controls.
 */
function getSimulationParameters() {
    if (!initialSpeedSlider) {
        console.error("Cannot read parameters: UI elements not initialized.");
        return null;
    }
    return {
        initialSpeed: parseFloat(initialSpeedSlider.value),
        launchAngle: parseFloat(launchAngleSlider.value),
        initialHeight: parseFloat(initialHeightSlider.value),
        mass: parseFloat(massSlider.value),
        gravity: parseFloat(gravitySlider.value),
        restitution: parseFloat(restitutionSlider.value),
        targetX: parseFloat(targetXSlider.value),
        targetWidth: parseFloat(targetWidthSlider.value),
        useAirResistance: airResistanceCheckbox.checked,
        showIdeal: showIdealCheckbox.checked,
    };
}

/**
* Updates the statistics display panel.
*/
function updateInfoDisplay(data) {
    if (!maxHeightInfo) return;
    const format = (value, unit, precision = 2) => (typeof value === 'number' ? `${value.toFixed(precision)}${unit}` : '--');
    const formatInt = (value) => (typeof value === 'number' ? `${value}` : '--');

    maxHeightInfo.textContent = format(data.maxHeight, ' m');
    rangeInfo.textContent = format(data.range, ' m');
    timeInfo.textContent = format(data.time, ' s');
    bounceCountInfo.textContent = formatInt(data.bounces);
}

/**
 * Updates the target hit/miss status display.
 */
function updateTargetStatus(hit) {
     if (!targetStatus) return;
     if (hit === true) {
         targetStatus.textContent = "Hit!";
         targetStatus.className = 'hit';
     } else if (hit === false) {
         targetStatus.textContent = "Miss";
         targetStatus.className = 'miss';
     } else {
         targetStatus.textContent = "Pending...";
         targetStatus.className = 'pending';
     }
}

/**
 * Handles changes to parameters that affect the ideal trajectory preview.
 */
function handleIdealTrajectoryChange() {
    const params = getSimulationParameters();
    if (!params) return; // Exit if params couldn't be read

    // Trigger simulation reset first to clear canvas and redraw static elements
    resetSimulation();

    if (params.showIdeal) {
        calculateIdealTrajectory(params);
        // Draw the ideal path on the newly cleared canvas
        drawIdealPath();
    }
}


/**
 * Initializes the UI elements: gets references, sets up event listeners,
 * applies the theme, and triggers the initialization of the simulation module.
 */
function initUI() {
    // Get references to all interactive DOM elements
    initialSpeedSlider = document.getElementById('initialSpeed');
    launchAngleSlider = document.getElementById('launchAngle');
    initialHeightSlider = document.getElementById('initialHeight');
    massSlider = document.getElementById('mass');
    gravitySlider = document.getElementById('gravity');
    restitutionSlider = document.getElementById('restitution');
    targetXSlider = document.getElementById('targetX');
    targetWidthSlider = document.getElementById('targetWidth');

    initialSpeedValue = document.getElementById('initialSpeedValue');
    launchAngleValue = document.getElementById('launchAngleValue');
    initialHeightValue = document.getElementById('initialHeightValue');
    massValue = document.getElementById('massValue');
    gravityValue = document.getElementById('gravityValue');
    restitutionValue = document.getElementById('restitutionValue');
    targetXValue = document.getElementById('targetXValue');
    targetWidthValue = document.getElementById('targetWidthValue');

    airResistanceCheckbox = document.getElementById('airResistance');
    showIdealCheckbox = document.getElementById('showIdeal');

    launchButton = document.getElementById('launchButton');
    resetButton = document.getElementById('resetButton');

    maxHeightInfo = document.getElementById('maxHeightInfo');
    rangeInfo = document.getElementById('rangeInfo');
    timeInfo = document.getElementById('timeInfo');
    bounceCountInfo = document.getElementById('bounceCountInfo');
    targetStatus = document.getElementById('targetStatus');

    canvasElement = document.getElementById('simulationCanvas');
    themeToggleButton = document.getElementById('themeToggleButton');
    themeIcon = document.getElementById('themeIcon'); // Get the SVG container

    // Check for critical elements
     const criticalElements = [
        initialSpeedSlider, launchAngleSlider, gravitySlider, restitutionSlider, targetXSlider,
        launchButton, resetButton, canvasElement, maxHeightInfo, targetStatus, themeToggleButton, themeIcon
     ];
     if (criticalElements.some(el => !el)) {
        console.error("One or more critical UI elements could not be found. Check HTML IDs.");
        // Optionally disable parts of the UI or show an error message
        return;
    }

    // --- Initialize Theme ---
    applyTheme(); // Apply theme early
    themeToggleButton.addEventListener('click', toggleTheme);

    // --- Initialize Slider Value Displays ---
    updateSliderValue(initialSpeedSlider, initialSpeedValue, ' m/s', 0);
    updateSliderValue(launchAngleSlider, launchAngleValue, '°', 0);
    updateSliderValue(initialHeightSlider, initialHeightValue, ' m', 1);
    updateSliderValue(massSlider, massValue, ' kg', 1);
    updateSliderValue(gravitySlider, gravityValue, ' m/s²', 1);
    updateSliderValue(restitutionSlider, restitutionValue, '', 2);
    updateSliderValue(targetXSlider, targetXValue, ' m', 0);
    updateSliderValue(targetWidthSlider, targetWidthValue, ' m', 0);

    // --- Add Event Listeners ---
    initialSpeedSlider.addEventListener('input', () => updateSliderValue(initialSpeedSlider, initialSpeedValue, ' m/s', 0));
    launchAngleSlider.addEventListener('input', () => updateSliderValue(launchAngleSlider, launchAngleValue, '°', 0));
    initialHeightSlider.addEventListener('input', () => updateSliderValue(initialHeightSlider, initialHeightValue, ' m', 1));
    massSlider.addEventListener('input', () => updateSliderValue(massSlider, massValue, ' kg', 1));
    gravitySlider.addEventListener('input', () => updateSliderValue(gravitySlider, gravityValue, ' m/s²', 1));
    restitutionSlider.addEventListener('input', () => updateSliderValue(restitutionSlider, restitutionValue, '', 2));
    targetXSlider.addEventListener('input', () => updateSliderValue(targetXSlider, targetXValue, ' m', 0));
    targetWidthSlider.addEventListener('input', () => updateSliderValue(targetWidthSlider, targetWidthValue, ' m', 0));

    launchButton.addEventListener('click', () => {
        const params = getSimulationParameters();
        if(params) startSimulation(params);
    });
    resetButton.addEventListener('click', () => {
        handleIdealTrajectoryChange(); // Reset calls this now to handle ideal path redraw
    });

    // Listeners for changes affecting ideal trajectory or static drawing
    const idealParamsElements = [initialSpeedSlider, launchAngleSlider, initialHeightSlider, gravitySlider, showIdealCheckbox];
    idealParamsElements.forEach(el => {
        el.addEventListener('input', handleIdealTrajectoryChange);
        el.addEventListener('change', handleIdealTrajectoryChange); // Also handle change for checkbox
    });
    targetXSlider.addEventListener('input', handleIdealTrajectoryChange); // Redraw static elements
    targetWidthSlider.addEventListener('input', handleIdealTrajectoryChange); // Redraw static elements

    // --- Initialize Simulation Core ---
    initSimulation(canvasElement, updateInfoDisplay, updateTargetStatus);

    // --- Initial Setup ---
    handleIdealTrajectoryChange(); // Draw initial ideal path if checked

    console.log("Modern UI Initialized.");
}

// --- Entry Point ---
document.addEventListener('DOMContentLoaded', initUI);
