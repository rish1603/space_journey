var game = new Phaser.Game(600,800);
    
    var player;
    var bullet; //bullets?
    var fireRate = 100;
    var nextFire = 0;

var mainState = {

    preload: function() { //for loading assets etc
        //load the main rocket image and save as 'player'
        game.load.image('player', 'assets/PNG/Sprites/Ships/spaceship.png'); 
        game.load.image('bullet', 'assets/PNG/Sprites/Missiles/spaceMissiles_012.png'); 
    },


    create: function() {
        game.stage.backgroundColor = '#040114'; //change background colour
        game.physics.startSystem(Phaser.Physics.ARCADE); //setting physics type
        game.world.enableBody = true;

        player = game.add.sprite(300, 700, 'player');player.scale.setTo(0.5,0.5); //add and rescale

        player.anchor.setTo(0.5,0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.allowRotation = false;

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

        if (game.input.activePointer.isDown)
        {
            fire();
        }

    }
};

function fire() {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;
        var bullet = bullets.getFirstDead();
        bullet.reset(player.x - 8, player.y - 8);
        game.physics.arcade.moveToPointer(bullet, 430);
    }
}

game.state.add('main', mainState);
game.state.start('main');
