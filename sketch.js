// 圓的總數
const NUM_CIRCLES = 50;
// 顏色調色盤 (HEX 轉 RGB/RGBA)
const COLORS_HEX = ["#cdb4db", "#ffc8dd", "#ffafcc", "#bde0fe", "#a2d2ff"];
let bubbles = [];
let score = 0;
let popSound; // 新增：用於儲存爆破音效的變數

// =====================================
// 新增：音效預載入 (必須)
// =====================================
function preload() {
  // 假設您已將音效檔命名為 pop.mp3 並上傳到 /assets 資料夾
  // 建議使用 MP3 或 OGG 格式
  // 使用相對路徑並用 callback 來取得更詳細的錯誤訊息（便於偵錯 404）
  popSound = null;

  // 如果使用 file:// 協定，很多瀏覽器會阻擋 XHR/fetch，導致 loadSound 回傳 404。
  // 在這種情況下不嘗試載入音訊，並提示使用者啟動本機伺服器 (http://localhost)。
  try {
    if (typeof location !== 'undefined' && location.protocol === 'file:') {
      console.warn('Running from file:// — skipping loadSound to avoid 404. Start a local HTTP server (e.g. "py -3 -m http.server 8000") and open http://localhost:8000 to enable audio loading.');
      popSound = null;
    } else {
      // 使用相對路徑並用 callback 來取得更詳細的錯誤訊息（便於偵錯 404）
      loadSound('./pop-cartoon-328167.mp3',
        // success
        function(s) {
          popSound = s;
          console.log('pop sound loaded:', s);
        },
        // error
        function(err) {
          // 顯示嘗試載入的完整 URL，方便在 Network 裡比對 404
          let attemptedUrl = './pop-cartoon-328167.mp3';
          try {
            attemptedUrl = new URL('./pop-cartoon-328167.mp3', location.href).href;
          } catch (e) {
            // location 可能不存在（保險 fallback）
          }
          console.warn('pop sound load failed (URL:', attemptedUrl, '):', err);
          popSound = null;
        }
      );
    }
  } catch (e) {
    // 保守處理，避免任何例外導致整個 sketch 無法執行
    console.warn('preload() audio check failed:', e);
    popSound = null;
  }
}

// 在使用者互動時啟用音訊並嘗試載入音檔（綁到 index.html 的按鈕）
window.enableAudio = async function() {
  // resume Web Audio context (p5 提供 getAudioContext)
  if (typeof getAudioContext === 'function') {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
      console.log('AudioContext resumed');
    }
  }

  // 如果尚未載入音效，嘗試載入一次
  // ...existing code...
  // 隱藏按鈕以避免重複點擊
  try {
    const btn = document.getElementById('enable-audio');
    if (btn) btn.style.display = 'none';
  } catch (e) {}
};

// Bubble 類別：包含附加正方形、爆炸和波動屬性
class Bubble {
  constructor() {
    this.init();
  }

  init() {
    const hexColor = random(COLORS_HEX);
    this.c = color(hexColor);

    this.r = random(50, 200) / 2;
    let alpha = random(50, 200);
    this.c.setAlpha(alpha);

    this.x = random(this.r, width - this.r);
    this.baseX = this.x; 
    
    this.y = random(height, height * 2);

    this.speed = random(0.5, 3);
    
    this.angle = random(TWO_PI); 
    this.waveMagnitude = random(5, 15); 
    this.waveSpeed = random(0.01, 0.05); 
  }

  // ...existing code...
  init() {
    const hexColor = random(COLORS_HEX);
    this.c = color(hexColor);

    this.r = random(50, 200) / 2;
    let alpha = random(50, 200);
    this.c.setAlpha(alpha);

    this.x = random(this.r, width - this.r);
    this.baseX = this.x; 
    
    this.y = random(height, height * 2);

    this.speed = random(0.5, 3);
    
    this.angle = random(TWO_PI); 
    this.waveMagnitude = random(5, 15); 
    this.waveSpeed = random(0.01, 0.05); 

    this.isExploding = false;
    this.explosionParticles = [];
    this.explosionProgress = 0;
    this.explosionDuration = 30;
  }

  move() {
    if (!this.isExploding) {
      this.y -= this.speed;
      
      this.angle += this.waveSpeed;
      this.x = this.baseX + sin(this.angle) * this.waveMagnitude;

      // 隨機決定是否爆破
      if (this.y < height && this.y > -this.r && random(1) < 0.001) { 
        this.explode();
      }

      if (this.y < -this.r) {
        this.reset();
      }
    } else {
      this.explosionProgress++;
      if (this.explosionProgress >= this.explosionDuration) {
        this.reset();
      }
    }
  }

  // =====================================
  // 修改：加入音效播放邏輯
  // =====================================
  explode() {
    this.isExploding = true;
    this.explosionProgress = 0;
    this.explosionParticles = []; 

    // 播放爆破音效 (若音效已載入)，若尚未載入則嘗試動態載入並播放一次
    if (popSound) {
      try {
        // 隨機調整音量或音高，讓爆破聲聽起來更有變化
        popSound.setVolume(random(0.5, 1.0));
        popSound.rate(random(0.9, 1.1));
        popSound.play();
      } catch (e) {
        console.warn('popSound play error:', e);
      }
    } else {
      // 嘗試動態載入並播放（在 http server 或使用者互動後通常會成功）
      loadSound('./pop-cartoon-328167.mp3',
        function(s) {
          popSound = s;
          popSound.setVolume(random(0.5, 1.0));
          popSound.rate(random(0.9, 1.1));
          popSound.play();
          console.log('pop sound loaded and played on demand');
        },
        function(err) {
          let attemptedUrl = './pop-cartoon-328167.mp3';
          try {
            attemptedUrl = new URL(attemptedUrl, location.href).href;
          } catch (e) {}
          console.warn('pop sound dynamic load failed (URL:', attemptedUrl, '):', err);
        }
      );
    }
    
    // 產生爆破粒子 (不變)
    for (let i = 0; i < 12; i++) {
      const angle = (TWO_PI / 12) * i;
      const speed = random(2, 5);
      this.explosionParticles.push({
        x: 0,
        y: 0,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        size: this.r / 2
      });
    }
  }

  display() {
    if (!this.isExploding) {
      noStroke(); 
      fill(this.c);
      circle(this.x, this.y, this.r * 2); 

      // 繪製正方形 (旋轉和波動)
      const squareSize = (this.r * 2) / 6;
      const halfDiagonal = (squareSize * Math.SQRT2) / 2;
      const maxOffset = Math.max(0, this.r - halfDiagonal);
      const usedOffset = maxOffset * 0.9;
      const offset45 = usedOffset / Math.SQRT2;
      const dx = offset45;
      const dy = -offset45;
      
      push(); 
      translate(this.x + dx, this.y + dy); 
      let rotationAngle = map(this.y, height, -this.r, 0, TWO_PI); 
      rotate(rotationAngle); 

      fill(255, 255, 255, 200);
      rectMode(CENTER);
      rect(0, 0, squareSize, squareSize);
      pop();

    } else {
      // 繪製爆破效果
      const progress = this.explosionProgress / this.explosionDuration;
      const fadeOut = 1 - progress; 

      noStroke();
      for (let particle of this.explosionParticles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        fill(red(this.c), green(this.c), blue(this.c), 255 * fadeOut); 
        const size = particle.size * (1 - progress * 0.5); 
        circle(this.x + particle.x, this.y + particle.y, size);
      }
    }
  }

  reset() {
    this.init(); 
    this.y = height + this.r; 
  }
}

// 由於 preload 函數已存在，setup 函數會在其後執行
function setup() {
  // 註：在某些瀏覽器中，使用者必須先點擊畫布才能啟用音訊播放
  createCanvas(windowWidth, windowHeight);
  
  for (let i = 0; i < NUM_CIRCLES; i++) {
    bubbles.push(new Bubble());
  }
  
  for (let i = 0; i < NUM_CIRCLES; i++) {
    bubbles[i].y = random(-bubbles[i].r, height + bubbles[i].r);
  }
}

function draw() {
  background(240);

  // 左上角顯示文字
  fill('#a2d2ff');
  textSize(32);
  textAlign(LEFT, TOP);
  text('學號為414730407', 16, 16);

  // 右上角顯示分數
  textAlign(RIGHT, TOP);
  text('得分: ' + score, width - 16, 16);

  // 氣球
  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
    bubbles[i].display();
  }
}
// 滑鼠點擊觸發爆破與分數判斷
function mousePressed() {
  // 由上到下檢查，優先爆破最上層（最接近滑鼠的氣球）
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    if (!b.isExploding) {
      let d = dist(mouseX, mouseY, b.x, b.y);
      if (d < b.r) {
        // 判斷顏色是否為 a2d2ff
        let targetHex = '#a2d2ff';
        let c = b.c;
        let cHex = '#' + hex(red(c),2) + hex(green(c),2) + hex(blue(c),2);
        if (cHex.toLowerCase() === targetHex) {
          score++;
        } else {
          score--;
        }
        b.explode();
        break; // 一次只爆破一顆
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  for (let bubble of bubbles) {
      if (bubble.baseX > width - bubble.r) {
          bubble.baseX = width - bubble.r;
      }
      if (bubble.baseX < bubble.r) {
          bubble.baseX = bubble.r;
      }
      bubble.x = bubble.baseX + sin(bubble.angle) * bubble.waveMagnitude;
  }
}