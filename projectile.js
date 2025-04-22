// need the vector class
import { Vector } from './vector.js';

// constants for projectile state
const MIN_BOUNCE_VELOCITY = 0.1; // min vertical speed to bounce
const MAX_BOUNCES = 5; // max bounce count allowed

/**
 * this thing is the projectile in the simulation.
 * handles physics updates like gravity air resistance and bouncin.
 */
class Projectile {
    /**
     * makes a new projectile.
     * @param {Vector} initialPosition - the start position world coords.
     * @param {Vector} initialVelocity - the start velocity world coords.
     * @param {number} mass - the projectile mass kg.
     * @param {number} radius - the radius for drawin pixels.
     * @param {string} color - the color for drawin.
     */
    constructor(initialPosition, initialVelocity, mass = 1, radius = 5, color = '#ef4444' /* red */) {
        this.position = initialPosition.copy();
        this.velocity = initialVelocity.copy();
        this.acceleration = new Vector(0, 0);
        this.mass = mass;
        this.radius = radius; // visual radius
        this.color = color;
        this.path = [this.position.copy()]; // store where its been

        // state flags and counters
        this.isActive = true; // is it movin now
        this.bounceCount = 0;
        this.hitTarget = false; // flag set by simulationjs

        // physics params set by simulationjs
        this.restitution = 0.6; // default bounciness
        this.useAirResistance = false;
        this.dragCoefficient = 0;

        // tracked stats
        this.maxHeight = initialPosition.y;
        this.time = 0;
        this.finalRange = 0; // store range when it stops
    }

    /**
     * calculates the total force on the projectile right now.
     * includes gravity and optional air resistance.
     * @param {Vector} gravityForceVector - the force vector from gravity (mass * g).
     * @returns {Vector} the total force vector.
     */
    calculateForces(gravityForceVector) {
        let netForce = gravityForceVector; // start with gravity

        // optional air resistance (linear drag model fdrag = -c * v)
        if (this.useAirResistance && this.mass > 0 && this.dragCoefficient > 0) {
            const dragForce = this.velocity.mult(-this.dragCoefficient);
            netForce = netForce.add(dragForce);
        }

        return netForce;
    }

    /**
     * updates the projectiles state (accel velocity position) over time dt.
     * handles ground collision and bouncin.
     * @param {number} dt - the time step in seconds.
     * @param {Vector} gravityForceVector - the force vector from gravity (mass * g).
     */
    update(dt, gravityForceVector) {
        if (!this.isActive) return; // dont update if stopped

        // 1 calculate total force
        const netForce = this.calculateForces(gravityForceVector);

        // 2 calculate acceleration (a = fnet / m)
        if (this.mass > 0) {
            this.acceleration = netForce.mult(1 / this.mass);
        } else {
            this.acceleration = new Vector(0, 0); // zero mass means no accel
        }

        // 3 update velocity (v = v + a * dt)
        this.velocity = this.velocity.add(this.acceleration.mult(dt));

        // 4 update position (pos = pos + v * dt) semi-implicit euler
        this.position = this.position.add(this.velocity.mult(dt));

        // 5 update time and track max height
        this.time += dt;
        if (this.position.y > this.maxHeight) {
            this.maxHeight = this.position.y;
        }

        // 6 store current position for path drawin (optimized)
          if (this.path.length === 0 || this.position.sub(this.path[this.path.length - 1]).magSq() > 4*4) { // store if moved a bit
              this.path.push(this.position.copy());
          }

        // 7 check for ground collision and handle bounce stop
        if (this.position.y <= 0 && this.velocity.y < 0) {
            this.position.y = 0; // correct position to be on ground

            // check if bounce should happen
            if (Math.abs(this.velocity.y) > MIN_BOUNCE_VELOCITY && this.bounceCount < MAX_BOUNCES) {
                // apply bounce reverse vertical velocity and reduce by restitution
                this.velocity.y = -this.velocity.y * this.restitution;
                // optional reduce horizontal velocity due to friction
                // this.velocity.x *= 0.9;
                this.bounceCount++;
                 // add point right at bounce impact
                 this.path.push(this.position.copy());
            } else {
                // stop if velocity too low or max bounces hit
                this.velocity = new Vector(0, 0);
                this.acceleration = new Vector(0, 0);
                this.isActive = false;
                this.finalRange = this.position.x; // record final range
                 // add final restin point
                 if (this.path[this.path.length - 1].y !== 0) {
                      this.path.push(this.position.copy());
                 }
            }
        }
    }

      /**
       * draws the projectile circle.
       * @param {CanvasRenderingContext2D} ctx - the canvas context.
       * @param {function} worldToCanvas - func to convert world coords to canvas coords.
       */
      draw(ctx, worldToCanvas) {
          const canvasPos = worldToCanvas(this.position);
          ctx.fillStyle = this.hitTarget ? '#facc15' : this.color; // yellow if hit target
          ctx.beginPath();
          ctx.arc(canvasPos.x, canvasPos.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
      }

    /**
     * draws the projectiles trajectory path.
     * @param {CanvasRenderingContext2D} ctx - the canvas context.
     * @param {function} worldToCanvas - func to convert world coords to canvas coords.
     */
    drawPath(ctx, worldToCanvas) {
        if (this.path.length < 2) return;

        ctx.strokeStyle = this.color + '90'; // semi-transparent path
        ctx.lineWidth = 2;
        ctx.beginPath();
        const startPoint = worldToCanvas(this.path[0]);
        ctx.moveTo(startPoint.x, startPoint.y);
        for (let i = 1; i < this.path.length; i++) {
            const canvasPoint = worldToCanvas(this.path[i]);
            ctx.lineTo(canvasPoint.x, canvasPoint.y);
        }
        ctx.stroke();
    }
}
// export the projectile class
export { Projectile };