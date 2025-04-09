class Projectile {
    constructor({ position = { x: 0, y: 0 }, enemy, power, slowFactor, slowDuration, splash, splashRadius, image, angle }) {
        this.position = position;
        this.enemy = enemy;
        this.power = power;
        this.slowFactor = slowFactor;
        this.slowDuration = slowDuration;
        this.splash = splash;
        this.splashRadius = splashRadius;
        this.image = image;
        this.width = 32;
        this.height = 32;
        this.speed = 5;
        this.hasHit = false;
        this.angle = angle || null;
    }

    draw() {
        if (this.image.complete && this.image.naturalWidth !== 0) {
            c.drawImage(
                this.image,
                this.position.x - this.width / 2,
                this.position.y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            c.fillStyle = 'purple';
            c.fillRect(
                this.position.x - this.width / 2,
                this.position.y - this.height / 2,
                this.width,
                this.height
            );
        }
    }

    update() {
        this.draw();

        if (this.hasHit) return;

        if (!this.enemy || !enemies.includes(this.enemy)) {
            this.hasHit = true;
            return;
        }

        const dx = this.enemy.center.x - this.position.x;
        const dy = this.enemy.center.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const moveAngle = Math.atan2(dy, dx);

        if (distance < this.speed) {
            this.position.x = this.enemy.center.x;
            this.position.y = this.enemy.center.y;
            this.hasHit = true;
        } else {
            this.position.x += Math.cos(moveAngle) * this.speed;
            this.position.y += Math.sin(moveAngle) * this.speed;
        }

        const hitDistance = Math.sqrt(
            (this.enemy.center.x - this.position.x) ** 2 +
            (this.enemy.center.y - this.position.y) ** 2
        );
        if (hitDistance < 15) {
            this.hasHit = true;
        }
    }
}