class EnemyK2 {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = position;
    this.width = 100;
    this.height = 100;
    this.waypointIndex = 0;
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };
    this.radius = 50;
    this.health = 150;
    this.baseSpeed = 1.5; // Base speed (slower than Enemy)
    this.speed = this.baseSpeed; // Current speed
    this.slowEndTime = 0; // When the slow effect ends
    this.slowFactor = 1; // Multiplier for speed (1 = normal, 0.5 = half speed)
    this.poisonDamage = 0; // Total poison damage to apply over time
    this.poisonDuration = 0; // Remaining duration of poison effect (in milliseconds)
    this.poisonTickRate = 1000; // Apply poison damage every second
    this.lastPoisonTick = 0; // Last time poison damage was applied
    this.currentFrame = 0;
    this.frameCount = 7;
    this.frameRate = 100;
    this.lastFrameUpdate = 0;
  }

  draw() {
    if (enemyK2Images[this.currentFrame].complete && enemyK2Images[this.currentFrame].naturalWidth !== 0) {
      c.drawImage(
        enemyK2Images[this.currentFrame],
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    } else {
      c.fillStyle = 'purple';
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    c.fillStyle = 'red';
    c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

    c.fillStyle = 'green';
    c.fillRect(
      this.position.x,
      this.position.y - 15,
      this.width * (this.health / 150),
      10
    );
  }

  update() {
    this.draw();

    const now = Date.now();

    // Update animation frame
    if (now - this.lastFrameUpdate >= this.frameRate) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.lastFrameUpdate = now;
    }

    // Handle slow effect
    if (now < this.slowEndTime) {
      this.speed = this.baseSpeed * this.slowFactor;
    } else {
      this.speed = this.baseSpeed; // Reset speed after slow effect ends
      this.slowFactor = 1;
    }

    // Handle poison damage over time
    if (this.poisonDuration > 0) {
      if (now - this.lastPoisonTick >= this.poisonTickRate) {
        const tickDamage = (this.poisonDamage / (this.poisonDuration / this.poisonTickRate));
        this.health -= tickDamage;
        this.lastPoisonTick = now;
      }
      this.poisonDuration -= 16; // Roughly 60 FPS (1000ms / 60 ≈ 16ms per frame)
      if (this.poisonDuration <= 0) {
        this.poisonDamage = 0;
      }
    }

    const waypoint = waypoints[this.waypointIndex];
    const yDistance = waypoint.y - this.position.y;
    const xDistance = waypoint.x - this.position.x;
    const angle = Math.atan2(yDistance, xDistance);

    this.position.x += Math.cos(angle) * this.speed;
    this.position.y += Math.sin(angle) * this.speed;

    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };

    if (
      Math.abs(this.position.x - waypoint.x) <= this.speed &&
      Math.abs(this.position.y - waypoint.y) <= this.speed &&
      this.waypointIndex < waypoints.length - 1
    ) {
      this.waypointIndex++;
    }
  }

  applySlow(slowFactor, duration) {
    this.slowFactor = slowFactor; // e.g., 0.5 for 50% speed
    this.slowEndTime = Date.now() + duration;
  }

  applyPoison(damage, duration) {
    this.poisonDamage += damage;
    this.poisonDuration = duration;
    this.lastPoisonTick = Date.now();
  }
}