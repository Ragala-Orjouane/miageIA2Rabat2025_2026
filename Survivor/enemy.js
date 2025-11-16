class Enemy extends Vehicle {
constructor(x, y, hp = 3, speed = 1.4){
    super(x, y);
    this.maxSpeed = speed;
    this.hp = hp;
    this.r_pourDessin = 12;
    this.r = this.r_pourDessin * 2;
    this.color = color(random(100,255), random(50,200), random(50,255)); // couleur aléatoire
}


  wander() {
    // Wander circle
    let wanderRadius = 25;
    let wanderDistance = 50;
    let change = 0.3; // variation
    this.wanderTheta = this.wanderTheta || 0;

    this.wanderTheta += random(-change, change);

    let circlePos = this.vel.copy();
    circlePos.setMag(wanderDistance);
    circlePos.add(this.pos);

    let h = this.vel.heading();
    let wanderForce = createVector(
        wanderRadius * cos(this.wanderTheta + h),
        wanderRadius * sin(this.wanderTheta + h)
    );

    wanderForce.limit(this.maxForce);
    this.applyForce(wanderForce);
  }

  update(playerPos, obstacles, enemies) {
    // force vers le joueur
    let f = this.seek(playerPos);
    this.applyForce(f);

    this.wander(); // ajout pour un mouvement plus naturel
    // éviter obstacles
    if(obstacles.length > 0) this.applyForce(this.avoidObstacles(obstacles));

    // éviter autres ennemis
    if(enemies.length > 0) this.applyForce(this.avoidVehicles(enemies));

    // update de la position
    super.update();
  }

  takeDamage(d) {
    this.hp -= d;
    if (this.hp <= 0) this.die();
  }
  die() {
    // spawn some orbs
    let count = floor(random(1, 4));
    for (let i = 0; i < count; i++) {
      let v = p5.Vector.random2D().mult(random(0.5, 1.5));
      orbs.push(new Orb(this.pos.x + random(-8, 8), this.pos.y + random(-8, 8), v));
    }
    // remove from enemies array externally (we'll mark a flag)
    this.dead = true;
  }
show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // image centrée sur le Enemy
    imageMode(CENTER);
    image(imgEnemy, 0, 0, this.r, this.r);

    // HP bar
    noStroke();
    fill(255,0,0);
    rect(-this.r/2, -this.r - 6, this.r, 4);
    
    fill(0,255,0);
    let w = map(this.hp, 0, 10, 0, this.r);
    rect(-this.r/2, -this.r - 6, w, 4);

    pop();
}

}
