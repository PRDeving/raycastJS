#RaycastJS
RaycastJS is a lightwheight library that allows you to do raycasting in pure JS.

#Use
once provided the information, the Raycast function returns only the visible tiles:
```javascript
    var visible_tiles = Raycast({
      map: MAP_ARRAY, //it handles 1D and 2D map arrays
      center: {x: XPOS,y: YPOS}, //has to be an object with x and y properties
      tileSize: TILESIZE, //optional, if not provided the length of sight will be measured in cells
      lengthOfSight: 10, //Length of sight, what else to say
      precision: 100, //number of rays to cast, more means more precision
      vBlock: [0] /array of tiles that blocks the vision [0,1,6,3...]
    });

    console.log(visible_tiles);
    //OUTPUT: [[10,11],[1,5]...];
```

