class Enemy extends Vehicle {
  constructor(x, y, hp = 3, speed = 1.4) {
    super(x, y); // héritage de la classe Vehicle (pos, vel, acc, forces)
    
    // vitesse max de cet ennemi
    this.maxSpeed = speed;

    // points de vie de l’ennemi
    this.hp = hp;

    // taille pour le dessin
    this.r_pourDessin = 12;
    this.r = this.r_pourDessin * 2;

    // couleur aléatoire pour rendre le jeu visuellement varié
    this.color = color(random(100, 255), random(50, 200), random(50, 255));
  }

  // ------------------------------------------------------------
  // WANDER : mouvement aléatoire pour rendre l'ennemi plus vivant
  // ------------------------------------------------------------
  wander() {
    // rayon du "cercle d'exploration"
    let wanderRadius = 25;

    // distance du cercle devant l’ennemi
    let wanderDistance = 50;

    // à quel point l’orientation change à chaque frame
    let change = 0.3;

    // initialise l’angle si ce n'est pas déjà fait
    this.wanderTheta = this.wanderTheta || 0;

    // variation aléatoire de direction
    this.wanderTheta += random(-change, change);

    // position du cercle devant l’ennemi
    let circlePos = this.vel.copy();
    circlePos.setMag(wanderDistance);
    circlePos.add(this.pos);

    // direction générale de l’ennemi
    let h = this.vel.heading();

    // force aléatoire à l'intérieur du cercle
    let wanderForce = createVector(
        wanderRadius * cos(this.wanderTheta + h),
        wanderRadius * sin(this.wanderTheta + h)
    );

    // limite la force appliquée
    wanderForce.limit(this.maxForce);

    // applique la force de wander
    this.applyForce(wanderForce);
  }

  // ------------------------------------------------------------
  // UPDATE : comportement complet de l’ennemi à chaque frame
  // ------------------------------------------------------------
  update(playerPos, obstacles, enemies) {
    // 1) L’ennemi cherche le joueur (SEEK)
    let f = this.seek(playerPos);
    this.applyForce(f);

    // 2) Wander pour un mouvement naturel (évite mouvement robotique)
    this.wander();

    // 3) Évite les obstacles si il y en a
    if (obstacles.length > 0)
      this.applyForce(this.avoidObstacles(obstacles));

    // 4) Évite les autres ennemis pour éviter les collisions moches
    if (enemies.length > 0)
      this.applyForce(this.avoidVehicles(enemies));

    // 5) Mise à jour de la physique (vel, pos, acc)
    super.update();
  }

  // ------------------------------------------------------------
  // Gestion des dégâts
  // ------------------------------------------------------------
  takeDamage(d) {
    this.hp -= d;
    if (this.hp <= 0) this.die();
  }

  // ------------------------------------------------------------
  // Mort de l'ennemi
  // Drop d'XP + marquage comme "mort"
  // ------------------------------------------------------------
  die() {
    // spawn entre 1 et 3 orbes d’XP
    let count = floor(random(1, 4));

    for (let i = 0; i < count; i++) {
      // vitesse aléatoire pour faire "exploser" les orbes
      let v = p5.Vector.random2D().mult(random(0.5, 1.5));

      // spawn légèrement décalé autour du cadavre
      orbs.push(new Orb(
        this.pos.x + random(-8, 8),
        this.pos.y + random(-8, 8),
        v
      ));
    }

    // flag pour permettre au code principal de le supprimer
    this.dead = true;
  }

  // ------------------------------------------------------------
  // AFFICHAGE
  // ------------------------------------------------------------
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // --- IMAGE DE L’ENNEMI ---
    imageMode(CENTER);
    image(imgEnemy, 0, 0, this.r, this.r);

    // --- BARRE DE VIE ---
    noStroke();

    // barre de fond (rouge)
    fill(255, 0, 0);
    rect(-this.r/2, -this.r - 6, this.r, 4);

    // barre verte proportionnelle à la vie
    fill(0, 255, 0);
    let w = map(this.hp, 0, 10, 0, this.r);
    rect(-this.r/2, -this.r - 6, w, 4);

    pop();
  }
}
