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
    var visible = {};

    //Generation of a map with random dots
    var tiles = (function(){
        var temp = [];
        for(var y = 0; y < size; y++){
            var row = [];
            for(var x = 0; x < size; x++){
                (y != 50 && Math.floor(Math.random()*100) > 90)? row.push(0) : row.push(1);
            }
            temp.push(row);
        }
        return temp;
    })();

    //Draws the map tiles if they are visibles
    this.Draw = function(){
        for(var y = 0; y < tiles.length; y++){
            for(var x = 0; x < tiles[0].length; x++){

                if(this.isVisible(x,y)){
                    if(tiles[y][x]){
                        // ctx.strokeRect(0 + (ts * x), 0 + (ts * y), ts, ts);
                    }else{
                        ctx.fillRect(0 + (ts * x), 0 + (ts * y), ts, ts);
                    }
                }else{
                    ctx.save();
                    ctx.fillStyle = "grey";
                    ctx.fillRect(0 + (ts * x), 0 + (ts * y), ts, ts);
                    ctx.restore();
                }
            }
        }

    }

    this.getTileByCoord = function(tile){
        return tiles[Math.round(tile.y/ts)][Math.round(tile.x/ts)];
    }

    this.tileVisible = function(tile){
        if(tile == "clear"){ delete visible; visible = {};}
        if(!visible[Math.round(tile.x/ts)])
            visible[Math.round(tile.x/ts)] = {};

        visible[Math.round(tile.x/ts)][Math.round(tile.y/ts)] = true;
    }

    this.isVisible = function(tile, y){
        if(!y){
            if(visible[Math.round(tile.x/ts)] && visible[Math.round(tile.x/ts)][Math.round(tile.y/ts)])
                return true;
            return false;
        }else{
            if(visible[tile] && visible[tile][y])
                return true
            return false;
        }
    }

    this.setVisibles = function(vis){
        visible = vis;
    }

    this.map = tiles;
    this.ts = ts;
}



//Actual raycast magic
function Raycast(args){
    var map = args.map;
    var center = args.center || {x: map.length/2,y: map[0].length/2};
    var los = args.lengthOfSight || map.length/2;
    var ts = args.tileSize || 5;
    var prec = args.precision || 100;
    var block = args.vBlock || [0];

    var visibles = {};

    var rays = 3600 * ((prec || 100)/100);
    var los = los || map.length;
    var visible = [];
    var angle = 360/rays;

    var getTileByCoord = function(tile){
        return map[Math.round(tile.y/ts)][Math.round(tile.x/ts)];
    }

    var tileVisible_1 = function(tile){
        if(!visibles[Math.round(tile.x / ts)])
            visibles[Math.round(tile.x / ts)] = {};

        visibles[Math.round(tile.x / ts)][Math.round(tile.y / ts)] = true;
    }

    var tileVisible = function(tile){
        if(!visibles[Math.round(tile.x)])
            visibles[Math.round(tile.x)] = {};

        visibles[Math.round(tile.x)][Math.round(tile.y)] = true;
    }

    var getTilesCrossed = function(ini, end){
        if(!window.first){
            console.log(ini,end);
            window.first = 1;
        }
        var steep = Math.abs(ini.y - end.x) > Math.abs(ini.y - end.x);
        if (steep) {
            ini = new vec2(ini.y, ini.x);
            end = new vec2(end.y, end.x);
        }
        if (ini.x > end.x) {
            ini = new vec2(ini.y, ini.x);
            end = new vec2(end.y, end.x);
        }

        var deltax = end.x - ini.x;
        var deltay = Math.abs(end.y - ini.y);
        var error = 0;
        var ystep;
        var y = ini.y;

        if(ini.y < end.y){
            ystep = 1;
        }else{
            ystep = -1;
        }

        for (var x = ini.x; x <= end.x; x++) {
            if(typeof map[y][x] == "number"){
                var t = map[y][x];
                if(steep)
                    tileVisible(new vec2(y,x));
                else
                    tileVisible(new vec2(x,y));

                if(block.indexOf(t) >= 0) break;

                if(!steep){
                    error += deltay;
                }

                if (2 * error >= deltax) {
                    y += ystep;
                    error -= deltax;
                }
            }
        }
    }
    

    var ini = new Date().getTime();

    for(var r = 0; r < rays; r++){
        var p = new vec2(center.x, center.y);
        var ang = (angle * r) * (Math.PI / 180);

        for(var f = 0; f < los; f++){
            var pointing = new vec2(p.x + (ts*f) * Math.cos(ang), p.y -1  + (ts*f) * Math.sin(ang));
            var t = parseInt(getTileByCoord(pointing));
            if(typeof t == "number" && block.indexOf(t) < 0){
                tileVisible_1(pointing);
            }else{
                tileVisible_1(pointing);
                break;
            }
        }
    }


    // console.log("raycast in: ",new Date().getTime() - ini);
    return visibles;
 }




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
