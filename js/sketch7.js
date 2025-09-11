function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  noStroke();

  let b=1;
  for(let i= 0;i<8;i++){
    b=b*-1;
    for(let a=0;a<8;a++){
      b=b*-1;
      let x=i*50;
    let y=a*50;
      if(b<0){
        fill(255)
      }else{
        fill(0)
      }
    rect(x,y,50)
    }
    
  }
}