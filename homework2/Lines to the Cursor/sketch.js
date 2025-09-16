function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  for (let i=0; i<10;i++){
    line(50+i*30,100, mouseX, mouseY)
  }
  
  
  
}