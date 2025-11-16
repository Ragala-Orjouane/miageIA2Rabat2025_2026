let player;
let enemies = [];
let obstacles = [];
let bullets = [];
let orbs = [];

let spawnTimer = 0;
let spawnInterval = 2000; // c'est par ms
let lastFire = 0;
let fireInterval = 200;//ms entre tire
let difficultyTimer = 0;
let maxEnemies = 50;

let projectileBuffUntil = 0;
let specialOrbs = [];

let imgEnemy, imgPlanet, imgBackground;
let gameOver = false;

function preload() {
    imgEnemy = loadImage("assets/enemy.png");
    imgPlanet = loadImage("assets/planet.png");
    imgBackground = loadImage("assets/space.png");
}
function spawnObstacles() {

  let count = 10;
  let minDistBetween = 160;   // espace entre obstacles
  let avoidCenter = 220;      // espace autour du joueur
  let tries = 0;

  while (obstacles.length < count && tries < 5000) {
    tries++;

    let r = random(35, 110);
    let x = random(r, width - r);
    let y = random(r, height - r);

    // éviter trop proche du centre
    if (dist(x, y, width/2, height/2) < avoidCenter) continue;

    // vérifier qu’il ne touche aucun autre obstacle
    let ok = true;
    for (let o of obstacles) {
      let d = dist(x, y, o.pos.x, o.pos.y);
      if (d < o.r + r + minDistBetween) {
        ok = false;
        break;
      }
    }

    if (ok) {
      obstacles.push(
        new Obstacle(x, y, r, color(random(50,255), random(50,255), random(50,255)))
      );
    }
  }

  console.log("Obstacles placés :", obstacles.length);
}

function setup(){
    createCanvas(windowWidth, windowHeight);
    // Le player va être creer dans le centre
    player = new Player(width / 2, height / 2);
    // quelques enemis initiaux
    for(let i = 0; i < 8; i++){
        enemies.push(new Enemy(random(width),random(height), floor(random(2,5)), random(0.8,1.6)));
    }

    spawnObstacles();

    spawnTimer = millis();
    difficultyTimer = millis();
}

function draw() {
    image(imgBackground,0,0,width,height);

    let mousePos = createVector(mouseX,mouseY);
    let seekForce = player.seek(mousePos).mult(1.5);
    player.applyForce(seekForce);

    for (let o of obstacles) {
        let avoidForce = player.avoidObstacles([o]);
        player.applyForce(avoidForce);
    }

    player.update();
    player.show();

    player.autoFire();
    
    for(let i = bullets.length - 1; i >= 0; i--){
        let b = bullets[i];
        b.update(enemies);
        b.show();
        for(let j = enemies.length - 1; j >= 0; j--){
            let e = enemies[j];
            if(!e) continue;
            if(p5.Vector.dist(b.pos,e.pos) < (b.r + e.r)){
                e.takeDamage(b.dmg)
                bullets.splice(i,1);
                break;
            }
        }
        if(b && b.isExpired()){
            let idx = bullets.indexOf(b);
            if(idx >= 0) bullets.splice(idx,1);
        }
        for (let o of obstacles) {
            if (p5.Vector.dist(b.pos, createVector(o.x, o.y)) < o.r + b.r) {
                bullets.splice(i,1);
                break;
            }
        }

    }

    if(millis() - spawnTimer > spawnInterval){
        spawnTimer = millis();
        if(enemies.length < maxEnemies){
            let edge = floor(random(4));
            let x,y;
            if(edge === 0){x = random(-20,20);y = random(height);}
            else if(edge === 1){x = random(width,width+20);y = random(height);}
            else if(edge === 2){x = random(width);y = random(-20,0);}
            else{x = random(width);y = random(height+20,height+40);}

            let hp = floor(random(1+playerStats.level*0.3,3 + playerStats.level*0.6));
            let spd = random(0.7+playerStats.level*0.02,1.6 + playerStats.level*0.03);
            enemies.push(new Enemy(x,y,hp,spd));
        }
    }

    if (millis() - difficultyTimer > 2000){
        difficultyTimer = millis();
        spawnInterval = max(200,spawnInterval-120);
        maxEnemies = min(500,maxEnemies+30);
    }

    for(let i = enemies.length - 1; i >= 0; i--){
        let e = enemies[i];
        if(!e) continue;
        e.update(player.pos, obstacles, enemies);
        if(circleCollide(e,player)){
            let push = p5.Vector.sub(player.pos,e.pos).setMag(2);
            player.applyForce(push);
            player.takeDamage(5);
        }
        if(e.dead){
            if(random() < 0.15){
                specialOrbs.push(new SpecialOrb(e.pos.x, e.pos.y))
            }
            enemies.splice(i,1);
        }else{
            e.show();
        }
    }

    
    for(let o of obstacles) o.show();

    for(let i = orbs.length - 1; i >= 0;i--){
        let o = orbs[i];
        o.update();
        o.show();
        if(o.collected){
            collectXP(1);
            orbs.splice(i,1);
        }
    }
    for(let i = specialOrbs.length - 1; i >= 0; i--){
        let o = specialOrbs[i];
        o.update();
        o.show();
        if(o.collected){

            // invincibilité du joueur pendant 3 secondes
            player.invincibleUntil = millis() + 3000;

            specialOrbs.splice(i,1);
        } else if(o.isExpired()){
            specialOrbs.splice(i,1);
        }
    }

    drawHUD();
}

function collectXP(amount) {
  playerStats.xp += amount;
  while (playerStats.xp >= playerStats.xpToNext) {
    playerStats.xp -= playerStats.xpToNext;
    playerStats.level++;
    playerStats.xpToNext = floor(playerStats.xpToNext * 1.6);
    // small upgrade on level up
    playerStats.projectileDmg += 0.2;
    player.maxSpeed = playerStats.moveSpeed + playerStats.level * 0.03;
    let hpIncrease = playerStats.level * 10;
    playerStats.maxHp += hpIncrease;
    playerStats.hp = playerStats.maxHp;
    player.hp = playerStats.hp;
    player.maxHp = playerStats.maxHp;

    // feedback: spawn some orbs/particles
    for (let i = 0; i < 8; i++) orbs.push(new Orb(player.pos.x + random(-8,8), player.pos.y + random(-8,8), p5.Vector.random2D().mult(random(0.5,2))));
  }
}

function drawHUD() {
  push();
  noStroke();
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Level: ${playerStats.level}`, 10, 10);
  text(`XP: ${playerStats.xp} / ${playerStats.xpToNext}`, 10, 30);
  text(`HP: ${playerStats.hp} / ${playerStats.maxHp}`, 10, 50);
  text(`Enemies: ${enemies.length}`, 10, 70);
  text(`Projectiles: ${playerStats.projectileCount}`, 10, 90);
  pop();
    if(gameOver){
        push();
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255,0,0);
        text("GAME OVER", width/2, height/2 - 30);
        textSize(24);
        fill(255);
        text("Press ENTER to Restart", width/2, height/2 + 20);
        pop();
    }
  // draw HP BAR 
  push();
  translate(10,136);
  stroke(255);
  noFill();
  rect(0,0,200,14);
  let hpw = map(playerStats.hp, 0, 100,0,200);
  fill(255,80,80);
  rect(0,0,hpw,14);
  pop();
  // draw xp bar
  push();
  translate(10, 116);
  stroke(255);
  noFill();
  rect(0, 0, 200, 14);
  fill(120, 200, 255);
  let w = map(playerStats.xp, 0, playerStats.xpToNext, 0, 200);
  rect(0, 0, w, 14);
  pop();
}



function keyPressed() {
    if(gameOver){
        if(keyCode === ENTER){
            restartGame();
        }
    }
}

function circleCollide(a,b){
    let d = p5.Vector.dist(a.pos,b.pos);
    return d < (a.r + b.r);
}

function restartGame(){
    // reset player
    playerStats = {
        level: 1,
        xp: 0,
        xpToNext: 10,
        projectileDmg: 1,
        projectileCount: 4,
        projectileSpeed: 7,
        moveSpeed: 4,
        hp:100,
        maxHp:100
    };
    player = new Player(width/2, height/2);

    // reset arrays
    enemies = [];
    bullets = [];
    orbs = [];
    specialOrbs = [];
    obstacles = [];
    spawnObstacles();

    // reset timers
    spawnTimer = millis();
    difficultyTimer = millis();
    projectileBuffUntil = 0;
    gameOver = false;

    loop(); // restart draw()
}
