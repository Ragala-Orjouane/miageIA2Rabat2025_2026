# Réaliser par :
# Ragala Orjouane
# Survivors Game (p5.js)

**Description**  
Survivors Game est un petit jeu de type *Vampire Survivors*, développé avec p5.js.  
Le joueur contrôle un vaisseau dans un environnement spatial peuplé d’ennemis, d’obstacles et d’orbes à collecter.  
Le jeu propose un système de progression, des ennemis intelligents et une mécanique de Game Over.

## Fonctionnalités

### Joueur
- Se déplace vers la souris (*seek*).  
- Évite les obstacles.  
- Tire automatiquement des projectiles.  
- Possède des statistiques évolutives : points de vie, vitesse, nombre de projectiles, dégâts.  
- Peut devenir temporairement invincible en collectant des orbes spéciales.

### Projectiles
- Cherchent un ennemi spécifique (*seek*) et ne changent pas de cible.  
- Infligent des dégâts à l’ennemi touché.  
- Expirent après un certain temps.

### Ennemis
- Cherchent le joueur (*seek*).  
- Évitent obstacles et autres ennemis (effet de *steering*).  
- Infligent des dégâts au joueur en cas de collision.  
- Lâchent des orbes à leur mort :  
  - Orbes classiques : donnent de l’expérience.  
  - Orbes spéciales : donnent l’invincibilité temporaire.

### Orbes
- Classiques : collectés pour gagner de l’expérience.  
- Spéciales : collectées pour rendre le joueur invincible pendant quelques secondes.

### Obstacles
- Générés aléatoirement sur le terrain.  
- Évitables par le joueur et les ennemis.  
- Apportent un défi stratégique pour se déplacer et tirer.

## Progression et statistiques
- Le joueur gagne de l’expérience en collectant des orbes.  
- À chaque niveau, ses statistiques s’améliorent :  
  - Dégâts des projectiles  
  - Vitesse de déplacement  
  - Points de vie

## Game Over et redémarrage
- Affiche **GAME OVER** lorsque les points de vie du joueur atteignent zéro.  
- Le jeu peut être relancé avec la touche **ENTER**.  
- Réinitialise le joueur, les ennemis, les obstacles et les orbes.

## Contrôles
- **Souris** : déplacer le joueur.  
- **ENTER** : redémarrer le jeu après un Game Over.

## Ressources
- Images utilisées :  
  - `enemy.png` (ennemi)  
  - `planet.png` (obstacles)  
  - `space.png` (background)  
- Bibliothèque : [p5.js](https://p5js.org/)

## Structure du code
- **Vehicle** : classe de base pour le joueur et les ennemis, avec mouvements, *seek*, *avoid* et *steering*.  
- **Player** : hérite de Vehicle, ajoute la mécanique de tir, points de vie et invincibilité.  
- **Enemy** : hérite de Vehicle, ajoute la mort et le drop d’orbes.  
- **Projectile** : gère les projectiles et leur comportement.  
- **Orb / SpecialOrb** : gère les objets à collecter.  
- **Obstacle** : gère les obstacles du terrain.
