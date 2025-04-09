class Explosion {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = position
    this.spriteSheet = new Image()
    this.spriteSheet.src = 'img/ExplosionSuperSeedTower.png'
    this.frameWidth = 32 // Width of each frame in the sprite sheet
    this.frameHeight = 32 // Height of each frame in the sprite sheet
    this.scale = 3 // Same scale as the SuperSeed projectile (3 times larger)
    this.scaledWidth = this.frameWidth * this.scale
    this.scaledHeight = this.frameHeight * this.scale
    this.frames = 4 // Number of frames in the sprite sheet
    this.currentFrame = 0 // Current frame of the animation
    this.frameCounter = 0 // Counter to control animation speed
    this.frameSpeed = 5 // Update frame every 5 updates (adjust for animation speed)
    this.isFinished = false // Flag to indicate when the animation is done
  }

  draw() {
    if (this.spriteSheet.complete && this.spriteSheet.naturalWidth !== 0) {
      c.drawImage(
        this.spriteSheet,
        this.currentFrame * this.frameWidth, // Source x
        0, // Source y (horizontal sprite sheet)
        this.frameWidth, // Source width
        this.frameHeight, // Source height
        this.position.x - this.scaledWidth / 2, // Destination x (centered)
        this.position.y - this.scaledHeight / 2, // Destination y (centered)
        this.scaledWidth, // Destination width (scaled)
        this.scaledHeight // Destination height (scaled)
      )
    } else {
      // Fallback if sprite sheet fails to load
      c.fillStyle = 'orange'
      c.beginPath()
      c.arc(this.position.x, this.position.y, 15, 0, Math.PI * 2)
      c.fill()
      c.closePath()
    }
  }

  update() {
    if (this.isFinished) return

    this.draw()

    // Update animation
    this.frameCounter++
    if (this.frameCounter >= this.frameSpeed) {
      this.currentFrame++
      this.frameCounter = 0
      if (this.currentFrame >= this.frames) {
        this.isFinished = true // Mark the animation as finished
      }
    }
  }
}