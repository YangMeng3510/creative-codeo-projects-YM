let color1;
let color2;
function setup() {
  createCanvas(400, 400);
  background(255);
  color1=color(255,255,0)
  color2=color(240,60,250)
  
}

function draw(){
  
  noStroke() ;
  for (let i=0;i<17;i++){
    let col=lerpColor(color1, color2, 0.1 * i)
    fill(col)
    rect(30+i*20,50,18,300)
  }
 
}
 function mousePressed(){
  color1 = color(random(255),random(255),random(255));
  color2 = color(random(255),random(255),random(255));
}

