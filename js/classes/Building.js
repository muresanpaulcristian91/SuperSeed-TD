class Building {
    constructor({ position = { x: 0, y: 0 }, towerType }) {
        this.position = position;
        this.width = 102; // Reduced by 20% (128 * 0.8, rounded)
        this.height = 130;
        this.adjustedPosition = {
            x: position.x + 13, // Center the 102x102 tower on a 128x128 tile
            y: position.y + 0  // Moved down by 40% of tile height (128 * 0.4 = 51 pixels)
        };
        this.center = {
            x: position.x + 64, // Center of the 128x128 tile for consistent targeting
            y: position.y + 38 // Adjusted for new height and downward shift
        };

        this.towerType = towerType;
        this.projectiles = [];
        this.radius = towerType.range;
        this.target = null;
        this.frames = 0;
        this.level = 1;
        this.damage = towerType.damage;
        this.fireRate = towerType.fireRate;
        this.slowFactor = towerType.slowFactor || null;
        this.slowDuration = towerType.slowDuration || null;
        this.splash = towerType.splash || false;
        this.splashRadius = towerType.splashRadius || 0;
        this.image = towerType.images[this.level - 1];
        this.lastShotTime = 0;
        this.totalCost = towerType.cost;
    }

    draw() {
        c.drawImage(
            this.image,
            this.adjustedPosition.x,
            this.adjustedPosition.y,
            this.width,
            this.height
        );
    }

    update() {
        this.draw();
        const currentTime = Date.now();
        if (
            currentTime - this.lastShotTime >= this.fireRate &&
            this.target &&
            this.isEnemyInRange(this.target)
        ) {
            this.shoot();
            this.lastShotTime = currentTime;
        }

        if (
            !this.target ||
            !enemies.includes(this.target) ||
            !this.isEnemyInRange(this.target)
        ) {
            this.target = this.findTarget();
        }
    }

    findTarget() {
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (this.isEnemyInRange(enemy)) {
                return enemy;
            }
        }
        return null;
    }

    findMultipleTargets(maxTargets) {
        const targets = [];
        const usedEnemies = new Set();

        for (let i = 0; i < enemies.length && targets.length < maxTargets; i++) {
            const enemy = enemies[i];
            if (this.isEnemyInRange(enemy) && !usedEnemies.has(enemy)) {
                targets.push(enemy);
                usedEnemies.add(enemy);
            }
        }

        return targets;
    }

    isEnemyInRange(enemy) {
        const dx = this.center.x - enemy.center.x;
        const dy = this.center.y - enemy.center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius;
    }

    shoot() {
        const projectileImage = this.towerType.name === 'BasicTower' ? projectileSpiritSeedImage :
            this.towerType.name === 'AoETower' ? projectileStoneSeedImage :
                this.towerType.name === 'SlowTower' ? projectilePoisonSeedImage :
                    projectileSuperSeedImage;

        if (this.towerType.name === 'SlowTower') {
            const maxProjectiles = this.level === 1 ? 2 : this.level === 2 ? 4 : 6;
            const targets = this.findMultipleTargets(maxProjectiles);

            if (targets.length === 0) {
                return;
            }

            const numProjectilesToFire = targets.length;
            const firstTarget = targets[0];
            const dx = firstTarget.center.x - this.center.x;
            const dy = firstTarget.center.y - this.center.y;
            const baseAngle = Math.atan2(dy, dx);
            const spreadAngle = Math.PI / 12;
            const angleStep = numProjectilesToFire > 1 ? spreadAngle / (numProjectilesToFire - 1) : 0;

            for (let i = 0; i < numProjectilesToFire; i++) {
                const target = targets[i];
                const angleOffset = numProjectilesToFire > 1 ? (i - (numProjectilesToFire - 1) / 2) * angleStep : 0;
                const angle = baseAngle + angleOffset;
                const offsetDistance = 5;
                const offsetX = Math.cos(angle) * offsetDistance;
                const offsetY = Math.sin(angle) * offsetDistance;

                const projectile = new Projectile({
                    position: {
                        x: this.center.x + offsetX,
                        y: this.center.y + offsetY
                    },
                    enemy: target,
                    power: this.damage,
                    slowFactor: this.slowFactor,
                    slowDuration: this.slowDuration,
                    splash: this.splash,
                    splashRadius: this.splashRadius,
                    image: projectileImage,
                    angle: angle
                });
                this.projectiles.push(projectile);
            }
        } else {
            const projectile = new Projectile({
                position: {
                    x: this.center.x,
                    y: this.center.y
                },
                enemy: this.target,
                power: this.damage,
                slowFactor: this.slowFactor,
                slowDuration: this.slowDuration,
                splash: this.splash,
                splashRadius: this.splashRadius,
                image: projectileImage
            });
            this.projectiles.push(projectile);
        }
    }

    upgrade() {
        if (this.level >= 3) return;
        this.level++;
        const stats = this.towerType.upgradeStats[this.level - 2];
        this.damage = stats.damage;
        this.fireRate = stats.fireRate || this.fireRate;
        this.radius = stats.range || this.radius;
        this.slowFactor = stats.slowFactor || this.slowFactor;
        this.slowDuration = stats.slowDuration || this.slowDuration;
        this.splashRadius = stats.splashRadius || this.splashRadius;
        this.image = this.towerType.images[this.level - 1];
        this.totalCost += stats.cost;
    }

    getUpgradeCost() {
        if (this.level >= 3) return 0;
        return this.towerType.upgradeStats[this.level - 1].cost;
    }

    getSellPrice() {
        return Math.floor(this.totalCost * 0.5);
    }

    isHovered(x, y) {
        return (
            x > this.adjustedPosition.x &&
            x < this.adjustedPosition.x + this.width &&
            y > this.adjustedPosition.y &&
            y < this.adjustedPosition.y + this.height
        );
    }

    getDamageType() {
        if (this.towerType.name === 'BasicTower') return 'Single Target';
        if (this.towerType.name === 'AoETower') return 'Splash';
        if (this.towerType.name === 'SlowTower') return 'Slow';
        if (this.towerType.name === 'SuperSeedTower') return 'Gold Repay';
        return 'Unknown';
    }
}