let rectnumber=14;
let rectwidth;
let rectheight;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  for (let i=0;i<14; i++){
rectwidth=350/rectnumber;
rectheight=25+25*i
     fill(i*255/rectnumber)
    rect(25+rectwidth*i,height - rectheight,rectwidth,rectheight)
    
  }
 
}