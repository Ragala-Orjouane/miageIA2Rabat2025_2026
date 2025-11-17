// --- PLAYER UPGRADES / STATS ---
// Objet qui contient toutes les statistiques évolutives du joueur.
// Chaque upgrade modifiera directement ces valeurs.
let playerStats = {
  level: 1,
  xp: 0,
  xpToNext: 10,              // XP nécessaire pour passer au niveau suivant
  projectileDmg: 1,          // Dégâts d’un seul projectile
  projectileSpeed: 7,        // Vitesse des projectiles tirés
  projectileCount: 4,        // Nombre de projectiles tirés à chaque tir
  moveSpeed: 4,              // Vitesse maximale du joueur (sa maxSpeed)
  hp:100,
  maxHp: 100
};


// --- ADAPTATION DE LA CLASSE Vehicle POUR LE JOUEUR ---
class Player extends Vehicle {
  constructor(x, y) {
    super(x, y);                     // Hérite position, vitesse, acceleration, etc.
    this.maxSpeed = playerStats.moveSpeed; // vitesse dépendante des stats du joueur
    this.color = "#FFD166";         // Couleur du joueur
    this.r_pourDessin = 12;         // Rayon visuel (pour le dessin seulement)
    this.r = this.r_pourDessin * 2; // Rayon logique (collision)
    this.hp = 100;
    this.maxHp = 100;

    this.hitFlashUntil = 0;         // Quand frappé → effet flash rouge pendant 150ms
    this.invincibleUntil = 0;       // Temps jusqu’auquel le joueur est invincible
  }

  // --- Tir automatique vers la souris ---
  autoFire() {
      // si le délai entre 2 tirs n’est pas passé → ne tire pas
      if (millis() - lastFire < fireInterval) return;
      lastFire = millis(); // enregistre le moment du tir

      // vecteur directionnel vers la souris
      let mouseDir = createVector(mouseX - this.pos.x, mouseY - this.pos.y);
      mouseDir.setMag(playerStats.projectileSpeed); // applique la vitesse du projectile

      // tire autant de projectiles que défini dans les stats
      for (let i = 0; i < playerStats.projectileCount; i++) {
          bullets.push(
            new Projectile(
              this.pos.x,
              this.pos.y,
              mouseDir,
              playerStats.projectileDmg,
              2000              // durée de vie du projectile
            )
          );
      }
  }



  // --- Gestion des dégâts reçus ---
  takeDamage(amount) {
    // Si le joueur est encore dans sa période d'invincibilité → aucun dégât
    if (millis() < this.invincibleUntil) return;

    this.hp -= amount;

    // Mise à jour des stats globales
    playerStats.hp = Math.max(this.hp, 0);

    // Petit flash rouge pendant 150ms
    this.hitFlashUntil = millis() + 150;

    // Mort du joueur
    if(this.hp <= 0){
        this.hp = 0;
        gameOver = true;
        console.log("GAME OVER");
        noLoop(); // arrête le draw()
    }
  }


  // --- Dessin du joueur ---
  show() {
    push();
    stroke(255);
    strokeWeight(2);

    // Si le joueur est invincible → couleur cyan
    if (millis() < this.invincibleUntil) fill(0,255,255);
    else fill(this.color);

    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // forme en losange (le joueur)
    beginShape();
    vertex(0, -this.r_pourDessin);
    vertex(this.r_pourDessin, 0);
    vertex(0, this.r_pourDessin);
    vertex(-this.r_pourDessin, 0);
    endShape(CLOSE);

    // effet de flash rouge quand touché
    if(millis() < this.hitFlashUntil){
        fill(255,0,0,120);       // rouge transparent
        circle(0,0,this.r*2.6);  // halo rouge autour du joueur
    }

    pop();
  }
}
