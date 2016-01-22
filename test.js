//canvas initialization
var canvas = document.getElementsByTagName("canvas")[0];
canvas.height = 300;
canvas.width = 300;
var ctx = canvas.getContext("2d");

//Vector 2D structure definition
var vec2 = function(_x,_y){
    this.x = _x || 0;
    this.y = _y || 0;

    this.add = function(v){
        var t = new vec2;
        t.x = this.x + v.x;
        t.y = this.y + v.y;
        return t;
    }
}


//Player Object
var Player = function(){
    var pos = new vec2(0,50*world.ts);

    this.pos = function(){
        return pos;
    }
    this.Draw = function(){
        ctx.save();
        ctx.fillStyle = "red";
        ctx.fillRect(pos.x, pos.y, world.ts , world.ts);
        ctx.restore();
    }

    this.Move = function(kc){
        pos.x++;
        if(pos.x > canvas.width)pos.x = 0;
    }
}


//Map Object
var WorldMap = function(){
    var size = 100;
    var ts = 3;
    var visible = [];

    //Generation of a map with random dots
    var tiles = (function(){
        var temp = [];
        for(var y = 0; y < size; y++){
            var row = new Int8Array(size);
            for(var r in row){
                (y != 50 && Math.floor(Math.random()*100) > 90)? row[r] = 0 : row[r] = 1;
            }
            temp.push(row);
        }
        return temp;
    })();

    //Draws the map tiles if they are visibles
    this.Draw = function(){
        ctx.save();
        ctx.fillStyle = "grey";
        ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.restore();

        for(var x = 0; x < visible.length ; x++){
            var tt = tiles[visible[x][1]][visible[x][0]];
            ctx.fillStyle = (tt == 0)? "black" : "green";

            ctx.fillRect(0 + (ts * visible[x][0]), 0 + (ts * visible[x][1]), ts, ts);
        }

    }

    this.setVisibles = function(vis){
        visible = vis;
    }

    this.map = tiles;
    this.ts = ts;
}

window.onload = (function(){
    //Implementation
    world = new WorldMap();
    pj = new Player();

    window.timer = setInterval(function(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      world.setVisibles(
        Raycast({
          map: world.map,
          center: {x: pj.pos().x,y: pj.pos().y},
          tileSize: world.ts,
          lengthOfSight: 10,
          precision: 100,
          vBlock: [0]
        })
      );
      world.Draw();
      pj.Draw();
      pj.Move();
    },1000/60);
});
