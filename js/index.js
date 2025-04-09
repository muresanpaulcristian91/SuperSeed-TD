const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const classes = [
    {
        name: 'Risker',
        description: 'Towers deal 25% more damage but have 25% slower fire rate.',
        damageModifier: 1.25,
        fireRateModifier: 0.75
    },
    {
        name: 'Seeder',
        description: 'Gain 30% more gold per enemy killed, but cannot build SuperSeedTower.',
        goldModifier: 1.3,
        restrictSuperSeedTower: true
    },
    {
        name: 'Flashy',
        description: 'Time passes 25% faster, but towers deal 15% less damage.',
        timeModifier: 1.25,
        damageModifier: 0.85
    },
    {
        name: 'SuperSeeder',
        description: 'Towers deal 25% more damage and have 25% faster fire rate, but start with 30% fewer lives.',
        damageModifier: 1.25,
        fireRateModifier: 1.25,
        livesModifier: 0.7
    }
];

let isSpawningWave = false;
let selectedClass = null;
canvas.width = 2304; // 36 tiles * 64 pixels
canvas.height = 960; // 15 tiles * 64 pixels
let isNeverEndingWave = false; // Flag to track the never-ending wave
let neverEndingSpawnTimer = 0; // Timer to control continuous spawning
const neverEndingSpawnInterval = 500; // Spawn enemies every 500ms (0.5 seconds)
let animationFrameId = null;
let waveNotification = null;
let waveNotificationTimer = 0;
const waveNotificationDuration = 4000;

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

// Use the waypoints from waypoints.js (assumed to be globally available)
if (!waypoints || waypoints.length === 0) {
    console.error('Waypoints are not defined or empty. Please ensure waypoints.js is loaded.');
}

// Use the placementTilesData from placementTilesData.js (assumed to be globally available)
if (!placementTilesData || placementTilesData.length === 0) {
    console.error('placementTilesData is not defined or empty. Please ensure placementTilesData.js is loaded.');
}

const placementTilesData2D = [];
for (let i = 0; i < placementTilesData.length; i += 36) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 36));
}

const placementTiles = [];
placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 14) {
            placementTiles.push(
                new PlacementTile({
                    position: {
                        x: x * 64,
                        y: y * 64
                    }
                })
            );
        }
    });
});

// Define enemy types with images
const enemyK1Images = [];
const enemyK2Images = [];
const enemyK3Images = [];
const enemyK4Images = [];
const enemyK5Images = [];
const enemyK6Images = [];
const enemyK7Images = [];
const enemyK8Images = [];
const enemyK9Images = [];
const enemyK10Images = [];
const enemyK11Images = [];
const enemyK12Images = [];
const Boss1Images = [];
const Boss2Images = [];
const Boss3Images = [];
const Boss4Images = [];

for (let i = 0; i < 7; i++) {
    const enemyK1Img = new Image();
    enemyK1Img.src = `img/K1_WALK_00${i}.png`;
    enemyK1Images.push(enemyK1Img);

    const enemyK2Img = new Image();
    enemyK2Img.src = `img/K2_WALK_00${i}.png`;
    enemyK2Images.push(enemyK2Img);

    const enemyK3Img = new Image();
    enemyK3Img.src = `img/K3_WALK_00${i}.png`;
    enemyK3Images.push(enemyK3Img);

    const enemyK4Img = new Image();
    enemyK4Img.src = `img/K4_WALK_00${i}.png`;
    enemyK4Images.push(enemyK4Img);

    const enemyK5Img = new Image();
    enemyK5Img.src = `img/K5_WALK_00${i}.png`;
    enemyK5Images.push(enemyK5Img);

    const enemyK6Img = new Image();
    enemyK6Img.src = `img/K6_WALK_00${i}.png`;
    enemyK6Images.push(enemyK6Img);

    const enemyK7Img = new Image();
    enemyK7Img.src = `img/K7_WALK_00${i}.png`;
    enemyK7Images.push(enemyK7Img);

    const enemyK8Img = new Image();
    enemyK8Img.src = `img/K8_WALK_00${i}.png`;
    enemyK8Images.push(enemyK8Img);

    const enemyK9Img = new Image();
    enemyK9Img.src = `img/K9_WALK_00${i}.png`;
    enemyK9Images.push(enemyK9Img);

    const enemyK10Img = new Image();
    enemyK10Img.src = `img/K10_WALK_00${i}.png`;
    enemyK10Images.push(enemyK10Img);

    const enemyK11Img = new Image();
    enemyK11Img.src = `img/K11_WALK_00${i}.png`;
    enemyK11Images.push(enemyK11Img);

    const enemyK12Img = new Image();
    enemyK12Img.src = `img/K12_WALK_00${i}.png`;
    enemyK12Images.push(enemyK12Img);
}

const enemyTypes = [
    { name: 'EnemyK1', health: 150, speed: 1, images: enemyK1Images, reward: 20, scale: 1, class: EnemyK1, baseDamage: 1 },
    { name: 'EnemyK2', health: 250, speed: 1, images: enemyK2Images, reward: 20, scale: 1, class: EnemyK2, baseDamage: 1 },
    { name: 'EnemyK3', health: 300, speed: 1, images: enemyK3Images, reward: 20, scale: 1, class: EnemyK3, baseDamage: 1 },
    { name: 'EnemyK4', health: 600, speed: 1, images: enemyK4Images, reward: 20, scale: 1, class: EnemyK4, baseDamage: 1 },
    { name: 'EnemyK5', health: 800, speed: 1, images: enemyK5Images, reward: 20, scale: 1, class: EnemyK5, baseDamage: 1 },
    { name: 'EnemyK6', health: 1200, speed: 1.5, images: enemyK6Images, reward: 20, scale: 1, class: EnemyK6, baseDamage: 1 },
    { name: 'EnemyK7', health: 1400, speed: 1, images: enemyK7Images, reward: 20, scale: 1, class: EnemyK7, baseDamage: 1 },
    { name: 'EnemyK8', health: 1800, speed: 2, images: enemyK8Images, reward: 20, scale: 1, class: EnemyK8, baseDamage: 1 },
    { name: 'EnemyK9', health: 1500, speed: 3, images: enemyK9Images, reward: 20, scale: 1, class: EnemyK9, baseDamage: 1 },
    { name: 'EnemyK10', health: 2000, speed: 1, images: enemyK10Images, reward: 40, scale: 1, class: EnemyK10, baseDamage: 1 },
    { name: 'EnemyK11', health: 2500, speed: 1, images: enemyK11Images, reward: 40, scale: 1, class: EnemyK11, baseDamage: 1 },
    { name: 'EnemyK12', health: 1000, speed: 1, images: enemyK12Images, reward: 40, scale: 1, class: EnemyK12, baseDamage: 1 },
    { name: 'Boss1', health: 2500, speed: 1.2, images: Boss1Images, reward: 100, scale: 1.4, isBoss: true, class: Boss1, baseDamage: 5 },
    { name: 'Boss2', health: 20000, speed: 1.2, images: Boss2Images, reward: 200, scale: 1.4, isBoss: true, class: Boss2, baseDamage: 5 },
    { name: 'Boss3', health: 35000, speed: 1.3, images: Boss3Images, reward: 300, scale: 1.4, isBoss: true, class: Boss3, baseDamage: 5 },
    { name: 'Boss4', health: 100000, speed: 1.5, images: Boss4Images, reward: 400, scale: 1.4, isBoss: true, class: Boss4, baseDamage: 5 }
];

const enemiesPerWave = [
    6,  // Wave 1
    10,  // Wave 2
    14,  // Wave 3
    20,  // Wave 4
    16,  // Wave 5
    12,  // Wave 6
    14,  // Wave 7
    20,  // Wave 8
    30,  // Wave 9
    35, // Wave 10
    40, // Wave 11
    60  // Wave 12
];

// Define and load the background image
const backgroundImage = new Image();
backgroundImage.src = 'img/gameMap.png';
backgroundImage.onload = () => {
    console.log('Background image loaded successfully');
};
backgroundImage.onerror = () => {
    console.error('Failed to load background image');
};

// Preload the projectile sprite sheets for all towers
const projectileSpiritSeedImage = new Image();
projectileSpiritSeedImage.src = 'img/SpiritProjectile.png';

const projectilePoisonSeedImage = new Image();
projectilePoisonSeedImage.src = 'img/PoisonProjectile.png';

const projectileStoneSeedImage = new Image();
projectileStoneSeedImage.src = 'img/StoneProjectile.png';

const projectileSuperSeedImage = new Image();
projectileSuperSeedImage.src = 'img/SuperSeedProjectile.png';

// Preload the button images for Upgrade and Sell
const upgradeButtonImage = new Image();
upgradeButtonImage.src = 'img/UpdateButton.png';

const sellButtonImage = new Image();
sellButtonImage.src = 'img/SellButton.png';

// Preload the login page image
const loginPageImage = new Image();
loginPageImage.src = 'img/LoginPageImage.png';
loginPageImage.onload = () => {
    console.log('LoginPageImage.png loaded successfully');
};
loginPageImage.onerror = () => {
    console.error('Failed to load LoginPageImage.png');
    displayError('Failed to load LoginPageImage.png');
};

// Preload the audio files
const gameStartMusic = new Audio('img/GameStartMusic.mp3');
gameStartMusic.loop = true;
const playMusic = new Audio('img/PlayMusic.mp3');
playMusic.loop = true;
const towerDoneSound = new Audio('img/TowerDone.mp3');
const gameOverSound = new Audio('img/GameOverSound.mp3');

// Define tower types with images for each level and updated stats
const towerTypes = [
    {
        name: 'BasicTower',
        cost: 50,
        damage: 30,
        range: (4.14375 * 40) * 1.25,
        fireRate: 1000,
        imagePaths: [
            'img/towerSpiritSeedLvl1.png',
            'img/towerSpiritSeedLvl2.png',
            'img/towerSpiritSeedLvl3.png'
        ],
        upgradeStats: [
            { damage: 50, fireRate: 1000 / 1.5, range: (5.2 * 40) * 1.25, cost: 100 },
            { damage: 70, fireRate: 1000 / 2, range: (6.5 * 40) * 1.25, cost: 200 }
        ]
    },
    {
        name: 'AoETower',
        cost: 75,
        damage: 15,
        range: (4.42 * 32) * 1.25,
        fireRate: 2000,
        splash: true,
        splashRadius: 200,
        imagePaths: [
            'img/towerStoneSeedLvl1.png',
            'img/towerStoneSeedLvl2.png',
            'img/towerStoneSeedLvl3.png'
        ],
        upgradeStats: [
            { damage: 30, fireRate: 1500, range: (6.5 * 32) * 1.25, splashRadius: 300, cost: 150 },
            { damage: 50, fireRate: 1000, range: (7.8 * 32) * 1.25, splashRadius: 500, cost: 300 }
        ]
    },
    {
        name: 'SlowTower',
        cost: 100,
        damage: 10,
        slowFactor: 0.7,
        slowDuration: 3000,
        range: (4.9725 * 32) * 1.25,
        fireRate: 2000,
        imagePaths: [
            'img/towerPoisonSeedLvl1.png',
            'img/towerPoisonSeedLvl2.png',
            'img/towerPoisonSeedLvl3.png'
        ],
        upgradeStats: [
            { damage: 20, slowFactor: 0.65, slowDuration: 4000, range: (7.8 * 32) * 1.25, cost: 200 },
            { damage: 30, slowFactor: 0.6, slowDuration: 5000, range: (10.4 * 32) * 1.25, cost: 400 }
        ]
    },
    {
        name: 'SuperSeedTower',
        cost: 150,
        damage: 75,
        range: (6.63 * 32) * 1.25,
        fireRate: 1500,
        imagePaths: [
            'img/towerSuperSeedLvl1.png',
            'img/towerSuperSeedLvl2.png',
            'img/towerSuperSeedLvl3.png'
        ],
        upgradeStats: [
            { damage: 100, fireRate: 1000, range: (9.1 * 32) * 1.25, cost: 250 },
            { damage: 125, fireRate: 2000, range: (13.4 * 32) * 1.25, cost: 450 }
        ]
    }
].map((tower) => {
    const images = tower.imagePaths.map((path) => {
        const img = new Image();
        img.src = path;
        img.onerror = () => {
            console.error(`Failed to load image: ${path}`);
        };
        return img;
    });
    return { ...tower, images };
});

const enemies = [];
let buildings = [];
let activeTile = undefined;
let menuOpen = false;
let selectedTile = undefined;
let enemyCount = 3;
let hearts = 50;
let coins = 150;
let gameStarted = false;
let startTime = null;
let survivalTime = 0;
let username = '';
let hoveredTowerIndex = null;
let selectedBuilding = null;
let isUpgradeButtonHovered = false;
let isSellButtonHovered = false;
let hasInteracted = false;
let waveNumber = 0;
let lastWaveTime = 0;
const waveInterval = 30000; // 30 seconds between waves
let maxTowerSlots = 16;
let airstrikeCooldown = 0;
const airstrikeCooldownTime = 60000;
let repairCooldown = 0;
const repairCooldownTime = 90000;
let lastFrameTime = performance.now();
let isEndlessMode = false;
let endlessSpawnTimer = 0;
const endlessSpawnInterval = 30; // Spawn every 0.5 seconds (30 frames at 60 FPS)
let endlessWaveCounter = 0;
let isBossWaveNext = false;

// Modify waveNumber to count regular waves only (boss waves will be separate)
let totalWaveCount = 0;
// Function to display error messages on the screen
function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.innerHTML += message + '<br>';
    } else {
        console.error('Error div not found:', message);
    }
}

// Function to format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function loadImages() {
    const imagesToLoad = [
        { src: 'img/gameMap.png', image: backgroundImage },
        { src: 'img/SpiritProjectile.png', image: projectileSpiritSeedImage },
        { src: 'img/PoisonProjectile.png', image: projectilePoisonSeedImage },
        { src: 'img/StoneProjectile.png', image: projectileStoneSeedImage },
        { src: 'img/SuperSeedProjectile.png', image: projectileSuperSeedImage },
        { src: 'img/UpdateButton.png', image: upgradeButtonImage },
        { src: 'img/SellButton.png', image: sellButtonImage },
        { src: 'img/LoginPageImage.png', image: loginPageImage },
        ...towerTypes.flatMap((tower) =>
            tower.images.map((img, index) => ({
                src: tower.imagePaths[index],
                image: img
            }))
        ),
        ...enemyK1Images.map((img, i) => ({ src: `img/K1_WALK_00${i}.png`, image: img })),
        ...enemyK2Images.map((img, i) => ({ src: `img/K2_WALK_00${i}.png`, image: img })),
        ...enemyK3Images.map((img, i) => ({ src: `img/K3_WALK_00${i}.png`, image: img })),
        ...enemyK4Images.map((img, i) => ({ src: `img/K4_WALK_00${i}.png`, image: img })),
        ...enemyK5Images.map((img, i) => ({ src: `img/K5_WALK_00${i}.png`, image: img })),
        ...enemyK6Images.map((img, i) => ({ src: `img/K6_WALK_00${i}.png`, image: img })),
        ...enemyK7Images.map((img, i) => ({ src: `img/K7_WALK_00${i}.png`, image: img })),
        ...enemyK8Images.map((img, i) => ({ src: `img/K8_WALK_00${i}.png`, image: img })),
        ...enemyK9Images.map((img, i) => ({ src: `img/K9_WALK_00${i}.png`, image: img })),
        ...enemyK10Images.map((img, i) => ({ src: `img/K10_WALK_00${i}.png`, image: img })),
        ...enemyK11Images.map((img, i) => ({ src: `img/K11_WALK_00${i}.png`, image: img })),
        ...enemyK12Images.map((img, i) => ({ src: `img/K12_WALK_00${i}.png`, image: img }))
    ];

    let loadedImages = 0;
    const totalImages = imagesToLoad.length;

    return new Promise((resolve) => {
        if (totalImages === 0) {
            console.warn('No images to load');
            resolve();
            return;
        }

        imagesToLoad.forEach(({ src, image }) => {
            image.onload = () => {
                loadedImages++;
                console.log(`Loaded image: ${src}, naturalWidth: ${image.naturalWidth}, naturalHeight: ${image.naturalHeight}`);
                if (loadedImages === totalImages) {
                    console.log('All images loaded successfully');
                    resolve();
                }
            };
            image.onerror = () => {
                loadedImages++;
                console.error(`Failed to load image: ${src}`);
                displayError(`Failed to load image: ${src}`);
                if (loadedImages === totalImages) {
                    console.log('All images processed (with errors)');
                    resolve();
                }
            };
        });
    });
}

function calculateEnemyCount(wave) {
    // This function is only called for regular waves, not boss waves
    // Adjust wave index for array (wave 1 is index 0)
    const waveIndex = wave - 1;
    // If wave exceeds the array length, scale the last value slightly
    if (waveIndex >= enemiesPerWave.length) {
        return Math.min(enemiesPerWave[enemiesPerWave.length - 1] + Math.floor((wave - enemiesPerWave.length) * 1.5), 20);
    }
    return enemiesPerWave[waveIndex];
}

function showWaveNotification(waveNum, isBossWave) {
    if (isBossWave) {
        const bossIndex = Math.floor((waveNum / 3 - 1) % 4); // Determine which boss to show
        waveNotification = `Boss Approaches!`;
    } else {
        waveNotification = `Wave ${waveNum} Incoming!`;
    }
    waveNotificationTimer = 0;
    console.log(`Showing wave notification: ${waveNotification}`);
}

function spawnEnemies(count) {
    if (!enemyTypes || enemyTypes.length === 0) {
        console.error('Cannot spawn enemies: enemyTypes is not defined or empty');
        return;
    }

    if (!waypoints || waypoints.length === 0) {
        console.error('Cannot spawn enemies: waypoints is not defined or empty');
        return;
    }

    isSpawningWave = true; // Set flag to indicate spawning is in progress
    showWaveNotification(waveNumber, false); // Regular wave notification

    const spawnInterval = 2000; // 2 seconds between spawns
    const waypoint = waypoints[0];

    const enemyTypeIndex = (waveNumber - 1) % 12;
    const enemyType = { ...enemyTypes[enemyTypeIndex] };

    // Apply speed modifiers for difficulty (no health scaling)
    if (waveNumber >= 8 && waveNumber < 11) {
        enemyType.speed *= 1.1; // 10% faster speed
    } else if (waveNumber >= 11) {
        enemyType.speed *= 1.2; // 20% faster speed
    }

    console.log(`Wave ${waveNumber}: Spawning ${count} enemies of type ${enemyType.name} with health ${enemyType.health}, speed ${enemyType.speed}, baseDamage ${enemyType.baseDamage}`);

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            let enemy;
            switch (enemyTypeIndex) {
                case 0:
                    enemy = new EnemyK1({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 1:
                    enemy = new EnemyK2({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 2:
                    enemy = new EnemyK3({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 3:
                    enemy = new EnemyK4({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 4:
                    enemy = new EnemyK5({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 5:
                    enemy = new EnemyK6({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 6:
                    enemy = new EnemyK7({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 7:
                    enemy = new EnemyK8({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 8:
                    enemy = new EnemyK9({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 9:
                    enemy = new EnemyK10({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 10:
                    enemy = new EnemyK11({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                case 11:
                    enemy = new EnemyK12({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
                    break;
                default:
                    enemy = new EnemyK1({
                        position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                        waveNumber,
                        enemyType
                    });
            }
            enemies.push(enemy);
            enemies.sort((a, b) => a.position.y - b.position.y);
            console.log(`Spawned enemy ${enemyType.name} at time ${Date.now() - startTime}ms`);

            // If this is the last enemy in the wave, clear the spawning flag
            if (i === count - 1) {
                isSpawningWave = false;
                console.log(`Finished spawning wave ${waveNumber}`);
            }
        }, i * spawnInterval);
    }
}

function spawnBoss() {
    if (!enemyTypes || enemyTypes.length === 0) {
        console.error('Cannot spawn boss: enemyTypes is not defined or empty');
        return;
    }

    if (!waypoints || waypoints.length === 0) {
        console.error('Cannot spawn boss: waypoints is not defined or empty');
        return;
    }

    isSpawningWave = true; // Set flag to indicate spawning is in progress
    showWaveNotification(waveNumber, true); // Boss wave notification

    const waypoint = waypoints[0];
    const bossIndex = Math.floor((waveNumber / 3 - 1) % 4); // Determine which boss to spawn
    const bossTypeIndex = 12 + bossIndex;
    const bossType = { ...enemyTypes[bossTypeIndex] };

    // Remove the health recalculation and use the defined health from enemyTypes
    console.log(`Boss Wave after Wave ${waveNumber}: Spawning 1 boss of type ${bossType.name} with health ${bossType.health}, speed ${bossType.speed}, baseDamage ${bossType.baseDamage}`);

    let boss;
    switch (bossTypeIndex) {
        case 12:
            boss = new Boss1({
                position: { x: waypoint.x - 63 * (bossType.scale || 1), y: waypoint.y - 63 * (bossType.scale || 1) },
                waveNumber,
                enemyType: bossType
            });
            break;
        case 13:
            boss = new Boss2({
                position: { x: waypoint.x - 63 * (bossType.scale || 1), y: waypoint.y - 63 * (bossType.scale || 1) },
                waveNumber,
                enemyType: bossType
            });
            break;
        case 14:
            boss = new Boss3({
                position: { x: waypoint.x - 63 * (bossType.scale || 1), y: waypoint.y - 63 * (bossType.scale || 1) },
                waveNumber,
                enemyType: bossType
            });
            break;
        case 15:
            boss = new Boss4({
                position: { x: waypoint.x - 63 * (bossType.scale || 1), y: waypoint.y - 63 * (bossType.scale || 1) },
                waveNumber,
                enemyType: bossType
            });
            break;
        default:
            boss = new Boss1({
                position: { x: waypoint.x - 63 * (bossType.scale || 1), y: waypoint.y - 63 * (bossType.scale || 1) },
                waveNumber,
                enemyType: bossType
            });
    }
    enemies.push(boss);
    enemies.sort((a, b) => a.position.y - b.position.y);
    console.log(`Spawned boss ${bossType.name} at time ${Date.now() - startTime}ms`);
    isSpawningWave = false; // Boss wave spawns immediately, so we're done
}

function spawnEndlessEnemies() {
    if (!enemyTypes || enemyTypes.length === 0) {
        console.error('Cannot spawn enemies: enemyTypes is not defined or empty');
        return null;
    }

    if (!waypoints || waypoints.length === 0) {
        console.error('Cannot spawn enemies: waypoints is not defined or empty');
        return null;
    }

    const waypoint = waypoints[0];

    // Randomly select an enemy type from EnemyK1 to EnemyK12 (indices 0 to 11)
    const enemyTypeIndex = Math.floor(Math.random() * 12);
    const enemyType = { ...enemyTypes[enemyTypeIndex] };

    // Double health and speed for the never-ending wave
    if (isNeverEndingWave) {
        enemyType.health *= 2;
        enemyType.speed *= 1.2;
        console.log(`Never-ending wave: Spawning enemy of type ${enemyType.name} with health ${enemyType.health}, speed ${enemyType.speed}, baseDamage ${enemyType.baseDamage}`);
    } else {
        // Apply existing endless mode scaling (if needed, though this will be replaced)
        const difficultyMultiplier = 1 + endlessWaveCounter * 0.1;
        enemyType.reward = Math.floor(enemyType.reward * difficultyMultiplier);
        console.log(`Endless mode: Spawning enemy of type ${enemyType.name} with health ${enemyType.health}, reward ${enemyType.reward}, baseDamage ${enemyType.baseDamage}`);
    }

    let enemy;
    switch (enemyTypeIndex) {
        case 0:
            enemy = new EnemyK1({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 1:
            enemy = new EnemyK2({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 2:
            enemy = new EnemyK3({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 3:
            enemy = new EnemyK4({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 4:
            enemy = new EnemyK5({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 5:
            enemy = new EnemyK6({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 6:
            enemy = new EnemyK7({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 7:
            enemy = new EnemyK8({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 8:
            enemy = new EnemyK9({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 9:
            enemy = new EnemyK10({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 10:
            enemy = new EnemyK11({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        case 11:
            enemy = new EnemyK12({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
            break;
        default:
            enemy = new EnemyK1({
                position: { x: waypoint.x - 63, y: waypoint.y - 63 },
                waveNumber: waveNumber,
                enemyType
            });
    }

    return enemy;
}

function drawMenu() {
    if (!menuOpen || !selectedTile || selectedTile.isOccupied) return;

    const towerWidth = 64;
    const towerHeight = 64;
    const menuWidth = towerWidth * 4 + 7;
    const menuHeight = towerHeight + 7 + 20;
    const menuX = selectedTile.position.x + 64 - menuWidth / 2;
    const menuYBase = selectedTile.position.y - towerHeight / 2;
    const menuYShift = menuHeight * 0.2;
    const menuY = menuYBase + menuYShift;

    c.fillStyle = 'rgba(0, 0, 0, 0.8)';
    c.fillRect(menuX, menuY, menuWidth, menuHeight);

    hoveredTowerIndex = null;

    const availableTowers = selectedClass && selectedClass.name === 'Seeder'
        ? towerTypes.filter(tower => tower.name !== 'SuperSeedTower')
        : towerTypes;

    availableTowers.forEach((tower, index) => {
        const x = menuX + index * towerWidth + 3;
        const y = menuY + 3;

        const towerImage = tower.images[0];
        if (towerImage.complete && towerImage.naturalWidth !== 0) {
            c.drawImage(towerImage, x, y + 4, towerWidth, towerHeight);
        } else {
            c.fillStyle = 'red';
            c.fillRect(x, y, towerWidth, towerHeight);
            console.warn(`Tower image for ${tower.name} (Level 1) not loaded yet`);
        }

        c.fillStyle = coins >= tower.cost ? 'white' : 'red';
        c.font = '20px Changa One';
        c.textAlign = 'center';
        c.fillText(`${tower.cost}`, x + towerWidth / 2, y + towerHeight + 20);
        c.textAlign = 'start';

        if (
            mouse.x >= x &&
            mouse.x <= x + towerWidth &&
            mouse.y >= y &&
            mouse.y <= y + towerHeight
        ) {
            hoveredTowerIndex = index;

            const towerCenterX = selectedTile.position.x + 64;
            const towerCenterY = selectedTile.position.y + 64;
            c.beginPath();
            c.arc(towerCenterX, towerCenterY, tower.range, 0, Math.PI * 2, false);
            c.fillStyle = 'rgba(0, 255, 0, 0.2)';
            c.fill();
            c.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            c.lineWidth = 2;
            c.stroke();
            c.closePath();

            const isSlowTower = tower.name === 'SlowTower';
            const tooltipWidth = 250;
            const tooltipHeight = tower.name === 'SuperSeedTower' ? 105 : (isSlowTower ? 105 : 90);
            const tooltipX = x + towerWidth / 2 - tooltipWidth / 2;
            const tooltipY = y - tooltipHeight - 3;

            c.fillStyle = 'rgba(0, 0, 0, 0.9)';
            c.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

            c.strokeStyle = 'white';
            c.lineWidth = 1;
            c.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

            c.fillStyle = 'white';
            c.font = '18px Changa One';
            c.textAlign = 'left';

            c.fillText(`${tower.name}`, tooltipX + 8, tooltipY + 15);
            c.fillText(`Damage: ${tower.damage}`, tooltipX + 8, tooltipY + 30);

            let typeText = 'Type: ';
            if (tower.name === 'BasicTower') {
                typeText += 'Single Target';
            } else if (tower.name === 'AoETower') {
                typeText += 'Splash';
            } else if (tower.name === 'SlowTower') {
                typeText += 'Slow';
            } else if (tower.name === 'SuperSeedTower') {
                typeText += 'Gold Repay';
            }
            c.fillText(typeText, tooltipX + 8, tooltipY + 45);

            // Update fire rate to show shots per second, matching the format of the built tower tooltip
            c.fillText(`Fire Rate: ${(1000 / tower.fireRate).toFixed(2)} shots/s`, tooltipX + 8, tooltipY + 60);
            c.fillText(`Range: ${tower.range}`, tooltipX + 8, tooltipY + 75);

            if (tower.name === 'SuperSeedTower') {
                c.fillText(`Coin Multiplier: Ascending`, tooltipX + 8, tooltipY + 90);
            }

            if (isSlowTower) {
                c.fillText(`Projectiles: 2 (ascending)`, tooltipX + 8, tooltipY + 90);
            }

            c.textAlign = 'start';
        }
    });
}

function drawSelectedBuilding() {
    if (!selectedBuilding) {
        console.log('No selected building, skipping range circle draw');
        return;
    }

    console.log(`Drawing range circle for ${selectedBuilding.towerType.name} at (${selectedBuilding.center.x}, ${selectedBuilding.center.y}) with range ${selectedBuilding.radius}`);

    const towerCenterX = selectedBuilding.center.x;
    const towerCenterYForCircle = selectedBuilding.center.y;
    c.beginPath();
    c.arc(towerCenterX, towerCenterYForCircle, selectedBuilding.radius, 0, Math.PI * 2, false);
    c.fillStyle = 'rgba(0, 255, 0, 0.2)';
    c.fill();
    c.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    c.lineWidth = 2;
    c.stroke();
    c.closePath();

    const starSize = 5;
    const starSpacing = 2;
    const starY = selectedBuilding.adjustedPosition.y - 5;
    const starXStart = selectedBuilding.position.x + (128 - (selectedBuilding.level * starSize + (selectedBuilding.level - 1) * starSpacing)) / 2;

    for (let i = 0; i < selectedBuilding.level; i++) {
        const starX = starXStart + i * (starSize + starSpacing);
        c.beginPath();
        c.moveTo(starX + starSize / 2, starY);
        for (let j = 1; j < 5; j++) {
            c.lineTo(
                starX + starSize / 2 + (starSize / 2) * Math.cos((Math.PI * 2 * j) / 5 + Math.PI / 2),
                starY + starSize / 2 + (starSize / 2) * Math.sin((Math.PI * 2 * j) / 5 + Math.PI / 2)
            );
        }
        c.closePath();
        c.fillStyle = 'yellow';
        c.fill();
        c.strokeStyle = 'black';
        c.lineWidth = 0.3;
        c.stroke();
    }

    const buttonWidth = 120;
    const buttonHeight = 36;
    const buttonX = selectedBuilding.position.x + 128 + 5;

    const towerCenterY = selectedBuilding.adjustedPosition.y + selectedBuilding.height / 2;
    const totalButtonHeight = buttonHeight * 2 + 5;
    const upgradeButtonY = towerCenterY - totalButtonHeight / 2;
    const sellButtonY = upgradeButtonY + buttonHeight + 5;

    const textYOffset = buttonHeight * 0.05;

    isUpgradeButtonHovered = false;
    isSellButtonHovered = false;
    let isUpgradeButtonHoveredForTooltip = false; // New variable for tooltip display

    const upgradeCost = selectedBuilding.getUpgradeCost();
    const canAffordUpgrade = coins >= upgradeCost;
    const canUpgrade = selectedBuilding.level < 3;

    // Check if the mouse is over the Upgrade button (for tooltip display, regardless of conditions)
    if (
        mouse.x >= buttonX &&
        mouse.x <= buttonX + buttonWidth &&
        mouse.y >= upgradeButtonY &&
        mouse.y <= upgradeButtonY + buttonHeight
    ) {
        isUpgradeButtonHoveredForTooltip = true;
        // Only set isUpgradeButtonHovered if the upgrade is possible
        if (canUpgrade && canAffordUpgrade) {
            isUpgradeButtonHovered = true;
        }
    }

    if (
        mouse.x >= buttonX &&
        mouse.x <= buttonX + buttonWidth &&
        mouse.y >= sellButtonY &&
        mouse.y <= sellButtonY + buttonHeight
    ) {
        isSellButtonHovered = true;
    }

    if (canUpgrade) {
        if (upgradeButtonImage.complete && upgradeButtonImage.naturalWidth !== 0) {
            c.drawImage(
                upgradeButtonImage,
                buttonX,
                upgradeButtonY,
                buttonWidth,
                buttonHeight
            );
        } else {
            c.fillStyle = canAffordUpgrade ? 'rgba(0, 128, 0, 0.8)' : 'rgba(128, 0, 0, 0.8)';
            c.fillRect(buttonX, upgradeButtonY, buttonWidth, buttonHeight);
        }

        if (!canAffordUpgrade) {
            c.fillStyle = 'rgba(128, 128, 128, 0.5)';
            c.fillRect(buttonX, upgradeButtonY, buttonWidth, buttonHeight);
        } else if (isUpgradeButtonHovered) {
            c.fillStyle = 'rgba(255, 255, 0, 0.3)';
            c.fillRect(buttonX, upgradeButtonY, buttonWidth, buttonHeight);
        }

        // Show tooltip with new properties when hovering over the Upgrade button (even if deactivated)
        if (isUpgradeButtonHoveredForTooltip) {
            const nextLevel = selectedBuilding.level + 1;
            const stats = selectedBuilding.towerType.upgradeStats[selectedBuilding.level - 1]; // Stats for the next level

            // Calculate new properties
            const newDamage = stats.damage;
            const newFireRate = stats.fireRate || selectedBuilding.fireRate;
            const newRange = stats.range || selectedBuilding.radius;
            const newSlowFactor = stats.slowFactor || selectedBuilding.slowFactor;
            const newSlowDuration = stats.slowDuration || selectedBuilding.slowDuration;
            const newSplashRadius = stats.splashRadius || selectedBuilding.splashRadius;
            const newNumProjectiles = selectedBuilding.towerType.name === 'SlowTower' ? (nextLevel === 2 ? 4 : nextLevel === 3 ? 6 : 2) : null;

            // Determine tooltip height based on tower type
            const isSlowTower = selectedBuilding.towerType.name === 'SlowTower';
            const tooltipWidth = 180;
            const tooltipHeight = (isSlowTower ? 105 : 75) + (selectedBuilding.splash ? 15 : 0); // Adjust height for slow/projectiles or splash
            const tooltipX = buttonX + buttonWidth + 5; // Position to the right of the button
            const tooltipY = upgradeButtonY - tooltipHeight / 2;

            // Draw tooltip background
            c.fillStyle = 'rgba(0, 0, 0, 0.9)';
            c.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

            // Draw tooltip border
            c.strokeStyle = 'white';
            c.lineWidth = 1;
            c.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

            // Draw tooltip text
            c.fillStyle = 'white';
            c.font = '16px Changa One';
            c.textAlign = 'left';
            let yOffset = 15;

            c.fillText(`Level ${nextLevel} Stats:`, tooltipX + 8, tooltipY + yOffset);
            yOffset += 15;
            c.fillText(`Damage: ${newDamage}`, tooltipX + 8, tooltipY + yOffset);
            yOffset += 15;
            c.fillText(`Fire Rate: ${(1000 / newFireRate).toFixed(2)} shots/s`, tooltipX + 8, tooltipY + yOffset);
            yOffset += 15;
            c.fillText(`Range: ${newRange.toFixed(0)}`, tooltipX + 8, tooltipY + yOffset);
            yOffset += 15;

            if (isSlowTower) {
                const slowPercentage = ((1 - newSlowFactor) * 100).toFixed(0);
                c.fillText(`Slow: ${slowPercentage}%`, tooltipX + 8, tooltipY + yOffset);
                yOffset += 15;
                c.fillText(`Projectiles: ${newNumProjectiles}`, tooltipX + 8, tooltipY + yOffset);
            }

            if (selectedBuilding.splash) {
                c.fillText(`Splash Radius: ${newSplashRadius}`, tooltipX + 8, tooltipY + yOffset);
            }

            c.textAlign = 'start';
        }

        c.fillStyle = 'black';
        c.font = '18px Changa One';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(
            `Upgrade (${upgradeCost})`,
            buttonX + buttonWidth / 2,
            upgradeButtonY + buttonHeight / 2 - textYOffset
        );
        c.textAlign = 'start';
        c.textBaseline = 'alphabetic';
    }

    const sellPrice = selectedBuilding.getSellPrice();

    if (sellButtonImage.complete && sellButtonImage.naturalWidth !== 0) {
        c.drawImage(
            sellButtonImage,
            buttonX,
            sellButtonY,
            buttonWidth,
            buttonHeight
        );
    } else {
        c.fillStyle = 'rgba(255, 0, 0, 0.8)';
        c.fillRect(buttonX, sellButtonY, buttonWidth, buttonHeight);
    }

    if (isSellButtonHovered) {
        c.fillStyle = 'rgba(255, 255, 0, 0.3)';
        c.fillRect(buttonX, sellButtonY, buttonWidth, buttonHeight);
    }

    c.fillStyle = 'black';
    c.font = '18px Changa One';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(
        `Sell (${sellPrice})`,
        buttonX + buttonWidth / 2,
        sellButtonY + buttonHeight / 2 - textYOffset
    );
    c.textAlign = 'start';
    c.textBaseline = 'alphabetic';
}

function calculateCoinReward(projectile, baseReward = 5) {
    let firingTower = null;
    for (const building of buildings) {
        if (building.projectiles.includes(projectile)) {
            firingTower = building;
            break;
        }
    }

    if (!firingTower) {
        return selectedClass && selectedClass.name === 'Seeder'
            ? Math.floor(baseReward * selectedClass.goldModifier)
            : baseReward;
    }

    if (firingTower.towerType.name === 'SuperSeedTower') {
        const multiplier = firingTower.level === 1 ? 2 : firingTower.level === 2 ? 3 : 4;
        const reward = baseReward * multiplier;
        return selectedClass && selectedClass.name === 'Seeder'
            ? Math.floor(reward * selectedClass.goldModifier)
            : reward;
    }

    return selectedClass && selectedClass.name === 'Seeder'
        ? Math.floor(baseReward * selectedClass.goldModifier)
        : baseReward;
}

function animate(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    c.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
        c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        c.fillStyle = 'gray';
        c.fillRect(0, 0, canvas.width, canvas.height);
        console.warn('Background image not loaded yet');
    }

    if (gameStarted) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.update();

            const lastWaypoint = waypoints[waypoints.length - 1];
            const dx = enemy.center.x - lastWaypoint.x;
            const dy = enemy.center.y - lastWaypoint.y;
            const distanceToLastWaypoint = Math.sqrt(dx * dx + dy * dy);

            if (distanceToLastWaypoint < 10) {
                const damage = enemy.enemyType?.baseDamage ?? 1;
                hearts -= damage;
                const heartsElement = document.querySelector('#hearts');
                if (heartsElement) {
                    heartsElement.innerHTML = hearts;
                } else {
                    console.warn('Hearts element not found in DOM');
                }
                enemies.splice(i, 1);

                if (hearts <= 0) {
                    gameOver();
                }
            }

            for (let i = buildings.length - 1; i >= 0; i--) {
                const building = buildings[i];
                building.update();

                for (let j = building.projectiles.length - 1; j >= 0; j--) {
                    const projectile = building.projectiles[j];
                    projectile.update();

                    if (!enemies.includes(projectile.enemy)) {
                        console.log(`Enemy for projectile ${j} no longer exists, removing projectile`);
                        building.projectiles.splice(j, 1);
                        continue;
                    }

                    if (projectile.hasHit) {
                        const enemiesToRemove = [];

                        if (projectile.power > 0) {
                            if (projectile.splash) {
                                console.log('Applying splash damage with radius 100');
                                enemies.forEach((enemy) => {
                                    const dx = enemy.center.x - projectile.position.x;
                                    const dy = enemy.center.y - projectile.position.y;
                                    const splashDistance = Math.sqrt(dx * dx + dy * dy);
                                    if (splashDistance < 100) {
                                        console.log(`Splash hit enemy at distance ${splashDistance}, dealing ${projectile.power} damage`);
                                        enemy.health -= projectile.power;
                                        console.log(`Enemy health after splash damage: ${enemy.health}`);
                                        if (enemy.health <= 0) {
                                            enemiesToRemove.push(enemy);
                                        }
                                    }
                                });

                                enemiesToRemove.forEach((enemy) => {
                                    const index = enemies.indexOf(enemy);
                                    if (index > -1) {
                                        const reward = calculateCoinReward(projectile, enemy.reward || 5);
                                        enemies.splice(index, 1);
                                        coins += reward;
                                        console.log(`Enemy killed by splash, adding ${reward} coins. Total coins: ${coins}`);
                                        const coinsElement = document.querySelector('#coins');
                                        if (coinsElement) coinsElement.innerHTML = Math.floor(coins);
                                    }
                                });
                            } else {
                                console.log(`Applying single-target damage: ${projectile.power} to enemy with health ${projectile.enemy.health}`);
                                projectile.enemy.health -= projectile.power;
                                console.log(`Enemy health after single-target damage: ${projectile.enemy.health}`);
                                if (projectile.enemy.health <= 0) {
                                    const index = enemies.indexOf(projectile.enemy);
                                    if (index > -1) {
                                        const reward = calculateCoinReward(projectile, projectile.enemy.reward || 5);
                                        enemies.splice(index, 1);
                                        coins += reward;
                                        console.log(`Enemy killed by ${building.towerType.name}, adding ${reward} coins. Total coins: ${coins}`);
                                        const coinsElement = document.querySelector('#coins');
                                        if (coinsElement) coinsElement.innerHTML = Math.floor(coins);
                                    }
                                }
                            }
                        }

                        if (projectile.slowFactor && projectile.slowDuration) {
                            console.log(`Applying slow effect: factor ${projectile.slowFactor}, duration ${projectile.slowDuration}`);
                            projectile.enemy.applySlow(projectile.slowFactor, projectile.slowDuration);
                        }

                        console.log(`Removing projectile ${j} after hit`);
                        building.projectiles.splice(j, 1);
                        continue;
                    }
                }
            }

            placementTiles.forEach((tile) => {
                tile.update(mouse);
            });

            if (activeTile && !activeTile.isOccupied && !menuOpen) {
                let canPlace = true;
                for (let dx = 0; dx < 2; dx++) {
                    for (let dy = 0; dy < 2; dy++) {
                        const tileX = activeTile.position.x + dx * 64;
                        const tileY = activeTile.position.y + dy * 64;
                        const tile = placementTiles.find(
                            t => t.position.x === tileX && t.position.y === tileY
                        );
                        if (!tile || tile.isOccupied) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }

                for (let dx = 0; dx < 2; dx++) {
                    for (let dy = 0; dy < 2; dy++) {
                        const tileX = activeTile.position.x + dx * 64;
                        const tileY = activeTile.position.y + dy * 64;
                        const tile = placementTiles.find(
                            t => t.position.x === tileX && t.position.y === tileY
                        );
                        if (tile && !tile.isOccupied) {
                            c.fillStyle = canPlace ? 'rgba(255, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
                            c.fillRect(tile.position.x, tile.position.y, tile.size, tile.size);
                        }
                    }
                }
            }

            drawMenu();
            drawSelectedBuilding();

            let hoveredBuilding = null;
            buildings.forEach((building) => {
                if (building.isHovered(mouse.x, mouse.y)) {
                    hoveredBuilding = building;
                }
            });

            if (hoveredBuilding) {
                activeTile = null;

                c.fillStyle = 'rgba(255, 255, 0, 0.2)';
                c.fillRect(
                    hoveredBuilding.adjustedPosition.x,
                    hoveredBuilding.adjustedPosition.y,
                    hoveredBuilding.width,
                    hoveredBuilding.height
                );

                const isNewSuperSeedTower = hoveredBuilding.towerType.name === 'SuperSeedTower';
                const isSlowTower = hoveredBuilding.towerType.name === 'SlowTower';
                const tooltipWidth = 180;
                const tooltipHeight = (hoveredBuilding.slowFactor ? 90 : 60) + (isNewSuperSeedTower ? 15 : 0) + (isSlowTower ? 15 : 0);
                const tooltipX = hoveredBuilding.adjustedPosition.x + hoveredBuilding.width / 2 - tooltipWidth / 2;
                let tooltipY = hoveredBuilding.adjustedPosition.y - tooltipHeight - 20;
                if (tooltipY < 0) {
                    tooltipY = hoveredBuilding.adjustedPosition.y + hoveredBuilding.height + 20;
                }

                c.fillStyle = 'rgba(0, 0, 0, 0.9)';
                c.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

                c.strokeStyle = 'white';
                c.lineWidth = 1;
                c.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

                c.fillStyle = 'white';
                c.font = '16px Changa One';
                c.textAlign = 'left';
                let yOffset = 20;

                c.fillText(`Damage: ${hoveredBuilding.damage}`, tooltipX + 8, tooltipY + yOffset);
                yOffset += 15;

                if (hoveredBuilding.slowFactor) {
                    const slowPercentage = ((1 - hoveredBuilding.slowFactor) * 100).toFixed(0);
                    c.fillText(`Slow: ${slowPercentage}%`, tooltipX + 8, tooltipY + yOffset);
                    yOffset += 15;
                }

                if (isSlowTower) {
                    const numProjectiles = hoveredBuilding.level === 1 ? 2 : hoveredBuilding.level === 2 ? 4 : 6;
                    c.fillText(`Projectiles: ${numProjectiles}`, tooltipX + 8, tooltipY + yOffset);
                    yOffset += 15;
                }

                c.fillText(`Type: ${hoveredBuilding.getDamageType()}`, tooltipX + 8, tooltipY + yOffset);
                yOffset += 15;
                c.fillText(`Fire Rate: ${(1000 / hoveredBuilding.fireRate).toFixed(2)} shots/s`, tooltipX + 8, tooltipY + yOffset);
                if (isNewSuperSeedTower) {
                    const multiplier = hoveredBuilding.level === 1 ? 2 : hoveredBuilding.level === 2 ? 3 : 4;
                    yOffset += 15;
                    c.fillText(`Coin Multiplier: ${multiplier}x`, tooltipX + 8, tooltipY + yOffset);
                }
                c.textAlign = 'start';
            }

            const currentTime = Date.now();
            var timeSinceLastWave = currentTime - lastWaveTime;
            survivalTime = Math.floor((currentTime - startTime) / 1000);
            const timerElement = document.querySelector('#timer');
            if (timerElement) timerElement.innerHTML = leaderboard.formatTime(survivalTime);

            if (timeSinceLastWave >= waveInterval) {
                totalWaveCount++; // Increment total wave count (includes regular and boss waves)

                if (waveNumber >= 12 && !isBossWaveNext && !isNeverEndingWave) {
                    // After wave 12 (EnemyK12), the next wave is a boss wave (Boss4)
                    if (isBossWaveNext) {
                        spawnBoss();
                        isBossWaveNext = false; // Reset for the next regular wave
                    } else {
                        waveNumber++; // Increment regular wave count to 13
                        const enemyCount = calculateEnemyCount(waveNumber);
                        spawnEnemies(enemyCount);
                        if (waveNumber % 3 === 0) {
                            isBossWaveNext = true;
                        }
                    }

                    // Check if we've just finished the boss wave after wave 12 (Boss4)
                    if (waveNumber > 12 && !isBossWaveNext) {
                        isNeverEndingWave = true; // Start the never-ending wave
                        waveNotification = "Never-Ending Wave! Survive as long as you can!";
                        waveNotificationTimer = 0;
                        console.log("Starting never-ending wave after Boss4");
                    }
                } else if (!isNeverEndingWave) {
                    if (isBossWaveNext) {
                        spawnBoss();
                        isBossWaveNext = false;
                    } else {
                        waveNumber++;
                        const enemyCount = calculateEnemyCount(waveNumber);
                        spawnEnemies(enemyCount);
                        if (waveNumber % 3 === 0) {
                            isBossWaveNext = true;
                        }
                    }
                }

                lastWaveTime = currentTime;
                console.log(`Wave interval: ${waveInterval / 1000} seconds, Time since last wave: ${timeSinceLastWave / 1000} seconds`);
            }

            // Handle continuous spawning for the never-ending wave
            if (isNeverEndingWave) {
                neverEndingSpawnTimer += deltaTime * 1000; // Increment timer based on frame time
                if (neverEndingSpawnTimer >= neverEndingSpawnInterval) {
                    const enemy = spawnEndlessEnemies();
                    if (enemy) {
                        enemies.push(enemy);
                        enemies.sort((a, b) => a.position.y - b.position.y);
                    }
                    neverEndingSpawnTimer = 0; // Reset timer
                }
            }
        }
    }
    else {
            enemies.forEach(enemy => {
                enemy.draw();
            });

            buildings.forEach(building => {
                building.draw();
                building.projectiles.forEach(projectile => {
                    projectile.draw();
                });
            });

            c.fillStyle = 'rgba(0, 0, 0, 0.5)';
            c.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (waveNotification) {
            waveNotificationTimer += deltaTime * 1000;

            const remainingTime = waveNotificationDuration - waveNotificationTimer;
            const fadeDuration = 500;
            const opacity = remainingTime < fadeDuration ? remainingTime / fadeDuration : 1;

            c.fillStyle = `rgba(0, 0, 0, ${0.8 * opacity})`;
            c.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 30, 300, 60);
            c.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            c.font = '30px Changa One';
            c.textAlign = 'center';
            c.fillText(waveNotification, canvas.width / 2, canvas.height / 2 + 10);
            c.textAlign = 'start';

            if (waveNotificationTimer >= waveNotificationDuration) {
                waveNotification = null;
                waveNotificationTimer = 0;
                console.log('Wave notification hidden');
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    const mouse = {
        x: undefined,
        y: undefined
    };

    function resetGame() {
        playMusic.pause();
        playMusic.currentTime = 0;
        gameStartMusic.pause();
        gameStartMusic.currentTime = 0;

        enemies.length = 0;
        buildings.forEach(building => {
            building.projectiles.length = 0;
        });
        buildings.length = 0;
        placementTiles.forEach((tile) => (tile.isOccupied = false));
        enemyCount = 3;
        hearts = 50;
        coins = 150;
        survivalTime = 0;
        username = '';
        gameStarted = false;
        startTime = null;
        menuOpen = false;
        selectedTile = undefined;
        activeTile = undefined;
        hoveredTowerIndex = null;
        selectedBuilding = null;
        isUpgradeButtonHovered = false;
        isSellButtonHovered = false;
        hasInteracted = false;
        waveNumber = 0;
        lastWaveTime = 0;
        maxTowerSlots = 10;
        selectedClass = null;
        waveNotification = null;
        waveNotificationTimer = 0;
        isEndlessMode = false;
        endlessSpawnTimer = 0;
        endlessWaveCounter = 0;
        totalWaveCount = 0;
        isBossWaveNext = false;
        isNeverEndingWave = false; // Reset never-ending wave flag
        neverEndingSpawnTimer = 0; // Reset never-ending wave spawn timer

        // Update UI
        const coinsElement = document.querySelector('#coins');
        if (coinsElement) coinsElement.innerHTML = coins;
        const heartsElement = document.querySelector('#hearts');
        if (heartsElement) heartsElement.innerHTML = hearts;
        const timerElement = document.querySelector('#timer');
        if (timerElement) timerElement.innerHTML = leaderboard.formatTime(survivalTime);

        document.querySelector('#username-input').value = '';

        const classRadios = document.querySelectorAll('input[name="player-class"]');
        classRadios.forEach(radio => (radio.checked = false));

        const gameOverElement = document.querySelector('#gameOver');
        if (gameOverElement) gameOverElement.style.display = 'none';
        const startScreenElement = document.querySelector('#start-screen');
        if (startScreenElement) startScreenElement.style.display = 'flex';

        applyClassModifiers();
    }

    canvas.addEventListener('click', (event) => {
        if (!gameStarted) return;

        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        console.log(`Click at (${mouseX}, ${mouseY})`);

        if (selectedBuilding) {
            const buttonWidth = 120;
            const buttonHeight = 36;
            const buttonX = selectedBuilding.position.x + 128 + 5;
            const towerCenterY = selectedBuilding.adjustedPosition.y + selectedBuilding.height / 2;
            const totalButtonHeight = buttonHeight * 2 + 5;
            const upgradeButtonY = towerCenterY - totalButtonHeight / 2;
            const sellButtonY = upgradeButtonY + buttonHeight + 5;

            const upgradeCost = selectedBuilding.getUpgradeCost();
            const canAffordUpgrade = coins >= upgradeCost;
            const canUpgrade = selectedBuilding.level < 3;

            if (menuOpen && selectedTile && !selectedTile.isOccupied) {
                const menuWidth = 64 * 4 + 7;
                const menuHeight = 64 + 7 + 20;
                const menuX = selectedTile.position.x + 64 - menuWidth / 2;
                const menuYBase = selectedTile.position.y - 32;
                const menuYShift = (64 + 7 + 20) * 0.2;
                const menuY = menuYBase + menuYShift;

                console.log(`Menu bounds: x(${menuX} to ${menuX + menuWidth}), y(${menuY} to ${menuY + menuHeight})`);

                if (
                    mouseX > menuX &&
                    mouseX < menuX + menuWidth &&
                    mouseY > menuY &&
                    mouseY < menuY + menuHeight
                ) {
                    console.log(`Hovered tower index: ${hoveredTowerIndex}`);
                    const towerIndex = hoveredTowerIndex;
                    const availableTowers = selectedClass && selectedClass.name === 'Seeder'
                        ? towerTypes.filter(tower => tower.name !== 'SuperSeedTower')
                        : towerTypes;
                    const selectedTower = availableTowers[towerIndex];

                    console.log(`Selected tower: ${selectedTower ? selectedTower.name : 'undefined'}`);
                    console.log(`Coins: ${coins}, Tower cost: ${selectedTower ? selectedTower.cost : 'N/A'}`);
                    console.log(`Buildings: ${buildings.length}, Max tower slots: ${maxTowerSlots}`);

                    if (selectedTower && coins >= selectedTower.cost && buildings.length < maxTowerSlots) {
                        let canPlace = true;
                        const tilesToOccupy = [];

                        for (let dx = 0; dx < 2; dx++) {
                            for (let dy = 0; dy < 2; dy++) {
                                const tileX = selectedTile.position.x + dx * 64;
                                const tileY = selectedTile.position.y + dy * 64;
                                const tile = placementTiles.find(
                                    t => t.position.x === tileX && t.position.y === tileY
                                );
                                if (!tile || tile.isOccupied) {
                                    canPlace = false;
                                    break;
                                }
                                tilesToOccupy.push(tile);
                            }
                            if (!canPlace) break;
                        }

                        if (!canPlace) {
                            menuOpen = false;
                            selectedTile = undefined;
                            activeTile = undefined;
                            console.log('Cannot place tower, closing menu');
                            return;
                        }

                        coins -= selectedTower.cost;
                        document.querySelector('#coins').innerHTML = Math.floor(coins);

                        const newBuilding = new Building({
                            position: {
                                x: selectedTile.position.x,
                                y: selectedTile.position.y
                            },
                            towerType: selectedTower
                        });
                        buildings.push(newBuilding);

                        tilesToOccupy.forEach(tile => {
                            tile.isOccupied = true;
                        });

                        menuOpen = false;
                        selectedTile = undefined;
                        activeTile = undefined;
                        buildings.sort((a, b) => a.position.y - b.position.y);

                        towerDoneSound.play().catch((error) => {
                            console.error('Error playing TowerDone sound:', error);
                        });
                        console.log(`Placed new tower ${newBuilding.towerType.name} at (${newBuilding.center.x}, ${newBuilding.center.y})`);
                    } else {
                        console.log('Cannot place tower: conditions not met');
                    }
                    return;
                } else {
                    menuOpen = false;
                    selectedTile = undefined;
                    activeTile = undefined;
                    selectedBuilding = null;
                    console.log('Clicked outside menu, closing menu and deselecting building');
                    return;
                }
            }

            if (
                canUpgrade &&
                canAffordUpgrade &&
                mouseX >= buttonX &&
                mouseX <= buttonX + buttonWidth &&
                mouseY >= upgradeButtonY &&
                mouseY <= upgradeButtonY + buttonHeight
            ) {
                console.log(`Upgrading tower ${selectedBuilding.towerType.name} at (${selectedBuilding.center.x}, ${selectedBuilding.center.y})`);
                coins -= upgradeCost;
                document.querySelector('#coins').innerHTML = Math.floor(coins);
                selectedBuilding.upgrade();
                return;
            }

            if (
                mouseX >= buttonX &&
                mouseX <= buttonX + buttonWidth &&
                mouseY >= sellButtonY &&
                mouseY <= sellButtonY + buttonHeight
            ) {
                console.log(`Selling tower ${selectedBuilding.towerType.name} at (${selectedBuilding.center.x}, ${selectedBuilding.center.y})`);
                const sellPrice = selectedBuilding.getSellPrice();
                coins += sellPrice;
                document.querySelector('#coins').innerHTML = Math.floor(coins);

                const baseTile = placementTiles.find(
                    t =>
                        t.position.x === selectedBuilding.position.x &&
                        t.position.y === selectedBuilding.position.y
                );
                if (baseTile) {
                    const tileX = baseTile.position.x;
                    const tileY = baseTile.position.y;
                    for (let dx = 0; dx < 2; dx++) {
                        for (let dy = 0; dy < 2; dy++) {
                            const tile = placementTiles.find(
                                t => t.position.x === tileX + dx * 64 && t.position.y === tileY + dy * 64
                            );
                            if (tile) tile.isOccupied = false;
                        }
                    }
                }

                buildings = buildings.filter(b => b !== selectedBuilding);
                selectedBuilding = null;
                console.log('Selected building set to null after selling');
                return;
            }
        }

        if (menuOpen && selectedTile && !selectedTile.isOccupied) {
            const menuWidth = 64 * 4 + 7;
            const menuHeight = 64 + 7 + 20;
            const menuX = selectedTile.position.x + 64 - menuWidth / 2;
            const menuYBase = selectedTile.position.y - 32;
            const menuYShift = (64 + 7 + 20) * 0.2;
            const menuY = menuYBase + menuYShift;

            if (
                mouseX > menuX &&
                mouseX < menuX + menuWidth &&
                mouseY > menuY &&
                mouseY < menuY + menuHeight
            ) {
                const towerIndex = hoveredTowerIndex;
                const availableTowers = selectedClass && selectedClass.name === 'Seeder'
                    ? towerTypes.filter(tower => tower.name !== 'SuperSeedTower')
                    : towerTypes;
                const selectedTower = availableTowers[towerIndex];

                if (selectedTower && coins >= selectedTower.cost && buildings.length < maxTowerSlots) {
                    let canPlace = true;
                    const tilesToOccupy = [];

                    for (let dx = 0; dx < 2; dx++) {
                        for (let dy = 0; dy < 2; dy++) {
                            const tileX = selectedTile.position.x + dx * 64;
                            const tileY = selectedTile.position.y + dy * 64;
                            const tile = placementTiles.find(
                                t => t.position.x === tileX && t.position.y === tileY
                            );
                            if (!tile || tile.isOccupied) {
                                canPlace = false;
                                break;
                            }
                            tilesToOccupy.push(tile);
                        }
                        if (!canPlace) break;
                    }

                    if (!canPlace) {
                        menuOpen = false;
                        selectedTile = undefined;
                        activeTile = undefined;
                        console.log('Cannot place tower, closing menu');
                        return;
                    }

                    coins -= selectedTower.cost;
                    document.querySelector('#coins').innerHTML = Math.floor(coins);

                    const newBuilding = new Building({
                        position: {
                            x: selectedTile.position.x,
                            y: selectedTile.position.y
                        },
                        towerType: selectedTower
                    });
                    buildings.push(newBuilding);

                    tilesToOccupy.forEach(tile => {
                        tile.isOccupied = true;
                    });

                    menuOpen = false;
                    selectedTile = undefined;
                    activeTile = undefined;
                    buildings.sort((a, b) => a.position.y - b.position.y);

                    towerDoneSound.play().catch((error) => {
                        console.error('Error playing TowerDone sound:', error);
                    });
                    console.log(`Placed new tower ${newBuilding.towerType.name} at (${newBuilding.center.x}, ${newBuilding.center.y})`);
                }
                return;
            } else {
                menuOpen = false;
                selectedTile = undefined;
                activeTile = undefined;
                selectedBuilding = null;
                console.log('Clicked outside menu, closing menu and deselecting building');
                return;
            }
        }

        let newSelectedBuilding = null;
        for (let i = 0; i < buildings.length; i++) {
            const building = buildings[i];
            if (building.isHovered(mouseX, mouseY)) {
                console.log(`Clicked on ${building.towerType.name} at position (${building.adjustedPosition.x}, ${building.adjustedPosition.y}) with range ${building.radius}`);
                newSelectedBuilding = building;
                break;
            } else {
                console.log(`Click at (${mouseX}, ${mouseY}) did not hit ${building.towerType.name} at (${building.adjustedPosition.x}, ${building.adjustedPosition.y}) with width ${building.width}, height ${building.height}`);
            }
        }

        if (newSelectedBuilding !== selectedBuilding) {
            console.log(`Changing selected building from ${selectedBuilding ? selectedBuilding.towerType.name : 'none'} (range: ${selectedBuilding ? selectedBuilding.radius : 'N/A'}) to ${newSelectedBuilding ? newSelectedBuilding.towerType.name : 'none'} (range: ${newSelectedBuilding ? newSelectedBuilding.radius : 'N/A'})`);
            selectedBuilding = newSelectedBuilding;
        }

        if (!newSelectedBuilding) {
            activeTile = null;
            for (let i = 0; i < placementTiles.length; i++) {
                const tile = placementTiles[i];
                if (
                    mouseX > tile.position.x &&
                    mouseX < tile.position.x + tile.size &&
                    mouseY > tile.position.y &&
                    mouseY < tile.position.y + tile.size
                ) {
                    activeTile = tile;
                    break;
                }
            }

            if (activeTile && !activeTile.isOccupied) {
                if (buildings.length >= maxTowerSlots) {
                    console.log('Max tower slots reached, cannot open menu');
                    return;
                }
                let canPlace = true;
                for (let dx = 0; dx < 2; dx++) {
                    for (let dy = 0; dy < 2; dy++) {
                        const tileX = activeTile.position.x + dx * 64;
                        const tileY = activeTile.position.y + dy * 64;
                        const tile = placementTiles.find(
                            t => t.position.x === tileX && t.position.y === tileY
                        );
                        if (!tile || tile.isOccupied) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }

                if (canPlace) {
                    menuOpen = true;
                    selectedTile = activeTile;
                    selectedBuilding = null;
                    console.log('Opening menu for tower placement, deselecting building');
                }
            } else {
                selectedBuilding = null;
                console.log('Clicked on nothing, deselecting building');
            }
        }
    });

    window.addEventListener('mousemove', (event) => {
        if (!gameStarted) return;

        mouse.x = event.clientX - canvas.getBoundingClientRect().left;
        mouse.y = event.clientY - canvas.getBoundingClientRect().top;

        let newHoveredBuilding = null;
        if (!menuOpen) {
            buildings.forEach((building) => {
                if (building.isHovered(mouse.x, mouse.y)) {
                    newHoveredBuilding = building;
                }
            });
        }
        hoveredBuilding = newHoveredBuilding;

        if (!menuOpen && !hoveredBuilding) {
            activeTile = null;
            for (let i = 0; i < placementTiles.length; i++) {
                const tile = placementTiles[i];
                if (
                    mouse.x > tile.position.x &&
                    mouse.x < tile.position.x + tile.size &&
                    mouse.y > tile.position.y &&
                    mouse.y < tile.position.y + tile.size
                ) {
                    activeTile = tile;
                    break;
                }
            }
        } else if (hoveredBuilding) {
            activeTile = null;
        }
    });

    function applyClassModifiers() {
        if (!selectedClass) return;

        towerTypes.forEach(tower => {
            tower.damage = towerTypes.find(t => t.name === tower.name).damage;
            tower.fireRate = towerTypes.find(t => t.name === tower.name).fireRate;
        });

        if (selectedClass.name === 'Risker') {
            towerTypes.forEach(tower => {
                tower.damage *= selectedClass.damageModifier;
                tower.fireRate /= selectedClass.fireRateModifier;
            });
        } else if (selectedClass.name === 'Flashy') {
            towerTypes.forEach(tower => {
                tower.damage *= selectedClass.damageModifier;
            });
        } else if (selectedClass.name === 'SuperSeeder') {
            towerTypes.forEach(tower => {
                tower.damage *= selectedClass.damageModifier;
                tower.fireRate *= selectedClass.fireRateModifier;
            });
            hearts = Math.floor(hearts * selectedClass.livesModifier);
        }
    }

    function startGameStartMusic() {
        if (!hasInteracted) {
            hasInteracted = true;
            gameStartMusic.play().catch((error) => {
                console.error('Error playing GameStartMusic on user interaction:', error);
            });
        }
    }

    const usernameInput = document.getElementById('username-input');
    usernameInput.addEventListener('focus', startGameStartMusic);
    usernameInput.addEventListener('keypress', startGameStartMusic);

    document.getElementById('start-game-button').addEventListener('click', () => {
        const usernameInput = document.querySelector('#username-input').value.trim();

        if (usernameInput === '') {
            alert('Please enter a username!');
            return;
        }

        const selectedClassRadio = document.querySelector('input[name="player-class"]:checked');
        if (!selectedClassRadio) {
            alert('Please select a class!');
            return;
        }

        username = usernameInput;
        selectedClass = classes.find(cls => cls.name === selectedClassRadio.value);

        applyClassModifiers();

        // Update UI after applying class modifiers (which may adjust hearts)
        document.querySelector('#hearts').innerHTML = hearts;
        document.querySelector('#coins').innerHTML = coins;


        document.querySelector('#start-screen').style.display = 'none';
        gameStarted = true;
        startTime = Date.now();
        lastWaveTime = startTime;
        waveNumber = 0; // Start at 0, will increment to 1 on first wave
        gameStartMusic.pause();
        gameStartMusic.currentTime = 0;
        playMusic.play().catch((error) => {
            console.error('Error playing PlayMusic on game start:', error);
        });
        // Spawn the first wave immediately
        waveNumber++;
        const enemyCount = calculateEnemyCount(waveNumber);
        spawnEnemies(enemyCount);
    });

    function gameOver() {
        console.log('Game Over');
        gameStarted = false;
        playMusic.pause();
        playMusic.currentTime = 0;
        gameOverSound.play().catch((error) => {
            console.error('Error playing GameOver sound:', error);
        });

        survivalTime = Math.floor((Date.now() - startTime) / 1000);
        const survivalTimeElement = document.querySelector('#survival-time');
        if (survivalTimeElement) {
            survivalTimeElement.innerHTML = leaderboard.formatTime(survivalTime);
        } else {
            console.warn('Survival time element not found in DOM');
        }

        const gameOverElement = document.querySelector('#gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'flex';
        } else {
            console.warn('Game over element not found in DOM');
        }

        // Save the score using leaderboard.js
        const usernameValue = document.querySelector('#username-input').value || 'Anonymous';
        leaderboard.saveScore(usernameValue, survivalTime);

        // Update both game-over and start screen leaderboards
        leaderboard.displayLeaderboard('game-over-leaderboard-body');
        leaderboard.displayLeaderboard('start-leaderboard-body');
    }

    document.getElementById('play-again-button').addEventListener('click', () => {
        resetGame();
    });

    leaderboard.displayLeaderboard('start-leaderboard-body');

    document.addEventListener('DOMContentLoaded', () => {
        const startScreen = document.querySelector('#start-screen');
        if (startScreen) {
            startScreen.style.display = 'flex';
        } else {
            console.error('Start screen element not found!');
        }
        gameStarted = false;

        // Initialize UI values
        document.querySelector('#coins').innerHTML = coins;
        document.querySelector('#hearts').innerHTML = hearts;
        document.querySelector('#timer').innerHTML = leaderboard.formatTime(survivalTime);
    });

    loadImages().then(() => {
        console.log('Starting initial render...');
        animate();
    }).catch((error) => {
        console.error('Error loading images:', error);
        displayError('Error loading images: ' + error.message);
    });