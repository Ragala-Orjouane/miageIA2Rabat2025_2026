class Projectile {
  constructor(x, y, vel, dmg = 1, life = 2000) {

    // Position du projectile
    this.pos = createVector(x, y);

    // Vitesse initiale (copie du vecteur passé par le joueur)
    this.vel = vel.copy();

    // Accélération (utilisée pour steering)
    this.acc = createVector(0, 0);

    // Dégâts infligés à l’impact
    this.dmg = dmg;

    // Timestamp de création du projectile
    this.birth = millis();

    // Durée de vie maximale en millisecondes
    this.life = life;

    // Rayon graphique du projectile (collision + affichage)
    this.r = 6;

    // Vitesse maximale du projectile (dépend du niveau du joueur)
    this.maxSpeed = playerStats.projectileSpeed * 1.5;

    // Force maximale de steering (capacité de tourner)
    this.maxForce = 0.5;

    // Cible verrouillée (homing)
    this.target = null;
  }

  update(enemies) {

    // ------------------------------------------
    // 1) Si le projectile n’a pas de cible :
    //    → il choisit l’ennemi le plus proche
    // ------------------------------------------
    if (!this.target && enemies.length > 0) {

      let closest = null;
      let minDist = Infinity;

      // Parcours de tous les ennemis pour trouver le plus proche
      for (let e of enemies) {
        let d = p5.Vector.dist(this.pos, e.pos);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      }

      // On verrouille la cible (HOMING LOCK)
      this.target = closest;
    }

    // ------------------------------------------
    // 2) Steering (poursuite) vers l’ennemi ciblé
    // ------------------------------------------
    if (this.target) {

      // "desired" = direction souhaitée vers l’ennemi
      let desired = p5.Vector.sub(this.target.pos, this.pos);

      // On vérifie que le vecteur n’est pas trop petit (évite NaN)
      if (desired.mag() > 0.1) {

        // On donne à la direction une vitesse maximale
        desired.setMag(this.maxSpeed);

        // steer = (nouvelle direction − direction actuelle)
        let steer = p5.Vector.sub(desired, this.vel);

        // On limite la force → angle de virage limité = effet missile
        steer.limit(this.maxForce);

        // On ajoute la correction au projectile
        this.acc.add(steer);
      }
    }


    // ------------------------------------------
    // 3) Mise à jour du mouvement
    // ------------------------------------------

    // Ajout de l'accélération à la vitesse
    this.vel.add(this.acc);

    // On limite la vitesse
    this.vel.limit(this.maxSpeed);

    // Déplacement du projectile
    this.pos.add(this.vel);

    // Reset de l'accélération (classique en steering)
    this.acc.mult(0);
  }

  // ------------------------------------------
  // Vérifie si le projectile doit disparaître
  // ------------------------------------------
  isExpired() {
    return millis() - this.birth > this.life;
  }

  // ------------------------------------------
  // Affichage graphique du projectile
  // ------------------------------------------
  show() {
    push();
    noStroke();
    fill(255, 220, 80);  // jaune/orange lumineux
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
