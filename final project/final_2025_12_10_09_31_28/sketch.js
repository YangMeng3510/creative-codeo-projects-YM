/*
 * Structure & Hand Control (v6.0 Fullscreen Fit)
 * 更新内容：
 * 1. [布局] 保持 640x480 内部逻辑，但通过 CSS 将画面缩放至全屏居中
 * 2. [音频] 包含背景音和交互音效
 * 3. [视觉] 包含视频贴图
 */

let pg;   
let pgUI; 
let handPose;
let video;      
let projectVideo; 
let detectedHands = []; 

// 音频变量
let bgm;
let switchSound;

// 画布对象 (用于控制 CSS)
let cnv;

// 交互变量
let globalScale = 1.0;
let globalRotX = 0;
let globalRotY = 0;
let targetRotX = 0;
let targetRotY = 0;

let lastTriggerTime = 0;
let cubes = []; 

// 内部逻辑分辨率 (保持 4:3 比例)
// 我们不改变这里，防止手势坐标错乱
let viewWidth = 640;
let viewHeight = 480; 

function preload() {
  let options = {
    maxHands: 2,
    flipped: true 
  };
  handPose = ml5.handPose(options);
  
  // 音频加载
  soundFormats('m4a', 'mp3'); 
  bgm = loadSound('bgm.m4a');       
  switchSound = loadSound('switch.m4a'); 
}

function setup() {
  // [修改] 创建画布并赋值给变量 cnv
  cnv = createCanvas(viewWidth, viewHeight);
  
  // 初始化时立即调用一次调整大小
  windowResized();

  // 1. 初始化 3D 层
  pg = createGraphics(viewWidth, viewHeight, WEBGL);
  pg.noStroke(); 
  
  // 2. 初始化 UI 层
  pgUI = createGraphics(viewWidth, viewHeight);
  
  // 3. 摄像头
  video = createCapture(VIDEO);
  video.size(viewWidth, viewHeight);
  video.hide();
  
  // 4. 视频素材
  projectVideo = createVideo(['demo.mp4']); 
  projectVideo.volume(0); 
  projectVideo.loop();    
  projectVideo.hide();    
  
  // 5. 音频
  bgm.setVolume(0.3);
  bgm.loop(); 
  switchSound.setVolume(0.5);
  
  handPose.detectStart(video, gotHands);
  
  generateStructure();
}

// [新增] 核心函数：窗口大小改变时触发
function windowResized() {
  // 计算宽度的缩放比
  let scaleW = windowWidth / viewWidth;
  // 计算高度的缩放比
  let scaleH = windowHeight / viewHeight;
  
  // 取两者的较小值，确保画面能完全装入屏幕且不裁剪
  let scaleFactor = min(scaleW, scaleH);
  
  // 计算新的显示尺寸
  let newW = viewWidth * scaleFactor;
  let newH = viewHeight * scaleFactor;
  
  // 应用 CSS 样式给画布 (不改变内部像素，只改变显示大小)
  cnv.style('width', newW + 'px');
  cnv.style('height', newH + 'px');
}

function gotHands(results) {
  detectedHands = results;
}

function generateStructure() {
  cubes = [];
  let count = 50; 
  let baseUnit = 40; 
  
  for (let i = 0; i < count; i++) {
    let x = floor(random(-5, 5)) * baseUnit;
    let y = floor(random(-5, 5)) * baseUnit;
    let z = floor(random(-5, 5)) * baseUnit;
    let w = floor(random(1, 4)) * baseUnit;
    let h = floor(random(1, 5)) * baseUnit;
    let d = floor(random(1, 4)) * baseUnit;
    cubes.push({ x, y, z, w, h, d });
  }
}

function draw() {
  // ============================
  // 第一步：交互逻辑
  // ============================
  let isLeftHorizontal = false;
  let rightHandMode = "NONE"; 
  
  if (detectedHands.length > 0) {
    for (let i = 0; i < detectedHands.length; i++) {
      let hand = detectedHands[i];
      let thumb = hand.keypoints[4];  
      let index = hand.keypoints[8];  
      let middle = hand.keypoints[12];
      let wrist = hand.keypoints[0];  
      
      if (wrist.x < viewWidth / 2) {
        let dx = index.x - thumb.x;
        let dy = index.y - thumb.y;
        let deg = degrees(atan2(dy, dx));
        if (abs(deg) < 20 || abs(deg) > 160) isLeftHorizontal = true;
      } else {
        let fingerDist = dist(index.x, index.y, middle.x, middle.y);
        if (fingerDist < 60) {
          rightHandMode = "ROTATE";
          let cx = (thumb.x + index.x + middle.x) / 3;
          let cy = (thumb.y + index.y + middle.y) / 3;
          targetRotY = map(cx, viewWidth/2, viewWidth, -PI, PI);
          targetRotX = map(cy, 0, viewHeight, PI/2, -PI/2);
        } else {
          rightHandMode = "ZOOM";
          let d = dist(thumb.x, thumb.y, index.x, index.y);
          let targetScale = map(d, 20, 150, 0.5, 2.5, true);
          globalScale = lerp(globalScale, targetScale, 0.1);
        }
      }
    }
  }
  
  globalRotX = lerp(globalRotX, targetRotX, 0.1);
  globalRotY = lerp(globalRotY, targetRotY, 0.1);
  
  if (isLeftHorizontal && millis() - lastTriggerTime > 1500) {
    generateStructure();
    switchSound.play();
    lastTriggerTime = millis();
  }

  // ============================
  // 第二步：3D 渲染层
  // ============================
  pg.background(0); 
  pg.reset();
  pg.ambientLight(200); 
  pg.directionalLight(255, 255, 255, 1, 1, -1);
  
  pg.push();
  pg.rotateX(globalRotX);
  pg.rotateY(globalRotY);
  pg.scale(globalScale);
  pg.texture(projectVideo); 
  
  for (let c of cubes) {
    pg.push();
    pg.translate(c.x, c.y, c.z);
    pg.box(c.w, c.h, c.d);
    pg.pop();
  }
  pg.pop();

  // ============================
  // 第三步：UI 渲染层
  // ============================
  pgUI.clear(); 
  pgUI.push();
  pgUI.translate(viewWidth, 0);
  pgUI.scale(-1, 1); 
  pgUI.image(video, 0, 0, viewWidth, viewHeight);
  pgUI.pop();
  
  if (detectedHands.length > 0) {
    pgUI.textAlign(LEFT, CENTER);
    pgUI.textSize(16);

    for (let i = 0; i < detectedHands.length; i++) {
      let hand = detectedHands[i];
      let wrist = hand.keypoints[0];
      let t = hand.keypoints[4];  
      let idx = hand.keypoints[8];
      
      pgUI.noStroke();
      pgUI.fill(0, 255, 0);
      for (let p of hand.keypoints) {
        pgUI.ellipse(p.x, p.y, 6, 6); 
      }
      
      if (wrist.x < viewWidth / 2) {
        pgUI.stroke(0, 255, 0);
        pgUI.strokeWeight(3);
        pgUI.line(t.x, t.y, idx.x, idx.y);
        pgUI.noStroke();
        pgUI.fill(0, 255, 0);
        pgUI.ellipse(t.x, t.y, 15, 15);
        pgUI.ellipse(idx.x, idx.y, 15, 15);
        pgUI.fill(255);
        pgUI.text("LEFT: Reset", wrist.x, wrist.y + 40);
      } else {
        let mid = hand.keypoints[12];
        if (rightHandMode === "ROTATE") {
          pgUI.stroke(0, 200, 255);
          pgUI.strokeWeight(3);
          pgUI.line(t.x, t.y, idx.x, idx.y);
          pgUI.line(idx.x, idx.y, mid.x, mid.y);
          pgUI.line(mid.x, mid.y, t.x, t.y);
          pgUI.noStroke();
          pgUI.fill(0, 200, 255);
          pgUI.text("MODE: ROTATE", wrist.x, wrist.y + 40);
        } else {
          pgUI.stroke(255, 50, 50);
          pgUI.strokeWeight(3);
          pgUI.line(t.x, t.y, idx.x, idx.y);
          pgUI.noStroke();
          pgUI.fill(255, 50, 50);
          pgUI.text("MODE: ZOOM", wrist.x, wrist.y + 40);
        }
      }
    }
  }

  // ============================
  // 第四步：合成
  // ============================
  image(pg, 0, 0, width, height);

  let smallScale = 0.3; 
  let smallW = viewWidth * smallScale;
  let smallH = viewHeight * smallScale;
  let margin = 20; 
  let smallX = width - smallW - margin;
  let smallY = height - smallH - margin;

  fill(0, 150); 
  noStroke();
  rect(smallX, smallY, smallW, smallH);
  image(pgUI, smallX, smallY, smallW, smallH);
  
  //fill(255);
  //textAlign(CENTER, BOTTOM);
  //textSize(14);
  //text("Click canvas if audio doesn't start", width/2, height - 5);
  
  if (isLeftHorizontal) {
    fill(0, 255, 0);
    textAlign(RIGHT, TOP);
    textSize(18);
    text("REGENERATING...", width - margin, margin);
  }
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    userStartAudio();
  }
}