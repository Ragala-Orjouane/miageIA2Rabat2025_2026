class Vehicle {
  static debug = false;

  constructor(x, y) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = createVector(0, 0);
    // accélération du véhicule
    this.acc = createVector(0, 0);
    // vitesse maximale du véhicule
    this.maxSpeed = 4;
    // force maximale appliquée au véhicule
    this.maxForce = 0.2;
    this.color = "white";
    // à peu près en secondes
    this.dureeDeVie = 5;

    this.r_pourDessin = 16;
    // rayon du véhicule pour l'évitement
    this.r = this.r_pourDessin * 3;

    // Pour évitement d'obstacle
    this.largeurZoneEvitementDevantVaisseau = this.r / 2;

    // chemin derrière vaisseaux
    this.path = [];
    this.pathMaxLength = 30;

   
  }

  // --- Évite uniquement les obstacles, pour tous ---
avoidObstacles(obstacles) {
  if (obstacles.length === 0) return createVector(0, 0);

  // points ahead pour anticiper la collision
  let lookahead = this.vel.mag() * 10 + this.r;
  let ahead = p5.Vector.add(this.pos, this.vel.copy().normalize().mult(lookahead));
  let ahead2 = p5.Vector.add(this.pos, this.vel.copy().normalize().mult(lookahead * 0.5));

  let mostThreatening = null;
  let closestDistance = Infinity;

  // trouver l'obstacle le plus proche
  obstacles.forEach(ob => {
    let collision = ob.pos.dist(this.pos) <= ob.r + this.r ||
                    ob.pos.dist(ahead) <= ob.r + this.r ||
                    ob.pos.dist(ahead2) <= ob.r + this.r;

    if (collision) {
      let d = this.pos.dist(ob.pos);
      if (d < closestDistance) {
        closestDistance = d;
        mostThreatening = ob;
      }
    }
  });

  if (!mostThreatening) return createVector(0, 0);

  // force radiale de base
  let avoidance = p5.Vector.sub(this.pos, mostThreatening.pos);

  // utiliser ahead ou ahead2 si plus proche
  let distAhead = ahead.dist(mostThreatening.pos);
  let distAhead2 = ahead2.dist(mostThreatening.pos);
  if (distAhead2 < distAhead && distAhead2 < closestDistance) {
    avoidance = p5.Vector.sub(ahead2, mostThreatening.pos);
    closestDistance = distAhead2;
  } else if (distAhead < closestDistance) {
    avoidance = p5.Vector.sub(ahead, mostThreatening.pos);
    closestDistance = distAhead;
  }

  // ajouter composante tangentielle pour glisser autour de l’obstacle
  let tangent = p5.Vector.sub(this.pos, mostThreatening.pos);
  tangent.normalize();
  tangent.rotate(HALF_PI); // rotation de 90° pour contourner
  tangent.mult(0.5);
  avoidance.add(tangent);


  // normalisation et magnitude selon distance
  avoidance.normalize();
  let forceMag = map(closestDistance, 0, this.r + 70, this.maxForce * 8, 0);
  avoidance.mult(forceMag);

  if (Vehicle.debug) {
    this.drawVector(this.pos, avoidance, "yellow");
  }

  return avoidance;
}




// --- Évite uniquement les autres véhicules, mais uniquement pour snakes et enemies ---
avoidVehicles(others) {
    // Si c'est le player, il ne doit pas éviter les snakes/enemies
    if (this instanceof Player) return createVector(0, 0);

    let ahead = this.vel.copy();
    ahead.setMag(30);
    let ahead2 = ahead.copy().mult(0.5);

    let closest = null;
    let minDist = Infinity;

    for (let v of others) {
        // Ne pas éviter soi-même et ne pas éviter le player
        if (v === this || v instanceof Player) continue;

        let distAhead = this.pos.copy().add(ahead).dist(v.pos);
        let distAhead2 = this.pos.copy().add(ahead2).dist(v.pos);
        let d = min(distAhead, distAhead2);

        if (d < minDist) {
            minDist = d;
            closest = v;
        }
    }

    if (!closest) return createVector(0, 0);

    let sumR = this.r + (closest.r || 0) + this.largeurZoneEvitementDevantVaisseau;
    if (minDist < sumR) {
        let force;
        if (minDist === this.pos.copy().add(ahead).dist(closest.pos)) {
            force = p5.Vector.sub(this.pos.copy().add(ahead), closest.pos);
        } else {
            force = p5.Vector.sub(this.pos.copy().add(ahead2), closest.pos);
        }
        force.setMag(this.maxSpeed);
        force.sub(this.vel);
        force.limit(this.maxForce);
        return force;
    }

    return createVector(0, 0);
}





  // Permet de rester dans les limites d'une zone rectangulaire.
  // Lorsque le véhicule s'approche d'un bord vertical ou horizontal
  // on calcule la vitesse désirée dans la direction "réfléchie" par
  // rapport au bord (comme au billard).
  // Par exemple, si le véhicule s'approche du bord gauche à moins de 
  // 25 pixels (valeur par défaut de la variable d),
  // on calcule la vitesse désirée en gardant le x du vecteur vitesse
  // et en mettant son y positif. x vaut maxSpeed et y vaut avant une valeur
  // négative (puisque le véhicule va vers la gauche), on lui donne un y positif
  // ça c'est pour la direction à prendre (vitesse désirée). Une fois la direction
  // calculée on lui donne une norme égale à maxSpeed, puis on calcule la force
  // normalement : force = vitesseDesiree - vitesseActuelle
  // paramètres = un rectangle (bx, by, bw, bh) et une distance d




  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    if (arrival) {
      let slowRadius = 100;
      let distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }



  // applyForce est une méthode qui permet d'appliquer une force au véhicule
  // en fait on additionne le vecteurr force au vecteur accélération
  applyForce(force) {
    this.acc.add(force);
  }

  update() {
      this.vel.add(this.acc);
      let speed = this.vel.mag();
      if(speed > this.maxSpeed){
          this.vel.setMag(this.maxSpeed);
      }
      this.pos.add(this.vel);
      this.acc.mult(0); // reset acc

      // mise à jour du path (trainée)
      this.ajoutePosAuPath();

      // durée de vie
      this.dureeDeVie -= 0.01;
  }



  ajoutePosAuPath() {
    // on rajoute la position courante dans le tableau
    this.path.push(this.pos.copy());

    // si le tableau a plus de 50 éléments, on vire le plus ancien
    if (this.path.length > this.pathMaxLength) {
      this.path.shift();
    }
  }

  // On dessine le véhicule, le chemin etc.
  show() {
    // dessin du chemin
    this.drawPath();
    // dessin du vehicule
    this.drawVehicle();
  }

  drawVehicle() {
      push();
      translate(this.pos.x, this.pos.y);
      let targetAngle = this.vel.heading();
      this.angle = this.angle || targetAngle;
      this.angle = lerp(this.angle, targetAngle, 0.1);
      rotate(this.angle);
      fill(this.color);
      triangle(-this.r_pourDessin, -this.r_pourDessin/2, -this.r_pourDessin, this.r_pourDessin/2, this.r_pourDessin, 0);
      pop();
  }


  drawPath() {
      push();
      noFill();
      for(let i=0; i<this.path.length; i++){
          let alpha = map(i, 0, this.path.length, 0, 255);
          stroke(red(this.color), green(this.color), blue(this.color), alpha);
          let p = this.path[i];
          ellipse(p.x, p.y, i/2);
      }
      pop();
  }

  drawVector(pos, v, color) {
    push();
    // Dessin du vecteur vitesse
    // Il part du centre du véhicule et va dans la direction du vecteur vitesse
    strokeWeight(3);
    stroke(color);
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

}
