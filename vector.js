/**
 * Represents a 2D vector.
 */
class Vector {
    /**
     * Creates a new Vector instance.
     * @param {number} x - The x-component.
     * @param {number} y - The y-component.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Adds another vector to this vector.
     * @param {Vector} other - The vector to add.
     * @returns {Vector} A new vector representing the sum.
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Subtracts another vector from this vector.
     * @param {Vector} other - The vector to subtract.
     * @returns {Vector} A new vector representing the difference.
     */
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * Multiplies this vector by a scalar.
     * @param {number} scalar - The scalar value.
     * @returns {Vector} A new vector representing the scaled vector.
     */
    mult(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number} The magnitude of the vector.
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Calculates the squared magnitude of the vector.
     * (Useful for comparisons as it avoids Math.sqrt).
     * @returns {number} The squared magnitude.
     */
     magSq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalizes the vector (makes its magnitude 1).
     * Returns a zero vector if the magnitude is 0.
     * @returns {Vector} A new vector representing the normalized vector.
     */
    normalize() {
        const len = this.mag();
        if (len === 0) {
            return new Vector(0, 0);
        }
        return new Vector(this.x / len, this.y / len);
    }

    /**
     * Creates a copy of this vector.
     * @returns {Vector} A new Vector instance with the same components.
     */
    copy() {
        return new Vector(this.x, this.y);
    }
}

// Export the Vector class for use in other modules
export { Vector };
