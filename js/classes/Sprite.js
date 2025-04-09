class Sprite {
  constructor({
    position = { x: 0, y: 0 },
    imageSrc,
    frames = { max: 1 },
    offset = { x: 0, y: 0 },
    useIndividualImages = false,
    imagePrefix = '',
    imageNamePrefix = '',
    frameHold = 3 // New parameter to control animation speed
  }) {
    this.position = position;
    this.useIndividualImages = useIndividualImages;
    this.imagePrefix = imagePrefix;
    this.imageNamePrefix = imageNamePrefix;
    this.offset = offset;
    this.width = 100; // Default width
    this.height = 100; // Default height
    this.loaded = false; // Track if all images are loaded
    this.loadError = false; // Track if there was an error loading images

    if (useIndividualImages) {
      this.images = [];
      let loadedImages = 0;
      const totalImages = frames.max;

      for (let i = 0; i < frames.max; i++) {
        const img = new Image();
        const imageNumber = i.toString().padStart(3, '0');
        img.src = `${imagePrefix}${imageNamePrefix}${imageNumber}.png`;
        img.onload = () => {
          loadedImages++;
          if (!this.width || !this.height) {
            this.width = img.naturalWidth;
            this.height = img.naturalHeight;
          }
          if (loadedImages === totalImages) {
            this.loaded = true;
            console.log(`All images loaded for ${imageNamePrefix}`);
          }
        };
        img.onerror = () => {
          loadedImages++;
          console.error(`Failed to load image: ${img.src}`);
          this.loadError = true;
          if (loadedImages === totalImages) {
            this.loaded = true; // Mark as loaded even if there’s an error
            console.log(`Finished loading images for ${imageNamePrefix} with errors`);
          }
        };
        this.images.push(img);
      }
    } else {
      this.image = new Image();
      this.image.src = imageSrc;
      this.image.onload = () => {
        if (!this.width || !this.height) {
          this.width = this.image.naturalWidth;
          this.height = this.image.naturalHeight;
        }
        this.loaded = true;
        console.log(`Single image loaded: ${imageSrc}`);
      };
      this.image.onerror = () => {
        console.error(`Failed to load image: ${imageSrc}`);
        this.loadError = true;
        this.loaded = true; // Mark as loaded even if there s an error
      };
    }

    this.frames = {
      max: frames.max,
      current: 0,
      elapsed: 0,
      hold: frameHold // Use the passed frameHold value
    };
  }

  draw() {
    if (this.useIndividualImages) {
      const currentImage = this.images[Math.floor(this.frames.current)];
      if (currentImage && currentImage.complete && currentImage.naturalWidth !== 0) {
        c.drawImage(
          currentImage,
          this.position.x + this.offset.x,
          this.position.y + this.offset.y,
          this.width,
          this.height
        );
      } else {
        c.fillStyle = 'red';
        c.fillRect(
          this.position.x + this.offset.x,
          this.position.y + this.offset.y,
          this.width,
          this.height
        );
      }
    } else {
      if (this.frames.max > 1) {
        const cropWidth = this.image.width / this.frames.max;
        const crop = {
          position: {
            x: cropWidth * this.frames.current,
            y: 0
          },
          width: cropWidth,
          height: this.image.height
        };
        if (this.image.complete && this.image.naturalWidth !== 0) {
          c.drawImage(
            this.image,
            crop.position.x,
            crop.position.y,
            crop.width,
            crop.height,
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            this.width || crop.width,
            this.height || crop.height
          );
        } else {
          c.fillStyle = 'red';
          c.fillRect(
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            this.width,
            this.height
          );
        }
      } else {
        if (this.image && this.image.complete && this.image.naturalWidth !== 0) {
          c.drawImage(
            this.image,
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            this.width,
            this.height
          );
        } else {
          c.fillStyle = 'red';
          c.fillRect(
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            this.width,
            this.height
          );
        }
      }
    }
  }

  update() {
    if (this.frames.max > 1) {
      this.frames.elapsed++;
      if (this.frames.elapsed % this.frames.hold === 0) {
        this.frames.current++;
        if (this.frames.current >= this.frames.max) {
          this.frames.current = 0;
        }
      }
    }
  }
}