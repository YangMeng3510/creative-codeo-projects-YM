function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  for (let i = 0;i < 7 ; i++){
    ellipse(50+i*50,height/2,35)
  }
}