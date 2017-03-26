var game = new Phaser.Game(600,800);
//declarations for sprites/objects/some fields
var player;
var meteor
var bullets;
var playerFireRate = 100;
var bulletDamage = 20;
var enemies = Array();
var scoreText;
var currentLevel = -1;
var numKills = 0;

var explosionSound;
var shootingSound;

var theme = "Sprites";

var gameMap = [
    {
        'horizontal': 2
    },
    {
        'horizontal': 2,
        'meteor': 1
    }
]


function startLevel(levelNumber) {

    var mapEnemyTypes = {
        "horizontal": HorizontalAIEnemy,
        "meteor": Meteor
    }

    var level = gameMap[levelNumber];

    for (enemy in level) {
        var num_enemies = level[enemy];
        var construct = mapEnemyTypes[enemy];

        for (var i=0; i<num_enemies; i++) {
            var enemy = new construct();
            enemy.sprite.x = enemy.sprite.width/2 +(i * game.width / num_enemies);
            enemy.sprite.y = -enemy.sprite.height; // From above
            enemies.push(enemy);
        }

    }
}

var mainState = {

    preload: function() { //for loading assets etc
        //load the main rocket image and save as 'player'
        game.load.image('player', 'assets/PNG/' + theme + '/Ships/spaceship.png'); 
        game.load.image('meteor', 'assets/PNG/Sprites/Meteors/spaceMeteors_001.png'); 
        game.load.image('bullet', 'assets/PNG/Sprites/Missiles/spaceMissiles_012.png'); 
        game.load.image('background', 'assets/background.png');

        game.load.audio('explosion', 'assets/sounds/explosion.wav');
        game.load.audio('gunfire', 'assets/sounds/shooting.wav');
    },

    create: function() {
        game.stage.backgroundColor = '#040114'; //change background colour
        game.physics.startSystem(Phaser.Physics.ARCADE); //setting physics type
        game.world.setBounds(0, 0, game.width, game.height);

        game.add.tileSprite(0, 0, game.width, game.height, 'background');
        
        // Add the sound effects
        explosion = game.add.audio('explosion');
        gunfire = game.add.audio('gunfire');

        // Create the player
        player = new Player();
        game.camera.follow(player.sprite);
        game.camera.focusOn(player.sprite);

        //bullet creation
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        bullets.createMultiple(100, 'bullet');
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);

        scoreText = game.add.text(game.world.width / 2 - 40, game.world.height - 30, 'Score: 0',
            {
                font: '22px Arial',
                fill: '#fff',
                align: 'center'
            }
        );


        this.cursor = game.input.keyboard.createCursorKeys(); //cursor object to detect key presses
        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };
    },

    update: function() {

        if (enemies.length == 0) {
            currentLevel++;
            startLevel(currentLevel);
        }

        player.update();

        if (game.input.activePointer.isDown) {
            player.fire();
        }

        enemies.forEach((enemy) => {
            // Test collisions
            var collFunc = this.enemyCollision;
            game.physics.arcade.overlap(bullets, enemy.sprite, collFunc);
            game.physics.arcade.overlap(player.sprite, enemy.sprite, function() {
                player.sprite.kill();
                game.state.start('gg'); //ends game if user crashes into enemy
            });

            if (enemy.sprite.y < enemy.sprite.height) {
                // Make an entrance
                enemy.sprite.y++;
            }
            else {
                // Run updates
                enemy.update();
            }
        })

        //update score text
    },

    enemyCollision: function(enemy, bullet) {

        if (bullet.owner != player) {
            return;
        }

        var enemyObj = enemies.filter((e) => e.sprite == enemy)[0];

        if(enemyObj.hp > 0) {
            enemyObj.hp -= bulletDamage;
        }

        if ( enemyObj.hp <= 0) {
            enemyObj.die();
        }

        var health_per = 100 * enemyObj.hp / enemyObj.initHP;
        enemyObj.healthBar.setPercent(health_per);
        bullet.kill();
    }
};

class Ship {

    constructor() {
        this.sprite = game.add.sprite(0, 100, 'player');
        this.sprite.scale.setTo(0.5, 0.5);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.anchor.setTo(0.5,0.5);
        this.sprite.rotation = Math.PI / 2;
        this.fireRate = 500;
        this.nextFire = 0;

        this.hp = 100;
        this.initHP = 100;
        this.scale = 0.5;

        this.healthBar = new HealthBar(game, {
            x: 0,
            y: 0,
            width: this.sprite.width,
            height: 10,
            bg: {color: "#BDC3C7"}, // Grey
            bar:{color: "#26A65B"}
        });

        var sprite = this.sprite;
        this.healthBar.getX = () => { return sprite.x }
        this.healthBar.getY = () => { return sprite.y  - sprite.height/1.5}
    }

    // Fire a bullet
    fire() {
        if (game.time.now > this.nextFire && bullets.countDead() > 0)
        {
            this.nextFire = game.time.now + this.fireRate;
            var bullet = bullets.getFirstDead();
            bullet.owner = this;
            bullet.reset(this.sprite.x, this.sprite.y);
            bullet.rotation = this.sprite.rotation + Math.PI / 2;
            game.physics.arcade.velocityFromAngle(bullet.angle - 90, 400, bullet.body.velocity);
            gunfire.play();
        }
    }

    die() {
        var sprite = this.sprite;
        var healthBar = this.healthBar;
        var deathTween = game.add.tween(this.sprite)
        deathTween.to( { alpha: 0.5 }, 100, Phaser.Easing.Linear.None, true, 0);
        deathTween.onComplete.add(() => {sprite.kill(); healthBar.kill()});

        enemies.splice(enemies.indexOf(this), 1);
        numKills++;
        scoreText.text = "Score: " + numKills;

        explosion.play();
    }

}

class Enemy extends Ship {
    constructor() {
        super();
    }
    update() {
        this.healthBar.setPosition(this.healthBar.getX(), this.healthBar.getY());
    }
}

class Player extends Ship {

    constructor() {
        super();
        this.sprite.anchor.setTo(0.5,0.5);
        this.sprite.y = game.world.height - 100;
        this.sprite.x = game.width/2;
        this.fireRate = playerFireRate;
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowRotation = false;
    }

    update() {
        //setting initial speed and moving speed
        this.sprite.rotation = game.physics.arcade.angleToPointer(this.sprite);
        this.healthBar.setPosition(this.healthBar.getX(), this.healthBar.getY());
        var speed = 322;//moving speed
        this.sprite.body.velocity.y = 0;
        this.sprite.body.velocity.x = 0;

        if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.sprite.body.velocity.y -= speed;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.sprite.body.velocity.y += speed;
        }

        if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.sprite.body.velocity.x -= speed;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.sprite.body.velocity.x += speed;
        }

        this.sprite.body.collideWorldBounds = true;
    }
}


class HorizontalAIEnemy extends Enemy {
    constructor() {
        super();
        this.sprite.x = this.sprite.width/2;
        this.sprite.scale = {x: 0.3, y: 0.3};
        this.direction = 2;
        this.lastFire = game.time;
    }

    update() {
        super.update();
        this.sprite.x += this.direction;
        if (this.sprite.x > game.width-this.sprite.width/2 || this.sprite.x < this.sprite.width/2) {
            this.direction = -this.direction;
        }

        // This will be auto rate limited
        this.fire();
    }
}


class Meteor extends Enemy {

    constructor() {
        super();
        this.sprite.loadTexture('meteor');

        this.hp = 150;
        this.initHP = 150;
    }

    update() {
        super.update();
        this.sprite.y +=  3
    }
}

function getRand(min, max) {
    return Math.random() * (max - min) + min;
}

var gameOverState = {
    create: function() {
        label = game.add.text(game.world.width / 2, game.world.height/2, 'GG \n Press Space to Restart',
            {
                font: '22px Arial',
                fill: '#fff',
                align: 'center'
            }
        );
        label.anchor.setTo(0.5,0.5);
        game.camera.focusOn(label);
        this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },
    update: function() {
        if(this.spacebar.isDown){
            enemies = [];
            currentLevel = -1;
            numKills = 0;
            game.state.start('main');
        }
    }
};

game.state.add('main', mainState);
game.state.add('gg', gameOverState);
game.state.start('main');
