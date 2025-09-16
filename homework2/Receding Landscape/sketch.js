let xposition1;
let yposition1;
let xposition2;
let yposition2;


function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  for (let i=0;i<100; i++) { 
    xposition1=200+i*4;
    yposition1=0;
    xposition2=200+i*20;
    yposition2=400;

  line(xposition1,yposition1,xposition2,yposition2)}
  for (let i=0;i<100; i++) { 
    xposition1=200-i*4;
    yposition1=0;
    xposition2=200-i*20;
    yposition2=400;

  line(xposition1,yposition1,xposition2,yposition2)}
 
}