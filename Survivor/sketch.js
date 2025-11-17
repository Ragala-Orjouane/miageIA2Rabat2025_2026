// ───────────────────────────────────────────
// VARIABLES GLOBALES DU JEU
// ───────────────────────────────────────────

// Le joueur
let player;

// Les tableaux stockent toutes les entités du jeu
let enemies = [];     // ennemis
let obstacles = [];   // planètes/obstacles
let bullets = [];     // projectiles du joueur
let orbs = [];        // orbes d’XP
let specialOrbs = []; // orbes donnant une compétence spéciale

// Timers pour gérer le spawn et le tir
let spawnTimer = 0;
let spawnInterval = 2000; // délai entre spawns ennemis (ms)
let lastFire = 0;
let fireInterval = 200;   // délai entre tirs (ms)
let difficultyTimer = 0;  // gère l’augmentation de difficulté

// Nombre maximum d’ennemis en même temps
let maxEnemies = 50;

// Buffs temporaires
let projectileBuffUntil = 0;

// Images du jeu
let imgEnemy, imgPlanet, imgBackground;

// Flag pour savoir si le joueur est mort
let gameOver = false;


// ───────────────────────────────────────────
// CHARGEMENT DES IMAGES
// ───────────────────────────────────────────
function preload() {
    imgEnemy = loadImage("assets/enemy.png");
    imgPlanet = loadImage("assets/planet.png");
    imgBackground = loadImage("assets/space.png");
}



// ───────────────────────────────────────────
// GÉNÉRATION DES OBSTACLES SANS SE TOUCHER
// ───────────────────────────────────────────
function spawnObstacles() {

  let count = 10;               // nombre d’obstacles voulus
  let minDistBetween = 160;     // distance minimale entre deux obstacles
  let avoidCenter = 220;        // zone à éviter autour du joueur
  let tries = 0;                // sécurité anti-boucle infinie

  while (obstacles.length < count && tries < 5000) {
    tries++;

    // Chaque obstacle a un rayon aléatoire
    let r = random(35, 110);

    // Position aléatoire à l’écran
    let x = random(r, width - r);
    let y = random(r, height - r);

    // On évite qu’un obstacle pop trop près du joueur
    if (dist(x, y, width/2, height/2) < avoidCenter) continue;

    // Vérification : est-ce qu’il touche un autre obstacle ?
    let ok = true;
    for (let o of obstacles) {
      let d = dist(x, y, o.pos.x, o.pos.y);

      if (d < o.r + r + minDistBetween) {
        ok = false;
        break;
      }
    }

    // Si tout est OK → on l’ajoute
    if (ok) {
      obstacles.push(
        new Obstacle(x, y, r, color(random(50,255), random(50,255), random(50,255)))
      );
    }
  }

  console.log("Obstacles placés :", obstacles.length);
}



// ───────────────────────────────────────────
// INITIALISATION DU JEU
// ───────────────────────────────────────────
function setup(){
    createCanvas(windowWidth, windowHeight);

    // Le joueur démarre au centre
    player = new Player(width / 2, height / 2);

    // Générer quelques ennemis au début
    for(let i = 0; i < 8; i++){
        enemies.push(new Enemy(
            random(width),
            random(height),
            floor(random(2,5)),        // HP
            random(0.8,1.6)           // vitesse
        ));
    }

    // Génération des planètes
    spawnObstacles();

    spawnTimer = millis();
    difficultyTimer = millis();
}



// ───────────────────────────────────────────
// BOUCLE PRINCIPALE DU JEU
// ───────────────────────────────────────────
function draw() {

    // Affichage de l’arrière-plan
    image(imgBackground,0,0,width,height);

    // Déplacement automatique du joueur vers la souris
    let mousePos = createVector(mouseX,mouseY);
    let seekForce = player.seek(mousePos).mult(1.5);
    player.applyForce(seekForce);

    // Le joueur évite automatiquement les obstacles
    for (let o of obstacles) {
        let avoidForce = player.avoidObstacles([o]);
        player.applyForce(avoidForce);
    }

    // Mise à jour + dessin du joueur
    player.update();
    player.show();

    // Tir automatique du joueur
    player.autoFire();



    // ─────────────────────────────
    // GESTION DES PROJECTILES
    // ─────────────────────────────
    for(let i = bullets.length - 1; i >= 0; i--){
        let b = bullets[i];

        b.update(enemies);
        b.show();

        // Collision balle → ennemi
        for(let j = enemies.length - 1; j >= 0; j--){
            let e = enemies[j];

            if(!e) continue;

            if(p5.Vector.dist(b.pos,e.pos) < (b.r + e.r)){
                e.takeDamage(b.dmg);
                bullets.splice(i,1);
                break;
            }
        }

        // Suppression des balles expirées
        if(b && b.isExpired()){
            let idx = bullets.indexOf(b);
            if(idx >= 0) bullets.splice(idx,1);
        }
    }



    // ─────────────────────────────
    // SPAWN DES ENNEMIS
    // ─────────────────────────────
    if(millis() - spawnTimer > spawnInterval){
        spawnTimer = millis();

        if(enemies.length < maxEnemies){

            // Spawn hors-écran
            let edge = floor(random(4));
            let x,y;

            if(edge === 0){x = random(-20,20); y = random(height);}
            else if(edge === 1){x = random(width,width+20); y = random(height);}
            else if(edge === 2){x = random(width); y = random(-20,0);}
            else {x = random(width); y = random(height+20,height+40);}

            // Ennemi plus fort selon le niveau
            let hp  = floor(random(1+playerStats.level*0.3, 3 + playerStats.level*0.6));
            let spd = random(0.7+playerStats.level*0.02, 1.6 + playerStats.level*0.03);

            enemies.push(new Enemy(x,y,hp,spd));
        }
    }

    // Augmentation de difficulté progressive
    if (millis() - difficultyTimer > 2000){
        difficultyTimer = millis();
        spawnInterval = max(200, spawnInterval - 120);
        maxEnemies = min(500, maxEnemies + 30);
    }



    // ─────────────────────────────
    // MISE À JOUR DES ENNEMIS
    // ─────────────────────────────
    for(let i = enemies.length - 1; i >= 0; i--){
        let e = enemies[i];
        if(!e) continue;

        // IA de l’ennemi : poursuite + évitement obstacles
        e.update(player.pos, obstacles, enemies);

        // Collision ennemi → joueur
        if(circleCollide(e,player)){
            let push = p5.Vector.sub(player.pos,e.pos).setMag(2);
            player.applyForce(push);
            player.takeDamage(5);
        }

        // Ennemi mort → drop d'orbe
        if(e.dead){
            if(random() < 0.15){
                specialOrbs.push(new SpecialOrb(e.pos.x, e.pos.y));
            }
            enemies.splice(i,1);
        } else {
            e.show();
        }
    }



    // Dessin des obstacles
    for(let o of obstacles) o.show();



    // ─────────────────────────────
    // ORBES D’XP NORMAUX
    // ─────────────────────────────
    for(let i = orbs.length - 1; i >= 0;i--){
        let o = orbs[i];
        o.update();
        o.show();

        if(o.collected){
            collectXP(1);
            orbs.splice(i,1);
        }
    }


    // ─────────────────────────────
    // ORBES SPÉCIAUX (invincibilité)
    // ─────────────────────────────
    for(let i = specialOrbs.length - 1; i >= 0; i--){
        let o = specialOrbs[i];

        o.update();
        o.show();

        if(o.collected){
            player.invincibleUntil = millis() + 3000; // invincibilité 3 sec
            specialOrbs.splice(i,1);
        } else if(o.isExpired()){
            specialOrbs.splice(i,1);
        }
    }


    // HUD (interface)
    drawHUD();
}



// ───────────────────────────────────────────
// GESTION DE L’XP ET LEVEL UP
// ───────────────────────────────────────────
function collectXP(amount) {
  playerStats.xp += amount;

  // Si l'on atteint assez d'XP → level up
  while (playerStats.xp >= playerStats.xpToNext) {

    playerStats.xp -= playerStats.xpToNext;
    playerStats.level++;
    playerStats.xpToNext = floor(playerStats.xpToNext * 1.6);

    // Améliorations automatiques
    playerStats.projectileDmg += 0.2;
    player.maxSpeed = playerStats.moveSpeed + playerStats.level * 0.03;

    let hpIncrease = playerStats.level * 10;
    playerStats.maxHp += hpIncrease;
    playerStats.hp = playerStats.maxHp;
    player.hp = playerStats.hp;
    player.maxHp = playerStats.maxHp;

    // Effet visuel : particules d’XP
    for (let i = 0; i < 8; i++)
        orbs.push(
            new Orb(player.pos.x + random(-8,8),
                    player.pos.y + random(-8,8),
                    p5.Vector.random2D().mult(random(0.5,2)))
        );
  }
}



// ───────────────────────────────────────────
// INTERFACE VISUELLE
// ───────────────────────────────────────────
function drawHUD() {
  push();
  fill(255);
  textSize(14);
  text(`Level: ${playerStats.level}`, 10, 10);
  text(`XP: ${playerStats.xp} / ${playerStats.xpToNext}`, 10, 30);
  text(`HP: ${playerStats.hp} / ${playerStats.maxHp}`, 10, 50);
  text(`Enemies: ${enemies.length}`, 10, 70);
  text(`Projectiles: ${playerStats.projectileCount}`, 10, 90);
  pop();

  // Affichage du texte GAME OVER
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

  // Barre de HP
  push();
  translate(10,136);
  stroke(255);
  rect(0,0,200,14);
  let hpw = map(playerStats.hp, 0, 100,0,200);
  fill(255,80,80);
  rect(0,0,hpw,14);
  pop();

  // Barre d’XP
  push();
  translate(10, 116);
  stroke(255);
  rect(0, 0, 200, 14);
  fill(120, 200, 255);
  let w = map(playerStats.xp, 0, playerStats.xpToNext, 0, 200);
  rect(0, 0, w, 14);
  pop();
}



// ───────────────────────────────────────────
// INPUT CLAVIER
// ───────────────────────────────────────────
function keyPressed() {
    if(gameOver && keyCode === ENTER){
        restartGame();
    }
}



// Vérifie collision cercle-cercle
function circleCollide(a,b){
    let d = p5.Vector.dist(a.pos,b.pos);
    return d < (a.r + b.r);
}



// ───────────────────────────────────────────
// RESET COMPLET DU JEU
// ───────────────────────────────────────────
function restartGame(){

    // Réinitialisation des stats du joueur
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

    // Réinitialisation totale des entités
    enemies = [];
    bullets = [];
    orbs = [];
    specialOrbs = [];
    obstacles = [];
    spawnObstacles();

    // Remise à zéro des timers
    spawnTimer = millis();
    difficultyTimer = millis();
    projectileBuffUntil = 0;

    gameOver = false;

    loop(); // relance draw()
}
