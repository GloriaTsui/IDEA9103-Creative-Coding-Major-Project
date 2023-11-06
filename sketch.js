let radii;//Define an array and use it to store the radii of concentric circles.
let colorsList = []; // Define a two-dimensional array and use it to store the colours at each position.
let startColors = {}; // Object to store the initial colors
let endColors = {}; // Object to store the end colors
let colorLerpDuration = 100; // Define the duration in frames for the color transition
let startBackgroundColor; 
let endBackgroundColor; 
let backgroundLerpDuration = 8000; // Set an eight seconds duration for background color lerp
let lastBackgroundLerpTime = 0; // Timestamp of the last background color lerp
let balls = []; // Define an array and use it to store instances of the ball class

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight); // Create a canvas that fills the window
  canvas.style('display', 'block');// Set the display of the canvas to 'block' to avoid layout confusion of the graphics
  

  // Initialize grid width, height and size of hexagons
  gridWidth = windowWidth;
  gridHeight = windowHeight;
  hexagonSize = windowWidth/5;
  // Set background color
  background(4, 81, 123);
  // Set angle mode to degrees
  angleMode(DEGREES);

  // Initialize a set of redii for concentric circles
  radii = [hexagonSize * 0.35, hexagonSize * 0.2, hexagonSize * 0.1];
  redraw();

  // Initialize the background color lerp
  startBackgroundColor = color(random(255), random(255), random(255));
  endBackgroundColor = color(random(255), random(255), random(255));

  // Create 50 balls and add them to the 'balls' array
  for (i = 0; i < 50; i++) {
    balls.push(new Ball(
      createVector(random(width),random(height)), // Randomly set the initial positions of the balls
      p5.Vector.random2D().mult(random(100)), // Randomly set the initial velocity
      300,
      color(random(255),random(255),random(255)) // Randomly set the color of the balls
    ));
    // Set the stroke weight for each ball to 5
    balls[i].strokeWeight = 5; 
  }
}

// Adjust the size of the canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Define a function to draw six white dots with orange and brown edges at the vertices of the hexagon
// Then draw the hexagonal honeycomb grid with twisted lines
function drawTwistedLine(cX, cY, r, col, row) {
  // Get the current position’s color list
  let colors = getColorsForPosition(row, col);
  // Set the first color of the list as the fill color
  fill(colors[0]);

  for (let a = 0; a < 360; a += 60) {
    // Calculate current vertice’s coordinates. 
    let x1 = cX + r * cos(a);
    let y1 = cY + r * sin(a);

    // Draw a white circle and a larger brown concentric circle at each vertex, then set the stroke to orange.
    push();
    strokeWeight(3); // Set the strokeWeight to 3
    stroke(255, 100, 0); // Set the stroke color to orange
    fill(101, 67, 33); // Set fill color to dark brown
    ellipse(x1, y1, r * 0.2, r * 0.2); // Draw dark brown concentric circles
    pop();

    push();
    noStroke(); // No fill
    fill(255); // Set fill color to white
    ellipse(x1, y1, r * 0.1, r * 0.1); // Draw white dotted circles
    pop();


    // Draw a hexagonal honeycomb grid of twisted lines
    // Calculate the vertex coordinates of the immediately preceding vertex
    let x2 = cX + r * cos(a + 60);
    let y2 = cY + r * sin(a + 60);

    // Divide the line between the vertex of the hexagon and the immediately adjacent vertex into two segments, and draw two interlaced Bezier curves for each segment
    let segments = 2; 
    for (let i = 0; i < segments; i++) {
      // Calculate the starting point coordinates of each line segment
      let startX = lerp(x1, x2, i / segments);// The X coordinate of the starting point of the current segment
      let startY = lerp(y1, y2, i / segments);// The X coordinate of the starting point of the current segment

      // Calculate the end point coordinates of each line segment
      let endX = lerp(x1, x2, (i + 1) / segments);// X coordinate of the end point of the current segment
      let endY = lerp(y1, y2, (i + 1) / segments);// Y coordinate of the end point of the current segment

      // Calculate the midpoint coordinates of each line segment to determine the control points of the Bezier curve
      let midX = (startX + endX) / 2;
      let midY = (startY + endY) / 2;

      // Calculate the first control point of the Bezier curve
      let ControlPoint1x = midX + (startY - endY) * 0.3; // Control the X coordinate of point 1 and adjust 0.3 to change the distance of the control point
      let ControlPoint1y = midY + (endX - startX) * 0.3; // Control the Y coordinate of point 1 and adjust 0.3 to change the distance of the control point

      // Calculate the second control point of the Bezier curve
      let ControlPoint2x = midX - (startY - endY) * 0.3; // Control the X coordinate of point 2 and adjust 0.3 to change the distance of the control point
      let ControlPoint2y = midY - (endX - startX) * 0.3; // Control the Y coordinate of point 2 and adjust 0.3 to change the distance of the control point


      // Draw the first Bezier curve
      beginShape();
      vertex(startX, startY);// Define start points
      bezierVertex(ControlPoint1x, ControlPoint1y, ControlPoint2x, ControlPoint2y, endX, endY);
      //Define two control points and end points of another Bezier curve,
      endShape();

      // Draw the second Bezier curve
      beginShape();
      vertex(startX, startY);// Define the start points
      bezierVertex(ControlPoint2x, ControlPoint2y, ControlPoint1x, ControlPoint1y, endX, endY);
      // Define two control points and end points of another Bezier curve,
      // The order of the control points of this curve is opposite to that of the previous curve to form a twisted line
      endShape();

    }
  }
}

// Define a function to draw concentric circles and dotted rings
function drawConcentricCirclesAndDots(cX, cY, radii, col, row) {
  // Get the color list of the current location
  let colors = getColorsForPosition(row, col);
  new ConcentricCirclesAndDots(cX, cY, radii, colors).draw();
}

// Define a class to draw dotted circles
class DottedCircle {
  constructor(cX, cY, r, dotRadius, color) {
    this.cX = cX;
    this.cY = cY;
    this.r = r;
    this.dotRadius = dotRadius;
    this.color = color;
  }

  draw(rotationAngle) {
    push();
    stroke(this.color);

    //Take the center of the hexagon as the center of the ring, 
    //and draw a small dot every 15 degrees to form a ring
    for (let a = 0; a < 360; a += 15) {
      // Use trigonometric functions to calculate the coordinates of the current small circle
      let x = this.cX + this.r * cos(a + rotationAngle);
      let y = this.cY + this.r * sin(a + rotationAngle);
      ellipse(x, y, this.dotRadius, this.dotRadius);
    }
    pop();
  }
}

// Define a class to draw concentric circles and dotted rings
class ConcentricCirclesAndDots {
  constructor(cX, cY, radii, colors) {
    this.cX = cX;
    this.cY = cY;
    this.radii = radii;
    this.colors = colors;
  }

// Using the center of the hexagon as the center of the circle, 
// draw three concentric circles and the small dots between the concentric circles
  draw() {
    push();

    // Loop through the three sets of data in the radius array
    // and draw concentric circles using the stored colours
    for (let i = 0; i < this.radii.length; i++) {
      fill(this.colors[i + 1]);
      ellipse(this.cX, this.cY, this.radii[i] * 2, this.radii[i] * 2);
    }

    // Calculate the radii of three rings formed by small dots
    let r1 = (this.radii[0] + this.radii[1]) / 2 * 0.85;
    let r2 = r1 * 1.15;
    let r3 = r2 * 1.15

    // Draw dotted rings with rotation based on frame count
    new DottedCircle(this.cX, this.cY, r1, r1 * 0.1, this.colors[4]).draw(frameCount * 0.3);
    new DottedCircle(this.cX, this.cY, r2, r1 * 0.12, this.colors[5]).draw(frameCount * 0.4);
    new DottedCircle(this.cX, this.cY, r3, r1 * 0.13, this.colors[6]).draw(frameCount * 0.5); // Set each ring a different rotation speed
    
    pop();
  }
}

// Define a class to draw bouncing balls
class Ball {
  // Initialize properties of the ball
  constructor(pos, vel, radius, color) {
    this.pos = pos; // Vector to represent position of the ball
    this.vel = vel; // Vector to represent velocity of the ball
    this.radius = radius;
    this.color = color;
  }

  // Create collisions between balls
  collide(other) {
    if (other == this) {
      return;
    }

    // Calculate the relative position vector between a ball and the others
    let relative = p5.Vector.sub(other.pos, this.pos);
    // Calculate the distance betwween centers of two balls
    let dist = relative.mag() - (this.radius + other.radius);
    // Detect the collisions of the balls
    if (dist < 0) {
      // Moves the balls apart to finish collision
      let movement = relative.copy().setMag(abs(dist/4));
      this.pos.sub(movement);
      other.pos.add(movement);
      
      // Calculate the normal vector pointing from one ball to the others
      let thisToOtherNormal = relative.copy().normalize();
      // Calculate the relative approach speed of the two balls
      let approachSpeed = this.vel.dot(thisToOtherNormal) + -other.vel.dot(thisToOtherNormal);
      // Calculate the approach vector based on the relative approach speed
      let approachVector = thisToOtherNormal.copy().setMag(approachSpeed);
      // Adjust the velocities of the two balls to reflect the collision
      this.vel.sub(approachVector);
      other.vel.add(approachVector);
    }
  }

  move() {
    this.pos.add(this.vel); // Add the velocity vector to update the position

    // Check the boundary of the canvas
    let halfCanvasWidth = width / 2;
    let halfCanvasHeight = height / 2;

    // Adjust the position based on translation and rotation
    let rotatedX = this.pos.x * cos(-15) - this.pos.y * sin(-15);
    let rotatedY = this.pos.x * sin(-15) + this.pos.y * cos(-15);

    if (rotatedX - this.radius < -halfCanvasWidth || rotatedX + this.radius > halfCanvasWidth) {
    // If the rotated X position is beyond the left or right boundary, let the balls bounce back
    this.vel.x *= -1;
    }

    if (rotatedY - this.radius < -halfCanvasHeight || rotatedY + this.radius > halfCanvasHeight) {
    // If the rotated Y position is beyond the top or bottom boundary, let the balls bounce back
    this.vel.y *= -1;
    }
  }
  
  render() {
    noFill(); 
  stroke(this.color); // Set random stroke color
  strokeWeight(this.strokeWeight); // Set the stroke weight
  ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }
}

// Fill twisted lines, concentric circles, and dots with random colors:
// Get the color based on the row and column position of the grid
function getColorsForPosition(row, col) {

  if (!colorsList[row]) colorsList[row] = [];

  
  if (!colorsList[row][col]) {
    // Initialize the colorlist with random colors
    colorsList[row][col] = generateRandomColors();
    startColors[`${row},${col}`] = [...colorsList[row][col]]; // Copy initial colors
    endColors[`${row},${col}`] = generateRandomColors(); // Generate a new set for end colors
  }

  // Calculate lerp amount within the duration, then adjust the progress of the color transition
  let lerpAmount = (frameCount % colorLerpDuration) / (colorLerpDuration * 10);

  // Lerp the colors
  for (let i = 0; i < colorsList[row][col].length; i++) {
    colorsList[row][col][i] = lerpColor(startColors[`${row},${col}`][i], endColors[`${row},${col}`][i], lerpAmount);
  }

  // Continuously update the start colors
  startColors[`${row},${col}`] = [...colorsList[row][col]];

  // If one transition is completed, restart a new transition
  if (frameCount % colorLerpDuration === 0) {
    endColors[`${row},${col}`] = generateRandomColors(); // Generate new end colors
  }


  return colorsList[row][col];
}

// Define a function to generate a set of random colors
function generateRandomColors() {
  let colorsForThisSet = [];
  // Generate colors for twisted lines and concentric circles
  for (let i = 0; i < radii.length + 4; i++) { // +4 for the lines and the set of three dots
    colorsForThisSet.push(color(random(255), random(255), random(255)));
  }
  return colorsForThisSet;
}

function makeGrid() {
  let count = 0;// init counter
  
  // Adjust the starting position of the entire grid so that it fully displays on the canvas
  let offsetX = -width / 2;
  let offsetY = -height / 2;

  // Draw the base grid using a hexagonal honeycomb grid frame
  for (let y = offsetY *1.4, row = 0; y < gridHeight; y += hexagonSize / 2.3, row++) {
    for (let x = offsetX *1.2, col = 0; x < gridWidth; x += hexagonSize * 1.5, col++) {
      let hexCenterX = x + hexagonSize * (count % 2 == 0) * 0.75;
      let hexCenterY = y;

      // Call the drawTwistedLine function to draw twisted lines 
      drawTwistedLine(hexCenterX, hexCenterY, hexagonSize / 2, col, row);
      // Call drawConcentricCircles function to draw concentric circles and dotted rings
      drawConcentricCirclesAndDots(hexCenterX, hexCenterY, radii, col, row);
    }
    count++;// increment every row
  }
}


function draw() {
  // Create background color transition based on time
  let currentTime = millis();
  let lerpAmount = (currentTime - lastBackgroundLerpTime) / backgroundLerpDuration;

  // Ensure that lerpAmount does not exceed 1.0
  lerpAmount = min(lerpAmount, 1.0);

  // Lerp the background color
  let lerpedBackgroundColor = lerpColor(startBackgroundColor, endBackgroundColor, lerpAmount);
  background(lerpedBackgroundColor);

  // If lerpAmount reached 1.0, restart background lerp with the end color of last transition
  if (lerpAmount >= 1.0) {
    // Reset the lastBackgroundLerpTime and calculate new colors for the next transition
    lastBackgroundLerpTime = currentTime;
    startBackgroundColor = endBackgroundColor; // Start color becomes the current background color
    endBackgroundColor = color(random(255), random(255), random(255)); // Calculate a new end color
  }
  
  translate(width / 2, height / 2); // Move the coordinate system to the center of the canvas
  rotate(15);// Rotate the entire canvas 15 degrees to fit the design of the original image
  noStroke();
  noFill();
  makeGrid();

  // Iterate over the balls array and handle collisions
  for(let i = 0; i < balls.length; i++) {
    for(let j = 0; j < i; j++) {
      balls[i].collide(balls[j]);
    }
  }
  
  // Move and render each ball in the balls array
  for(let i = 0; i < balls.length; i++) {
    balls[i].move();
    balls[i].render();
  }
}
