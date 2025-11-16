class Orb {
  constructor(x, y, vel) {
    this.pos = createVector(x, y);
    this.vel = vel;
    this.r = 6;
    this.collected = false;
  }
  update() {
    // slow drift, and if near player, attract
    this.pos.add(this.vel);
    // friction
    this.vel.mult(0.98);
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    if (d < 120) {
      let dir = p5.Vector.sub(player.pos, this.pos).setMag(map(d, 0, 120, 3, 0.3));
      this.vel.add(dir);
    }
    // collect if very close
    if (d < player.r_pourDessin) {
      this.collected = true;
    }
  }
  show() {
    push();
    noStroke();
    fill(120, 200, 255);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
class SpecialOrb {
  constructor(x, y, duration = 6000) {
    this.pos = createVector(x, y);
    this.r = 10;
    this.birth = millis();
    this.duration = duration;
    this.collected = false;
  }

  update() {
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    if (d < player.r_pourDessin) this.collected = true;
  }

  isExpired() {
    return millis() - this.birth > this.duration;
  }

  show() {
    push();
    noStroke();
    fill(255, 100, 0); // orange spécial
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
