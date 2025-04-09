class Enemy extends Sprite {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, imageNamePrefix = '', enemyType }) {
        super({
            position,
            imageSrc: '',
            frames: { max: 7 },
            useIndividualImages: true,
            imagePrefix: 'img/',
            imageNamePrefix: imageNamePrefix,
            frameHold: 5
        });
        this.position = position;
        this.scale = enemyType.scale || 1;
        this.width = 126 * this.scale;
        this.height = 126 * this.scale;
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        };
        this.radius = (63 * this.scale);
        this.waveNumber = waveNumber;

        this.baseSpeed = enemyType.speed;
        this.baseDamage = enemyType.baseDamage;

        this.health = enemyType.health;
        this.maxHealth = this.health;

        this.velocity = { x: 0, y: 0 };
        this.speed = this.baseSpeed;
        this.slowEndTime = 0;
        this.slowFactor = 1;
        super.width = this.width;
        super.height = this.height;

        this.reward = enemyType.reward;
        this.isBoss = enemyType.isBoss || false;
    }

    draw() {
        super.draw();

        // Determine the vertical offset for the health bar and text
        let healthBarYOffset = -15 * this.scale; // Default position above the enemy
        if (this.isBoss) {
            // Draw "Boss" text above the health bar for boss enemies
            c.fillStyle = 'white';
            c.font = `${16 * this.scale}px Changa One`;
            c.textAlign = 'center';
            c.fillText(
                'Boss',
                this.position.x + this.width / 2,
                this.position.y - 30 * this.scale // Position above the health bar
            );
            c.textAlign = 'start'; // Reset text alignment
            healthBarYOffset = -5 * this.scale; // Adjust health bar position to be below "Boss" text
        }

        // Draw health bar, scaled to match the enemy's size
        const healthBarWidth = 70 * this.scale;
        const healthBarHeight = 7 * this.scale;
        c.fillStyle = 'red';
        c.fillRect(
            this.position.x + (this.width - healthBarWidth) / 2,
            this.position.y + healthBarYOffset,
            healthBarWidth,
            healthBarHeight
        );

        c.fillStyle = 'green';
        const displayHealth = Math.max(0, this.health);
        c.fillRect(
            this.position.x + (this.width - healthBarWidth) / 2,
            this.position.y + healthBarYOffset,
            (healthBarWidth * displayHealth) / this.maxHealth,
            healthBarHeight
        );

        // Draw health as digits above the health bar
        c.fillStyle = 'white';
        c.font = `${12 * this.scale}px Changa One`;
        c.textAlign = 'center';
        const healthText = Math.floor(this.health).toString();
        c.fillText(
            healthText,
            this.position.x + this.width / 2,
            this.position.y + healthBarYOffset - 5 * this.scale // Position above the health bar
        );
        c.textAlign = 'start'; // Reset text alignment
    }

    update(deltaTime = 1 / 60) {
        this.draw();
        super.update();

        const now = Date.now();

        // Handle slow effect
        if (now < this.slowEndTime) {
            this.speed = this.baseSpeed * this.slowFactor;
        } else {
            this.speed = this.baseSpeed;
            this.slowFactor = 1;
            this.slowEndTime = 0;
        }

        const waypoint = waypoints[this.waypointIndex];
        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);

        // Apply deltaTime to ensure consistent movement across frame rates
        this.velocity.x = Math.cos(angle) * this.speed * deltaTime * 60;
        this.velocity.y = Math.sin(angle) * this.speed * deltaTime * 60;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        };

        if (
            Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) <
            Math.abs(this.velocity.x) &&
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) <
            Math.abs(this.velocity.y) &&
            this.waypointIndex < waypoints.length - 1
        ) {
            this.waypointIndex++;
        }
    }

    applySlow(slowFactor, duration) {
        this.slowFactor = slowFactor;
        this.slowEndTime = Date.now() + duration;
        this.speed = this.baseSpeed * this.slowFactor;
    }
}
class EnemyK1 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K1_WALK_', enemyType });
    }
}

class EnemyK2 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K2_WALK_', enemyType });
    }
}

class EnemyK3 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K3_WALK_', enemyType });
    }
}

class EnemyK4 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K4_WALK_', enemyType });
    }
}

class EnemyK5 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K5_WALK_', enemyType });
    }
}

class EnemyK6 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K6_WALK_', enemyType });
    }
}

class EnemyK7 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K7_WALK_', enemyType });
    }
}

class EnemyK8 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K8_WALK_', enemyType });
    }
}

class EnemyK9 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K9_WALK_', enemyType });
    }
}

class EnemyK10 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K10_WALK_', enemyType });
    }
}

class EnemyK11 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K11_WALK_', enemyType });
    }
}

class EnemyK12 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'K12_WALK_', enemyType });
    }
}

class Boss1 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'Boss1_WALK_', enemyType });
    }
}

class Boss2 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'Boss2_WALK_', enemyType });
    }
}

class Boss3 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'Boss3_WALK_', enemyType });
    }
}

class Boss4 extends Enemy {
    constructor({ position = { x: 0, y: 0 }, waveNumber = 0, enemyType }) {
        super({ position, waveNumber, imageNamePrefix: 'Boss4_WALK_', enemyType });
    }
}