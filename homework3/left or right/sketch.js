function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  line(width/2,0,height/2,height)
  let position="";
  if(mouseX<width/2){
    position="LEFT"
  }else{position="RIGHT"
       }
  textAlign(CENTER)
  textSize(32);
  text(position, width/2, height/2);
  
}