var game = new Phaser.Game(600,800);

var mainState = {

    preload: function() { //for loading assets etc
        //load the main rocket image and save as 'player'
        game.load.image('player', 'assets/PNG/Sprites/Ships/spaceShips_007.png'); 
    },

    create: function() {
        game.stage.backgroundColor = '#040114'; //change background colour
        game.physics.startSystem(Phaser.Physics.ARCADE); //setting physics type
        game.world.enableBody = true;

        this.player = game.add.sprite(32, 32, 'player');this.player.scale.setTo(0.5,0.5); //add and rescale
        this.cursor = game.input.keyboard.createCursorKeys(); //cursor object to detect key presses


    },
    update: function() {
        //setting initial speed and moving speed
        var speed = 250;//moving speed
        this.player.body.velocity.y = 0;
        this.player.body.velocity.x = 0;

        if(this.cursor.up.isDown) {
            this.player.body.velocity.y -= speed;
        } else if (this.cursor.down.isDown) {
            this.player.body.velocity.y += speed;
        }
        
        if(this.cursor.left.isDown) {
            this.player.body.velocity.x -= speed;
        } else if (this.cursor.right.isDown) {
            this.player.body.velocity.x += speed;
        }

    }
};

game.state.add('main', mainState);
game.state.start('main');
