let cars = [];
let driftMarks = [];
let numCars = 21;
let reactionLocations = []

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < numCars; i++) {
    cars.push(new BumperCar(i));
     // 创建新车并添加到数组，i是车辆ID
  }
}

function draw() {
  background(200);

  // 地面和边界
  fill(180);
  rectMode(CENTER);
  rect(width/2, height/2, width * 0.9, height * 0.9);
  noFill();
  stroke(255);
  strokeWeight(4);
  rect(width/2, height/2, width * 0.9, height * 0.9);
  noStroke();

  // 1) 先更新所有车辆位置
  for (let c of cars) {
    c.applyMovement();// 调用车辆移动方法
  }

  // 2) 碰撞检测
  handleCollisions();

  // 3) 绘制/更新漂移痕迹
  for (let i = driftMarks.length - 1; i >= 0; i--) {
    driftMarks[i].show();// 显示漂移痕迹
    driftMarks[i].fade();// 淡化漂移痕迹
    if (driftMarks[i].alpha <= 0) driftMarks.splice(i, 1);// 如果完全透明就删除
  }

  // 4) 显示车辆
  for (let c of cars) {
    c.updateState();
    c.show();// 绘制车辆
    c.maybeLeaveDriftMark();// 检查是否需要留下漂移痕迹
  }
  
  for(let r of reactionLocations) {
    textSize(40)
    fill(0, r.alph)
    text("bang!", r.pos.x, r.pos.y)
    r.alph-=4
  }
  // remove reactionLocation from front of array after it fades away
  for(let r of reactionLocations) {
    if(r.alph < 0)
      reactionLocations.shift();
  }
}

// 碰撞处理
function handleCollisions() {
  let n = cars.length;
  const COOLDOWN = 6; 
  //外层循环：第一辆车
  // 内层循环：第二辆车（避免重复检测）
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let a = cars[i], b = cars[j];
      let d = p5.Vector.dist(a.pos, b.pos);
      // 计算两车距离
      let r = a.radius + b.radius;
      // 计算碰撞半径（两车半径之和）

      if (d < r && (frameCount - a.lastCollision > COOLDOWN || frameCount - b.lastCollision > COOLDOWN)) {
        //console.log(p5.Vector.lerp(a.pos, b.pos, 0.5))
        reactionLocations.push(
          {
            pos: p5.Vector.lerp(a.pos, b.pos, 0.5),
            alph: 255
          }
          
        )
        // 处理两车位置重叠的特殊情况
        if (d === 0) {
          let jitter = p5.Vector.random2D().mult(0.5);
          a.pos.add(jitter);
          // 给第一辆车添加偏移
          d = p5.Vector.dist(a.pos, b.pos);
        }//重新计算distance
        let overlap = r - d;
        let normal = p5.Vector.sub(b.pos, a.pos).normalize();
        // 将两车推开（各推开一半重叠量）
        a.pos.add(p5.Vector.mult(normal, -overlap * 0.5));
        b.pos.add(p5.Vector.mult(normal, overlap * 0.5));
// 计算速度的法向分量和切向分量
        let a_vn = normal.copy().mult(p5.Vector.dot(a.vel, normal));
        let a_vt = p5.Vector.sub(a.vel, a_vn);
        let b_vn = normal.copy().mult(p5.Vector.dot(b.vel, normal));
        let b_vt = p5.Vector.sub(b.vel, b_vn);
// 交换法向速度分量（弹性碰撞）
        let newAvel = p5.Vector.add(a_vt, b_vn);
        let newBvel = p5.Vector.add(b_vt, a_vn);
// 添加随机扰动使碰撞更自然
        const DAMP = 0.9;
        const JITTER = 0.08; 
        let tangent = createVector(-normal.y, normal.x);
        newAvel.add(p5.Vector.mult(tangent, random(-JITTER, JITTER)));
        newBvel.add(p5.Vector.mult(tangent, random(-JITTER, JITTER)));

        a.vel = newAvel.mult(DAMP);
        b.vel = newBvel.mult(DAMP);

        a.speed = a.vel.mag();
        b.speed = b.vel.mag();

        a.lastCollision = frameCount;
        b.lastCollision = frameCount;

        // 碰撞时留下车轮印
        driftMarks.push(new DriftMark(a.pos.x, a.pos.y, a.vel.heading(), a.bodyColor, a.size));
        driftMarks.push(new DriftMark(b.pos.x, b.pos.y, b.vel.heading(), b.bodyColor, b.size));
      } 
    }
  }
}

function mousePressed() {
  for (let c of cars) c.startDrift();
}

function keyPressed() {
  if (key === ' ') {
    for (let c of cars) c.startDrift();
  } else if (key === 'n' || key === 'N') {
    cars.push(new BumperCar(cars.length));
  }
}

// ---------- BumperCar ----------
class BumperCar {
  constructor(id) {
    this.id = id;
    let marginX = width * 0.05;
    let marginY = height * 0.05;
    this.pos = createVector(random(marginX, width - marginX), random(marginY, height - marginY));
    this.vel = p5.Vector.random2D().mult(random(3, 4));
    this.maxSpeed = this.vel.mag();
    this.speed = this.maxSpeed;

    this.size = random(70, 85);
    this.radius = this.size * 0.45;

    this.bodyColor = color(random(50, 220), random(50, 220), random(50, 220));
    this.isDrifting = false;
    this.driftSpeed = 0;

    this.lastCollision = -1000;
  }

  applyMovement() {
    if (this.isDrifting) {
      this.driftSpeed *= 0.96;
      if (this.driftSpeed < 0.01) {
        this.isDrifting = false;
        this.vel = p5.Vector.random2D().mult(random(3, 4));
        this.speed = this.vel.mag();
        this.maxSpeed = this.speed;
      } else {
        let dir = this.vel.copy().normalize();
        this.pos.add(dir.mult(this.driftSpeed));
        this.vel = dir.mult(this.driftSpeed);
      }
    } else {
      let jitter = p5.Vector.random2D().mult(0.02);
      this.vel.add(jitter);
      this.vel.setMag(this.maxSpeed);
      this.pos.add(this.vel);
    }

    let left = width * 0.05, right = width * 0.95;
    let top = height * 0.05, bottom = height * 0.95;
    if (this.pos.x < left + this.radius) {
      this.pos.x = left + this.radius;
      this.vel.x = abs(this.vel.x);
    } else if (this.pos.x > right - this.radius) {
      this.pos.x = right - this.radius;
      this.vel.x = -abs(this.vel.x);
    }
    if (this.pos.y < top + this.radius) {
      this.pos.y = top + this.radius;
      this.vel.y = abs(this.vel.y);
    } else if (this.pos.y > bottom - this.radius) {
      this.pos.y = bottom - this.radius;
      this.vel.y = -abs(this.vel.y);
    }

    if (!this.isDrifting && this.vel.mag() < 0.05) {
      this.vel = p5.Vector.random2D().mult(0.6);
    }
  }

  startDrift() {
    if (!this.isDrifting) {
      this.isDrifting = true;
      this.driftSpeed = this.vel.mag();
      this.vel.rotate(random(-0.4, 0.4));
    }
  }

  updateState() {
    this.speed = this.vel.mag();
  }

  maybeLeaveDriftMark() {
    if (this.isDrifting && frameCount % 3 === 0) {
      driftMarks.push(new DriftMark(this.pos.x, this.pos.y, this.vel.heading(), this.bodyColor, this.size));
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    fill(0);
    rectMode(CENTER);
    rect(0, 0, this.size*1.1, this.size * 0.8, 20);
    fill(255);
    rect(0, 0, this.size, this.size * 0.72, 17);
    fill(this.bodyColor);
    rect(0, 0, this.size*0.9, this.size * 0.62, 13);
    fill(20,20,20);
    rect(-5, 0, this.size*0.4, this.size * 0.52, 6);
    fill(70,70,70)
 rect(-9,0,this.size*0.2,this.size*0.32)
    fill(255)
 fill(255);
    rect(-this.size/2.3 , -this.size*0.01, 3, 15);
    fill(this.bodyColor);
    ellipse(this.size/8 , -this.size*0.01, 11, 17);
    //方向盘
    
    noFill();
    stroke(30);
    strokeWeight(1.5);
    ellipse(this.size/8 , -this.size*0.01, 6, 12);
    strokeWeight(1.5);
  //line(this.size/8 - 3, -this.size*0.01, this.size/8 + 3, -this.size*0.01); // 横线
  //line(this.size/8, -this.size*0.01 - 6, this.size/8, -this.size*0.01 + 6); // 竖线
    
    fill(255, 255, 180);
    noStroke();
    ellipse(this.size/2 - 6, -this.size*0.22, 8, 8);
    ellipse(this.size/2 - 6,  this.size*0.22, 8, 8);
    pop();
  }
}

// ---------- DriftMark ----------
class DriftMark {
  constructor(x, y, angle, col, size) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.col = color(red(col) * 0.35,green(col) * 0.35,blue(col) * 0.35);
    this.alpha = 160;
    this.length = max(20, size * 0.5); // 比原来更长
    this.width = max(10, size * 0.6);
  }
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    fill(red(this.col),green(this.col),blue(this.col), this.alpha);
    rectMode(CENTER);
    rect(0, 0, this.length, this.width, 2);
    pop();
  }
  fade() {
    this.alpha -= 2;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
