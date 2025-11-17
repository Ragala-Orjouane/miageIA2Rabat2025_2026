class Orb {
  constructor(x, y, vel) {
    // Position de l'orbe
    this.pos = createVector(x, y);

    // Vitesse initiale (souvent une petite impulsion aléatoire)
    this.vel = vel;

    // Rayon de l'orbe (pour le dessin et la détection)
    this.r = 6;

    // Passe à true quand le joueur l'a ramassée
    this.collected = false;
  }

  update() {
    // --- 1) Déplacement classique ---
    // L'orbe avance selon sa vélocité
    this.pos.add(this.vel);

    // --- 2) Frottements ---
    // La vitesse diminue légèrement pour adoucir le mouvement
    this.vel.mult(0.98);

    // --- 3) Attraction vers le joueur ---
    // Distance entre l'orbe et le joueur
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);

    // Si le joueur est à moins de 120px → attraction progressive
    if (d < 120) {
      // vecteur directionnel vers le joueur
      let dir = p5.Vector.sub(player.pos, this.pos)
        // la force d’attraction augmente quand l’orbe est proche :
        // à distance 0 → force = 3
        // à distance 120 → force = 0.3
        .setMag(map(d, 0, 120, 3, 0.3));

      // on ajoute cette force à la vélocité
      this.vel.add(dir);
    }

    // --- 4) Ramassage ---
    // Si très proche du joueur → l'orbe est collectée
    if (d < player.r_pourDessin) {
      this.collected = true;
    }
  }

  show() {
    push();
    noStroke();
    // Couleur bleu clair = XP
    fill(120, 200, 255);
    // dessin du rond représentant l'orbe
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
class SpecialOrb {
  constructor(x, y, duration = 6000) {
    // Position de l'orbe spéciale
    this.pos = createVector(x, y);

    // Rayon un peu plus grand que celui de l'orbe d'XP
    this.r = 10;

    // Timestamp de création (pour savoir quand elle expire)
    this.birth = millis();

    // Durée de vie (par défaut 6000ms = 6 secondes)
    this.duration = duration;

    // Lorsque true → le joueur l'a ramassée
    this.collected = false;
  }

  update() {
    // Distance entre le joueur et l'orbe spéciale
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);

    // si le joueur touche l'orbe → elle est collectée
    if (d < player.r_pourDessin) this.collected = true;
  }

  // Vérifie si l'orbe spéciale doit disparaître par expiration
  isExpired() {
    // > durée de vie ? → elle expire
    return millis() - this.birth > this.duration;
  }

  show() {
    push();
    noStroke();
    // couleur orange significative (bonus)
    fill(255, 100, 0);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
