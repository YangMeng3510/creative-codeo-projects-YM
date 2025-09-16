let x, y;
let size = 20;

function setup() {
  createCanvas(400, 400);
  x = width / 2;
  y = height / 2;
  background(220);
  frameRate(10);
}

function draw() {
  background(220, 20);
   fill(random(255), random(255), random(255));
  let currentSize = size + random(-5, 5);
  
  let moveX = random(-10, 10);
  let moveY = random(-10, 10);
  x=x+moveX;
  y=y+moveY;
  
  if (x < 0) x = width;
  if (x > width) x = 0;
  if (y < 0) y = height;
  if (y > height) y = 0;
  
 
  ellipse(x, y, currentSize);
  
}
