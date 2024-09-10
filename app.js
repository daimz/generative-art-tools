// Canvas Setup
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Array of points that will influence the grid
const points = [];

// Class to represent a point (target) with a position
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    updatePosition(newX, newY) {
        this.x += (newX - this.x) * 0.1;
        this.y += (newY - this.y) * 0.1;
    }
}

// Class to handle the grid
class Grid {
    constructor(spacing, lineLength) {
        this.spacing = spacing;
        this.lineLength = lineLength;
    }

    draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Iterate over the grid and calculate the line angles based on the points array
        for (let x = this.spacing; x < canvas.width; x += this.spacing) {
            for (let y = this.spacing; y < canvas.height; y += this.spacing) {
                Line.draw(x, y, points, this.lineLength);
            }
        }
    }

    // Generate SVG content
    generateSVG() {
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" style="background-color: black;">`;

        for (let x = this.spacing; x < canvas.width; x += this.spacing) {
            for (let y = this.spacing; y < canvas.height; y += this.spacing) {
                svgContent += Line.generateSVGLine(x, y, points, this.lineLength);
            }
        }

        svgContent += '</svg>';
        return svgContent;
    }
}

// Class to handle the line drawing
class Line {
    static draw(x, y, points, length) {
        let closestPoint = null;
        let closestDistance = Infinity;

        // Find the closest point to the current line
        for (const point of points) {
            const distance = Math.hypot(point.x - x, point.y - y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        }

        // If there is no point, don't draw the line
        if (!closestPoint) return;

        const angle = Math.atan2(closestPoint.y - y, closestPoint.x - x);
        const maxDistance = Math.hypot(canvas.width, canvas.height);

        // Adjust line width and opacity based on the distance to the closest point
        const lineWidth = Math.max(1, 10 * (1 - closestDistance / maxDistance));
        const opacity = 1 - (closestDistance / maxDistance); // Closer lines are more opaque

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.lineWidth = lineWidth;

        // Set the stroke style with opacity
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;

        ctx.beginPath();
        ctx.moveTo(-length / 2, 0);
        ctx.lineTo(length / 2, 0);
        ctx.stroke();
        ctx.restore();
    }

    static generateSVGLine(x, y, points, length) {
        let closestPoint = null;
        let closestDistance = Infinity;

        // Find the closest point to the current line
        for (const point of points) {
            const distance = Math.hypot(point.x - x, point.y - y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        }

        if (!closestPoint) return '';

        const angle = Math.atan2(closestPoint.y - y, closestPoint.x - x);
        const maxDistance = Math.hypot(canvas.width, canvas.height);
        const lineWidth = Math.max(1, 10 * (1 - closestDistance / maxDistance));
        const opacity = 1 - (closestDistance / maxDistance); // Closer lines are more opaque

        const x1 = -length / 2;
        const x2 = length / 2;

        // Add opacity to the SVG line stroke
        return `<g transform="translate(${x} ${y}) rotate(${angle * (180 / Math.PI)})">
                    <line x1="${x1}" y1="0" x2="${x2}" y2="0" stroke="rgba(255,255,255,${opacity})" stroke-width="${lineWidth}" />
                </g>`;
    }
}

// Initialize the grid
const grid = new Grid(40, 30); // Spacing: 40px, Line Length: 30px

// Animate function to continuously update the canvas
function animate() {
    // Update each point's position gradually
    points.forEach(point => point.updatePosition(point.x, point.y));
    grid.draw();
    requestAnimationFrame(animate);
}

// Track mouse clicks and add new points
canvas.addEventListener('click', (event) => {
    const point = new Point(event.clientX, event.clientY);
    points.push(point);
});

// Start the animation
animate();

// Function to download the SVG file
function downloadSVG(svgContent) {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid_art.svg';
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
}

// Add Export Button functionality
document.getElementById('exportBtn').addEventListener('click', () => {
    const svgContent = grid.generateSVG();
    downloadSVG(svgContent);
});

// Save the SVG on pressing 's'
document.addEventListener('keydown', (event) => {
    if (event.key === 's') {
        const svgContent = grid.generateSVG();
        downloadSVG(svgContent);
    }
});