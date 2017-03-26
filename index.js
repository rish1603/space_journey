var game = new Phaser.Game(600,800);
//declarations for sprites/objects/some fields
var player;
var meteor
var explosions;
var ezEnemy;
var bullets;
var playerFireRate = 100;
var bulletDamage = 20;
var nextFire = 0;
var enemies = Array();
var gameheight = 2000;

var mainState = {

    preload: function() { //for loading assets etc
        //load the main rocket image and save as 'player'
        game.load.image('player', 'assets/PNG/Sprites/Ships/spaceship.png'); 
        game.load.image('meteor', 'assets/PNG/Sprites/Meteors/spaceMeteors_001.png'); 
        game.load.image('ezEnemy', 'assets/PNG/Sprites/Ships/spaceship.png'); 
        game.load.image('bullet', 'assets/PNG/Sprites/Missiles/spaceMissiles_012.png'); 
        game.load.spritesheet('kaboom', 'assets/explode.png',128,128);
        game.load.image('background', 'assets/background.png');
    },


    create: function() {
        game.stage.backgroundColor = '#040114'; //change background colour
        game.physics.startSystem(Phaser.Physics.ARCADE); //setting physics type
        game.world.setBounds(0, 0, game.width, 2000);

        for (var i=0;i<gameheight/game.height; i++) {
            game.add.tileSprite(0, i*game.height, game.width, game.height, 'background');
        }

        // Create the player
        player = new Player();
        game.camera.follow(player.sprite);
        game.camera.focusOn(player.sprite);

        // Create an enemy
        enemies.push(new HorizontalAIEnemy());
        enemies.push(new Meteor());

        //bullet creation
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        bullets.createMultiple(1000, 'bullet');
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);

        //explosion grouping
        explosions = game.add.group();
        explosions.createMultiple(30, 'kaboom');
        // explosions.forEach(setupEnemy, this);

        this.cursor = game.input.keyboard.createCursorKeys(); //cursor object to detect key presses

        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };


    },
    update: function() {

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

            // Run updates
            enemy.update();
        })

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
             // enemyObj.sprite.anchor.x = 0.5;
             // enemyObj.sprite.anchor.y = 0.5;
            var explosion = explosions.getFirstExists(false);
            explosion.reset(enemyObj.sprite.x, enemyObj.sprite.y);
            explosion.play('kaboom', 30, false, true);
            enemyObj.die();

        }

        var health_per = 100 * enemyObj.hp / enemyObj.initHP;
        enemyObj.healthBar.setPercent(health_per);
        bullet.kill();
    }

};

class Ship {

    constructor() {
        this.sprite = game.add.sprite(100, 200, 'player');
        this.sprite.scale.setTo(0.5, 0.5);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.anchor.setTo(0.5,0.5);
        this.sprite.animations.add('kaboom');
        this.sprite.rotation = Math.PI / 2;
        this.fireRate = 300;

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
        if (game.time.now > nextFire && bullets.countDead() > 0)
        {
            nextFire = game.time.now + this.fireRate;
            var bullet = bullets.getFirstDead();
            bullet.owner = this;
            bullet.reset(this.sprite.x, this.sprite.y);
            bullet.rotation = this.sprite.rotation + Math.PI / 2;
            game.physics.arcade.velocityFromAngle(bullet.angle - 90, 400, bullet.body.velocity)
        }
    }

}

class Enemy extends Ship {
    constructor() {
        super();
    }

    die() {
        var sprite = this.sprite;
        var healthBar = this.healthBar;
        var deathTween = game.add.tween(this.sprite)
        deathTween.to( { alpha: 0.5 }, 100, Phaser.Easing.Linear.None, true, 0);
        deathTween.onComplete.add(() => {sprite.kill(); healthBar.kill()});

        enemies.splice(enemies.indexOf(this), 1);
    }

    update() {
        this.healthBar.setPosition(this.healthBar.getX(), this.healthBar.getY());
    }
}

class Player extends Ship {
    constructor() {
        super();
        this.sprite.anchor.setTo(0.5,0.5);
        this.sprite.y = 1000;
        this.fireRate = playerFireRate;
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowRotation = false;
    }

    update() {
        //setting initial speed and moving speed
        this.sprite.rotation = game.physics.arcade.angleToPointer(this.sprite);
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
            game.state.start('main');
        }
    }
};

game.state.add('main', mainState);
game.state.add('gg', gameOverState); game.state.start('main');
