let xposition1;
let yposition1;
let xposition2;
let yposition2;


function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  for(let i =0; i<8; i++){ 
    xposition1=50;
    yposition1=50+i*40;
    xposition2=50+i*40;
    yposition2=330;

  line(xposition1,yposition1,xposition2,yposition2)}
 
}