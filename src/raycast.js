function Raycast(args){
    var map = args.map;
    var map2D = (map.length === map[0].length)? true : false;
    var mapSize = (map2D)? map.length : Math.sqrt(map);
    var center = args.center || {x: mapSize/2, y: mapSize/2};
    var los = args.lengthOfSight || mapSize/2;

    var ts = args.tileSize || 1;
    var prec = args.precision || 100;
    var block = args.vBlock || [0];

    var visibles = [];

    var rays = 3600 * ((prec || 100)/100);
    var los = los || mapSize;
    var visible = [];
    var angle = 360/rays;

    var getTileByCoord = function(tile){
        return map[Math.round(tile.y/ts)][Math.round(tile.x/ts)];
    }

    var tileVisible_1 = function(tile){
        visibles.push([Math.round(tile.x / ts), Math.round(tile.y / ts)]);
    }

    var tileVisible = function(x,y){
        visibles.push([x,y]);
    }

    var getTilesCrossed = function(ini, end){
        var ini = {
            x: (ini.length == 2)? ini[0] : ini.x,
            y: (ini.length == 2)? ini[1] : ini.y
        }
        var end = {
            x: (end.length == 2)? end[0] : end.x,
            y: (end.length == 2)? end[1] : end.y
        }

        var steep = Math.abs(ini.y - end.x) > Math.abs(ini.y - end.x);

        if (steep) {
            ini = {x:ini.y, y:ini.x};
            end = {x:end.y, y:end.x};
        }
        if (ini.x > end.x) {
            ini = {x:ini.y, y:ini.x};
            end = {x:end.y, y:end.x};
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
            var tile = (map2D)? map[y][x] : map[x + y*mapSize];
            if(typeof tile == "number"){
                if(steep)
                    tileVisible(y,x);
                else
                    tileVisible(x,y);

                if(block.indexOf(tile) >= 0) break;

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
    
    for(var r = 0; r < rays; r++){
        var p = {x:center.x, y:center.y};
        var ang = (angle * r) * (Math.PI / 180);

        for(var f = 0; f < los; f++){
            var pointing = {x:p.x + (ts*f) * Math.cos(ang), y:p.y -1  + (ts*f) * Math.sin(ang)};
            var t = getTileByCoord(pointing) |0;

            if(typeof t == "number" && block.indexOf(t) < 0){
                tileVisible_1(pointing);
            }else{
                tileVisible_1(pointing);
                break;
            }
        }
    }

    return visibles;
 }
