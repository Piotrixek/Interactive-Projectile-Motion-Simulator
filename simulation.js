// need vector and projectile classes
import { Vector } from './vector.js';
import { Projectile } from './projectile.js';

// --- simulation constants ---
const DEFAULT_DRAG_COEFFICIENT = 0.1; // example value for linear drag
const PIXELS_PER_METER = 10; // scale factor for visualizin
const GROUND_Y_OFFSET = 30; // pixels from bottom for the ground line
const TARGET_HEIGHT = 20; // target rectangle height in meters
const IDEAL_TRAJECTORY_STEPS = 100; // points for ideal path preview

// --- simulation state ---
let canvas = null;
let ctx = null;
let projectile = null; // holds the current projectile
let animationFrameId = null;
let lastTimestamp = 0;

// --- configurable parameters (from ui) ---
let gravityAcceleration = 9.81; // current gravity value (m/s^2)
let targetX = 150; // target center x position (m)
let targetWidth = 10; // target width (m)
let showIdealTrajectory = false; // flag to draw ideal path
let idealTrajectoryPoints = []; // store calculated points for ideal path

// --- ui update callbacks ---
let updateInfoDisplayCallback = null; // func from uijs to update stats
let updateTargetStatusCallback = null; // func from uijs to update hit miss

/**
 * converts world coords (meters y=0 at ground origin at launch)
 * to canvas coords (pixels y=0 at top).
 */
function worldToCanvas(worldPos) {
    if (!canvas) return { x: 0, y: 0 };
    const canvasX = worldPos.x * PIXELS_PER_METER;
    const canvasY = canvas.height - GROUND_Y_OFFSET - (worldPos.y * PIXELS_PER_METER);
    return { x: canvasX, y: canvasY };
}

/**
 * draws the ground line and distance markers.
 */
function drawGround() {
    if (!ctx || !canvas) return;
    const groundCanvasY = canvas.height - GROUND_Y_OFFSET;
    ctx.strokeStyle = '#22c55e'; // green
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundCanvasY);
    ctx.lineTo(canvas.width, groundCanvasY);
    ctx.stroke();

    // draw distance markers
    ctx.fillStyle = '#6b7280'; ctx.font = '10px Inter';
    ctx.lineWidth = 1; ctx.strokeStyle = '#9ca3af';
    const worldWidth = canvas.width / PIXELS_PER_METER;
    let markerInterval = 10;
    if (worldWidth > 200) markerInterval = 50;
    else if (worldWidth > 50) markerInterval = 20;

      for (let x_m = 0; x_m * PIXELS_PER_METER < canvas.width; x_m += markerInterval) {
          const markerX = x_m * PIXELS_PER_METER;
          ctx.beginPath();
          ctx.moveTo(markerX, groundCanvasY - 5);
          ctx.lineTo(markerX, groundCanvasY + 5);
          ctx.stroke();
          if (x_m > 0) {
            ctx.fillText(`${x_m}m`, markerX + 5, groundCanvasY - 8);
          }
      }
}

/**
 * draws the target rectangle.
 */
function drawTarget() {
    if (!ctx || !canvas) return;

    const targetHalfWidth_m = targetWidth / 2;
    const targetLeft_m = targetX - targetHalfWidth_m;
    const targetRight_m = targetX + targetHalfWidth_m;
    const targetBottom_m = 0; // target sits on the ground
    const targetTop_m = TARGET_HEIGHT;

    // convert target corners to canvas coords
    const topLeftCanvas = worldToCanvas(new Vector(targetLeft_m, targetTop_m));
    const bottomRightCanvas = worldToCanvas(new Vector(targetRight_m, targetBottom_m));

    const targetCanvasWidth = bottomRightCanvas.x - topLeftCanvas.x;
    const targetCanvasHeight = bottomRightCanvas.y - topLeftCanvas.y; // height is positive in canvas coords

    ctx.fillStyle = '#fbbf24'; // amber for target
    ctx.strokeStyle = '#d97706'; // darker amber border
    ctx.lineWidth = 2;

    ctx.fillRect(topLeftCanvas.x, topLeftCanvas.y, targetCanvasWidth, targetCanvasHeight);
    ctx.strokeRect(topLeftCanvas.x, topLeftCanvas.y, targetCanvasWidth, targetCanvasHeight);
}

/**
 * calculates points for the ideal trajectory (no air resistance no bounce).
 * @param {object} params - launch parameters.
 */
function calculateIdealTrajectory(params) {
    idealTrajectoryPoints = [];
    const initialPos = new Vector(0, params.initialHeight);
    const angleRad = params.launchAngle * (Math.PI / 180);
    const v0x = params.initialSpeed * Math.cos(angleRad);
    const v0y = params.initialSpeed * Math.sin(angleRad);
    const g = params.gravity; // use gravity from params

    // estimate time of flight (approximation)
    const approxTimeOfFlight = (2 * v0y) / g;
    const timeLimit = Math.max(1, approxTimeOfFlight * 1.5); // simulate a bit longer

    for (let i = 0; i <= IDEAL_TRAJECTORY_STEPS; i++) {
        const t = (i / IDEAL_TRAJECTORY_STEPS) * timeLimit;
        const x = initialPos.x + v0x * t;
        const y = initialPos.y + v0y * t - 0.5 * g * t * t;

        if (y < 0 && i > 0) { // stop if it goes below ground
             // calculate exact time it hits ground y=0
             const t_ground = (v0y + Math.sqrt(v0y*v0y + 2*g*initialPos.y)) / g;
             const x_ground = initialPos.x + v0x * t_ground;
             idealTrajectoryPoints.push(new Vector(x_ground, 0));
             break;
        }
        idealTrajectoryPoints.push(new Vector(x, y));
    }
}

/**
 * draws the pre-calculated ideal trajectory path.
 */
function drawIdealPath() {
      if (!ctx || !showIdealTrajectory || idealTrajectoryPoints.length < 2) return;

      ctx.strokeStyle = '#a3a3a3'; // gray for ideal path
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]); // dashed line
      ctx.beginPath();
      const startPoint = worldToCanvas(idealTrajectoryPoints[0]);
      ctx.moveTo(startPoint.x, startPoint.y);
      for (let i = 1; i < idealTrajectoryPoints.length; i++) {
           const canvasPoint = worldToCanvas(idealTrajectoryPoints[i]);
           ctx.lineTo(canvasPoint.x, canvasPoint.y);
      }
      ctx.stroke();
      ctx.setLineDash([]); // reset line style
}

/**
 * checks if the projectile has hit the target.
 */
function checkTargetCollision() {
    if (!projectile || projectile.hitTarget) return; // dont check if already hit

    const projPos = projectile.position;
    const targetHalfWidth_m = targetWidth / 2;
    const targetLeft_m = targetX - targetHalfWidth_m;
    const targetRight_m = targetX + targetHalfWidth_m;
    const targetBottom_m = 0;
    const targetTop_m = TARGET_HEIGHT;

    // simple aabb collision check
    if (projPos.x >= targetLeft_m && projPos.x <= targetRight_m &&
        projPos.y >= targetBottom_m && projPos.y <= targetTop_m)
    {
        projectile.hitTarget = true;
        console.log("Target Hit!");
        if (updateTargetStatusCallback) {
            updateTargetStatusCallback(true); // notify ui
        }
        // optional stop projectile or make it stick
        // projectile.isActive = false;
        // projectile.velocity = new Vector(00);
    }
}

/**
 * the main simulation loop called by requestanimationframe.
 */
function simulationLoop(timestamp) {
    if (!projectile || !ctx || !canvas || !projectile.isActive) {
          stopSimulation();
          return;
    }

    // calculate delta time (dt)
    if (lastTimestamp === 0) { lastTimestamp = timestamp; }
    const dt = (timestamp - lastTimestamp) / 1000.0;
    lastTimestamp = timestamp;
    const effectiveDt = Math.min(dt, 0.1); // limit dt

    // --- physics update ---
    const gravityForceVector = new Vector(0, -gravityAcceleration * projectile.mass); // f = mg
    projectile.update(effectiveDt, gravityForceVector);

    // --- collision checks ---
    checkTargetCollision(); // check if hit target this frame

    // --- drawing phase ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawTarget();
    drawIdealPath(); // draw ideal path if enabled
    projectile.drawPath(ctx, worldToCanvas);
    projectile.draw(ctx, worldToCanvas);

    // --- update ui stats (live) ---
      if (updateInfoDisplayCallback) {
          updateInfoDisplayCallback({
              maxHeight: projectile.maxHeight,
              // show current range while active final range when stopped
              range: projectile.isActive ? projectile.position.x : projectile.finalRange,
              time: projectile.time,
              bounces: projectile.bounceCount
          });
      }

    // --- check simulation end condition ---
    if (!projectile.isActive) {
        console.log(`projectile stopped. range: ${projectile.finalRange.toFixed(2)}m max height: ${projectile.maxHeight.toFixed(2)}m time: ${projectile.time.toFixed(2)}s bounces: ${projectile.bounceCount}`);
        if (!projectile.hitTarget && updateTargetStatusCallback) {
             updateTargetStatusCallback(false); // explicitly mark as miss
        }
        stopSimulation();
    } else {
        animationFrameId = requestAnimationFrame(simulationLoop);
    }
}

/**
 * stops the current animation loop.
 */
function stopSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        lastTimestamp = 0;
        console.log("animation loop stopped.");
    }
}

/**
 * resets the simulation to its initial state.
 */
function resetSimulation() {
    stopSimulation();
    projectile = null;
    idealTrajectoryPoints = []; // clear ideal path points
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGround();
        drawTarget(); // draw static elements
    }
    // reset info display
      if (updateInfoDisplayCallback) {
        updateInfoDisplayCallback({ maxHeight: '--', range: '--', time: '--', bounces: '--' });
      }
      if (updateTargetStatusCallback) {
          updateTargetStatusCallback(null); // reset target status
      }
    console.log("simulation reset.");
}

/**
 * sets up and starts a new simulation run with the given parameters.
 * @param {object} params - parameters from the ui.
 */
function startSimulation(params) {
    if (!ctx || !canvas) {
        console.error("canvas context not available.");
        return;
    }
    console.log("startin simulation with params:", params);

    // update simulation parameters from ui
    gravityAcceleration = params.gravity;
    targetX = params.targetX;
    targetWidth = params.targetWidth;
    showIdealTrajectory = params.showIdeal;

    // reset previous run
    resetSimulation();

    // calculate initial state
    const angleRad = params.launchAngle * (Math.PI / 180);
    const v0x = params.initialSpeed * Math.cos(angleRad);
    const v0y = params.initialSpeed * Math.sin(angleRad);
    const initialPos = new Vector(0, params.initialHeight);
    const initialVel = new Vector(v0x, v0y);

    // create the projectile
    projectile = new Projectile(initialPos, initialVel, params.mass);
    projectile.restitution = params.restitution; // set bounciness
    projectile.useAirResistance = params.useAirResistance;
    projectile.dragCoefficient = params.useAirResistance ? DEFAULT_DRAG_COEFFICIENT : 0;

    // pre-calculate ideal trajectory if needed
    if (showIdealTrajectory) {
        calculateIdealTrajectory(params);
        drawIdealPath(); // draw it immediately
    }

    // start the animation loop
    lastTimestamp = 0;
    animationFrameId = requestAnimationFrame(simulationLoop);
}

/**
 * initializes the simulation environment canvas context and resizing.
 * @param {HTMLCanvasElement} canvasElement - the canvas dom element.
 * @param {function} infoCallback - callback to update stats display.
 * @param {function} targetCallback - callback to update target hit miss status.
 */
function initSimulation(canvasElement, infoCallback, targetCallback) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    updateInfoDisplayCallback = infoCallback;
    updateTargetStatusCallback = targetCallback;

    if (!ctx) {
        console.error("failed to get 2d context.");
        alert("canvas initialization failed.");
        return;
    }

    // --- responsive canvas setup ---
    const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const box = entry.devicePixelContentBoxSize?.[0] ?? entry.contentBoxSize[0];
        const newWidth = Math.round(box.inlineSize);
        const newHeight = Math.round(box.blockSize);
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            console.log(`canvas resized to ${canvas.width}x${canvas.height}`);
            if (!animationFrameId) { // redraw static elements if not running
                 resetSimulation();
            }
        }
    });
    try {
        resizeObserver.observe(canvas, {box: ['device-pixel-content-box']});
    } catch (e) {
        resizeObserver.observe(canvas, {box: ['content-box']});
    }

    // initial drawing
    resetSimulation();
    console.log("simulation initialized.");
}

// export functions needed by ui js
export { initSimulation, startSimulation, resetSimulation, calculateIdealTrajectory, drawIdealPath }; // export drawing functions for ui triggers