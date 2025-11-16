// --- PLAYER UPGRADES / STATS ---
let playerStats = {
  level: 1,
  xp: 0,
  xpToNext: 10,
  projectileDmg: 1,
  projectileSpeed: 7,
  projectileCount: 4,
  moveSpeed: 4, // player maxSpeed
  hp:100,
  maxHp: 100
};

// --- ADAPTATION DE LA CLASSE Vehicle POUR LE JOUEUR ---
class Player extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = playerStats.moveSpeed;
    this.color = "#FFD166";
    this.r_pourDessin = 12;
    this.r = this.r_pourDessin * 2;
    this.hp = 100;
    this.maxHp = 100;
    this.hitFlashUntil = 0;
    this.invincibleUntil = 0; // <--- nouveau
  }

  autoFire() {
      if (millis() - lastFire < fireInterval) return;
      lastFire = millis();

      // vecteur vers la souris (correct)
      let mouseDir = createVector(mouseX - this.pos.x, mouseY - this.pos.y);
      mouseDir.setMag(playerStats.projectileSpeed);

      // tire autant de projectiles que le joueur possède
      for (let i = 0; i < playerStats.projectileCount; i++) {
          bullets.push(new Projectile(this.pos.x, this.pos.y, mouseDir, playerStats.projectileDmg, 2000));
      }
  }




  takeDamage(amount) {
    // ignorer les dégâts si invincible
    if (millis() < this.invincibleUntil) return;

    this.hp -= amount;
    if(this.hp <= 0){
        playerStats.hp = 0;
    }else{
        playerStats.hp = this.hp;
    }
    this.hitFlashUntil = millis() + 150;
    if(this.hp <= 0){
        this.hp = 0;
        gameOver = true;
        console.log("GAME OVER");
        noLoop();
    }
  }


  show() {
    push();
    stroke(255);
    strokeWeight(2);
    // couleur spéciale si invincible
    if (millis() < this.invincibleUntil) fill(0,255,255);
    else fill(this.color);

    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    beginShape();
    vertex(0, -this.r_pourDessin);
    vertex(this.r_pourDessin, 0);
    vertex(0, this.r_pourDessin);
    vertex(-this.r_pourDessin, 0);
    endShape(CLOSE);

    if(millis() < this.hitFlashUntil){
        fill(255,0,0,120);
        circle(0,0,this.r*2.6);
    }
    pop();
  }
}
