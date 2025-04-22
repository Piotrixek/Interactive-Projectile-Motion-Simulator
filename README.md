# Interactive Projectile Motion Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An interactive web-based projectile motion simulator built with vanilla HTML, CSS (Tailwind CSS), and modular JavaScript. This project allows users to visualize and explore the physics of projectile motion by adjusting various parameters and observing the resulting trajectory in real-time.

## Features

* **Interactive Controls:** Adjust initial speed, launch angle, initial height, mass, gravity, and bounciness (coefficient of restitution) using sliders.
* **Physics Simulation:** Models motion under constant gravity, incorporating optional linear air resistance (`F_drag = -c * v`).
* **Bouncing:** Projectiles bounce off the ground based on the selected coefficient of restitution.
* **Target Practice:** Set a target distance and width to test launch accuracy. The simulation indicates if the target was hit.
* **Ideal Trajectory:** Toggle a visual preview of the theoretical path the projectile would take without air resistance or bouncing.
* **Real-time Updates:** Trajectory path and key metrics (max height, range, time of flight, bounces) are updated as the simulation runs.
* **Responsive Design:** The interface adapts to different screen sizes.
* **Light/Dark Theme:** Switch between themes for comfortable viewing, with preferences saved in `localStorage`.
* **Modular JavaScript:** Code is organized into logical modules (`vector.js`, `projectile.js`, `simulation.js`, `ui.js`) for better maintainability.

## Technologies Used

* **HTML5:** Structure of the web page.
* **CSS3:** Styling (primarily via Tailwind CSS).
* **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
* **JavaScript (ES Modules):** Core simulation logic, DOM manipulation, and interactivity.
* **Heroicons:** Icons for the theme toggle button.

## Getting Started

### Prerequisites

* A modern web browser that supports ES Modules (e.g., Chrome, Firefox, Edge, Safari).
* A local web server is **required** to run the project due to the use of ES Modules (`import`/`export`). Opening `index.html` directly from the file system will likely cause errors.

### Running Locally

1.  **Serve the files:** Use a simple local web server.
    * **Using Python:**
        ```bash
        # If you have Python 3 installed
        python -m http.server
        # Or if the above doesn't work, try:
        # python -m SimpleHTTPServer # (Python 2)
        ```
    * **Using Node.js (requires `npm`):**
        ```bash
        # Install 'serve' globally if you haven't already
        npm install -g serve
        # Run the server
        serve .
        ```
    * **Using VS Code:** Install the "Live Server" extension, right-click `index.html` in the VS Code explorer, and select "Open with Live Server".

2.  **Open in Browser:** Navigate to the local address provided by your server (usually `http://localhost:8000`, `http://localhost:3000`, or `http://127.0.0.1:5500` for Live Server).

## File Structure

interactive-projectile-simulator/├── index.html          # Main HTML structure├── vector.js           # Vector class for 2D math├── projectile.js       # Projectile class and physics logic├── simulation.js       # Core simulation loop, canvas drawing, state management├── ui.js               # UI interactions, event handling, theme switching└── README.md           # This file
## How It Works

1.  **UI (`ui.js`):** Handles user input from sliders and buttons, updates value displays, manages theme switching, and calls functions in `simulation.js` to start/reset the simulation.
2.  **Simulation (`simulation.js`):** Initializes the canvas, manages the main animation loop (`requestAnimationFrame`), creates `Projectile` instances, updates their state each frame, handles coordinate conversions (`worldToCanvas`), draws the ground, target, and projectile path, and checks for target hits.
3.  **Projectile (`projectile.js`):** Defines the `Projectile` object, calculates forces (gravity, air resistance), updates position and velocity using Semi-Implicit Euler integration, and handles ground collisions/bouncing.
4.  **Vector (`vector.js`):** Provides a simple class for 2D vector operations (add, subtract, multiply, magnitude, normalize).
5.  **HTML/CSS:** `index.html` provides the structure, and Tailwind CSS (loaded via CDN) handles the styling and layout, including responsiveness and dark mode.

## Potential Future Improvements

* Implement more sophisticated air resistance models (e.g., quadratic drag).
* Add different projectile shapes (affecting drag).
* Allow launching multiple projectiles.
* Add obstacles to the simulation area.
* Implement collision detection between multiple projectiles.
* Add sound effects for launch and bounce.
* Incorporate charts to visualize energy changes over time.
* Refactor physics updates to use a more stable integrator (e.g., Verlet or RK4) if needed for more complex scenarios.

## Contributing

Contributions are welcome! If you have suggestions or find bugs, please open an issue or submit a pull request.

