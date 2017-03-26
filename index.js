var game = new Phaser.Game(600,800);

var player;
var ezEnemy;
var bullet;
var bullets;
var fireRate = 100;
var bulletDamage = 20;
var nextFire = 0;
var enemies = Array();

var mainState = {

    preload: function() { //for loading assets etc
        //load the main rocket image and save as 'player'
        game.load.image('player', 'assets/PNG/Sprites/Ships/spaceship.png'); 
        game.load.image('ezEnemy', 'assets/PNG/Sprites/Ships/spaceship.png'); 
        game.load.image('bullet', 'assets/PNG/Sprites/Missiles/spaceMissiles_012.png'); 
        game.load.image('background', 'assets/background.png');
    },


    create: function() {
        game.stage.backgroundColor = '#040114'; //change background colour
        game.physics.startSystem(Phaser.Physics.ARCADE); //setting physics type
        game.world.enableBody = true;
        game.add.tileSprite(0, 0, game.width, game.height, 'background');

        // Create the player
        player = game.add.sprite(300, 700, 'player');player.scale.setTo(0.5,0.5); //add and rescale
        player.anchor.setTo(0.5,0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.allowRotation = false;

        // Create an enemy
        enemies.push(new horizontalAIEnemy());

        //bullet creation
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        bullets.createMultiple(50, 'bullet');
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);


        this.cursor = game.input.keyboard.createCursorKeys(); //cursor object to detect key presses

        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };


    },
    update: function() {
        //setting initial speed and moving speed
        player.rotation = game.physics.arcade.angleToPointer(player);
        var speed = 322;//moving speed
        player.body.velocity.y = 0;
        player.body.velocity.x = 0;

        if(game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            player.body.velocity.y -= speed;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            player.body.velocity.y += speed;
        }

        if(game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            player.body.velocity.x -= speed;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            player.body.velocity.x += speed;
        }

        player.body.collideWorldBounds = true;

        if (game.input.activePointer.isDown) {
            fire();
        }

        enemies.forEach((enemy) => {
            // Test collisions
            var collFunc = this.enemyCollision;
            game.physics.arcade.overlap(bullets, enemy.sprite, collFunc);
            game.physics.arcade.overlap(player, enemy.sprite, function() {
            player.kill();
            game.state.start('gg'); //ends game if user crashes into enemy
            });

            // Run updates
            enemy.update();
        })

    },

    enemyCollision: function(enemy, bullet) {
        bullet.kill();
        var enemyObj = enemies.filter((e) => e.sprite == enemy)[0];

        if(enemyObj.hp > 0) {
            enemyObj.hp -= bulletDamage;
        }

        if ( enemyObj.hp <= 0) {
            enemyObj.die();
        }

        var health_per = 100 * enemyObj.hp / enemyObj.initHP;
        enemyObj.healthBar.setPercent(health_per);
    }
};

function fire() {
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;
        var bullet = bullets.getFirstDead();
        bullet.reset(player.x - 8, player.y - 8);
        bullet.rotation = player.rotation + Math.PI / 2;
        game.physics.arcade.moveToPointer(bullet, 430);
    }
}

class enemy {
    constructor() {
        this.sprite = game.add.sprite(100, 200, 'player');
        this.sprite.scale.setTo(0.5, 0.5);
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.anchor.setTo(0.5,0.5);
        this.sprite.rotation = Math.PI / 2;

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

    die() {
        var sprite = this.sprite;
        var healthBar = this.healthBar;
        var deathTween = game.add.tween(this.sprite)
        deathTween.to( { alpha: 0.5 }, 100, Phaser.Easing.Linear.None, true, 0);
        deathTween.onComplete.add(() => {sprite.kill(); healthBar.kill()});
    }

    update() {
        this.healthBar.setPosition(this.healthBar.getX(), this.healthBar.getY());
    }
}

class horizontalAIEnemy extends enemy {
    constructor() {
        super();
        this.sprite.x = this.sprite.width/2;
        this.direction = 2;
    }

    update() {
        super.update();
        this.sprite.x += this.direction;
        if (this.sprite.x > game.width-this.sprite.width/2 || this.sprite.x < this.sprite.width/2) {
            this.direction = -this.direction;
        }
    }
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
        this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },
    update: function() {
        if(this.spacebar.isDown){
            game.state.start('main');
        }
    }
};

game.state.add('main', mainState);
game.state.add('gg', gameOverState);
game.state.start('main');
