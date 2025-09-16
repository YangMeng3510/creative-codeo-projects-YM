function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  for(let i=0;i<35;i++){
    let a = pow(1.3, i) * 40;   
    let b = 1 + i * 2; 
    noFill();
    stroke(0);
  
    circle(width/2,height,a);
      strokeWeight(b)
 console.log(a, b)
     }
    noLoop();
  
  
}