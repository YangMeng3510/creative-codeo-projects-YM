let isOn=true
let size=100;
let onClicks=0;
let offClicks=0;

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
}

function draw() {
  background(220);
 
 if (isOn) {
    fill(255); 
  } else {
    fill(0); 
  }
  rect(width/2,height/2,size)

}
function mousePressed(){
    if (mouseY>(width/2)-(size/2)&&
        mouseY<(width/2)+(size/2)&&
        mouseX>(height/2)-(size/2)&&
        mouseX<(height/2)+(size/2))
  {  if(isOn==true){onClicks++}
  if(onClicks==3){
    isOn=false;
    onClicks=0;
  }else{
    offClicks++
  if(offClicks==2){
    isOn=true;
    offClicks=0;
}
  }
  }

}