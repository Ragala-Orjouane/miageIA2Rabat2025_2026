class Projectile {
  constructor(x, y, vel, dmg = 1, life = 2000) {
    this.pos = createVector(x, y);
    this.vel = vel.copy();
    this.acc = createVector(0, 0);
    this.dmg = dmg;
    this.birth = millis();    // moment de création
    this.life = life;         // durée de vie en ms
    this.r = 6;
    this.maxSpeed = playerStats.projectileSpeed * 1.5;
    this.maxForce = 0.5;
    this.target = null;       // cible verrouillée
  }

  update(enemies) {
    // Choisir la cible si elle n'existe pas encore
    if (!this.target && enemies.length > 0) {
      let closest = null;
      let minDist = Infinity;
      for (let e of enemies) {
        let d = p5.Vector.dist(this.pos, e.pos);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      }
      this.target = closest; // lock de la cible
    }

    // SEEK vers la cible fixée
  if (this.target) {
      let desired = p5.Vector.sub(this.target.pos, this.pos);
      if (desired.mag() > 0.1) {  // éviter vecteur nul
          desired.setMag(this.maxSpeed);
          let steer = p5.Vector.sub(desired, this.vel);
          steer.limit(this.maxForce);
          this.acc.add(steer);
      }
  }


    // Accélération optionnelle pour fluidité
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  // Vérifie si le projectile doit disparaître
  isExpired() {
    return millis() - this.birth > this.life;
  }

  show() {
    push();
    noStroke();
    fill(255, 220, 80);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
