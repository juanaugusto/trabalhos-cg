/**
 * Created by jaugusto on 12/3/16.
 */

window.onload = function(){
    clock = new THREE.Clock();
    treeGroup = new THREE.Group();

    scene1 = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    camera = new THREE.PerspectiveCamera( 35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 25000 );
    camera.position.z = 1500;

    scene1 = new THREE.Scene();

    //scene1.fog = new THREE.Fog( 0xf2f7ff, 1, 25000 );

    scene1.fog = new THREE.Fog( 0x87ceeb, 1, 25000 );

    scene1.add( new THREE.AmbientLight( 0xeef0ff ) );

    var light1 = new THREE.DirectionalLight( 0xffffff, 2 );
    light1.position.set( 1, 1, 1 );
    scene1.add( light1 );



    //

    textureLoader = new THREE.TextureLoader();

    var maxAnisotropy = renderer.getMaxAnisotropy();

    var texture1 = textureLoader.load( "img/floor-texture-2.jpg" );
    var material1 = new THREE.MeshPhongMaterial( { color:0x777777 /*0x8b8989*/, specular: 0x111111, map: texture1 } );

    texture1.anisotropy = maxAnisotropy;
    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(25, 25 );




    //
    //var geometry = new THREE.PlaneBufferGeometry( 100, 100 );

    var geometry = new THREE.PlaneBufferGeometry(200,200);
    var mesh1 = new THREE.Mesh( geometry, material1 );
    mesh1.rotation.x = - Math.PI / 2;
    mesh1.scale.set( 1000, 1000, 1000 );

    scene1.add( mesh1 );


    // create the particle variables
    particleCount = 1800;
    particles = new THREE.Geometry();

    var textureSnow = new THREE.TextureLoader().load( "img/particle.jpg" );
    textureSnow.wrapS = THREE.RepeatWrapping;
    textureSnow.wrapT = THREE.RepeatWrapping;
    textureSnow.repeat.set( 4, 4 );


    var pMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 20,
            map:textureSnow,
            blending: THREE.AdditiveBlending,
            transparent: true
        });



    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * 2000 - 500;
        var pY = Math.random() * 2000 - 500;
        var pZ = Math.random() * 2000 - 500;
        var particle = new THREE.Vector3(pX, pY, pZ);


        // add it to the geometry
        particles.vertices.push(particle);
    }

    // create the particle system
    particleSystem = new THREE.Points(
        particles,
        pMaterial);

    particleSystem.sortParticles = true;


    // add it to the scene
    scene1.add(particleSystem);

    //

    renderer.setClearColor( scene1.fog.color );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.autoClear = false;

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );


    var audio = document.createElement('audio');
    var source = document.createElement('source');
    source.src = 'sounds/christmas.mp3';
    audio.appendChild(source);
    //audio.play();

    animate();

};


function animate() {

    // add some rotation to the system



    requestAnimationFrame( animate );

    render();


}

function render() {
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y = THREE.Math.clamp( camera.position.y + ( - ( mouseY - 200 ) - camera.position.y ) * .05, 50, 1000 );

    camera.lookAt( scene1.position );

    particleSystem.rotation.x += 0.01;

    renderer.clear();



    refreshTree();

    treeGroup.rotation.y -= clock.getDelta() * 0.5;

    // renderer.setScissorTest( true );

    //renderer.setScissor( 0, 0, SCREEN_WIDTH/2 - 2, SCREEN_HEIGHT );
    renderer.render( scene1, camera );

    //renderer.setScissor( SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2 - 2, SCREEN_HEIGHT  );
   // renderer.render( scene2, camera );

   // renderer.setScissorTest( false );

    //requestAnimationFrame( render );

    //renderer.render( scene, camera );
}

function onDocumentMouseMove(event) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeSection(botWidth, topWidth, height, translateY, shiftX, shiftY){
    var geom = new THREE.Geometry();


    for(var xx=-1; xx <= 1; xx+=2){
        var v1 = new THREE.Vector3(xx*botWidth/2         , 0      + translateY, -botWidth/2);
        var v2 = new THREE.Vector3(xx*topWidth/2 + shiftX, height + translateY, -topWidth/2  + shiftY);
        var v3 = new THREE.Vector3(xx*topWidth/2 + shiftX, height + translateY,  topWidth/2  + shiftY);
        var v4 = new THREE.Vector3(xx*botWidth/2         , 0      + translateY,  botWidth/2);

        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);
        geom.vertices.push(v4);
    }
    geom.faces.push( new THREE.Face3( 1, 0, 2 ) );
    geom.faces.push( new THREE.Face3( 2, 0, 3 ) );

    geom.faces.push( new THREE.Face3( 4, 5, 6 ) );
    geom.faces.push( new THREE.Face3( 4, 6, 7 ) );

    geom.faces.push( new THREE.Face3( 3, 7, 6 ) );
    geom.faces.push( new THREE.Face3( 2, 3, 6 ) );

    geom.faces.push( new THREE.Face3( 1, 4, 0 ) );
    geom.faces.push( new THREE.Face3( 1, 5, 4 ) );

    geom.myData = "fdnsjkfdnjsk";

    geom.computeFaceNormals();
    return geom;
}

function generateRandomIntSet(lower, upper, count){
    var items = [];
    for(var hi = 0; hi < count; hi++){
        items.push(getRandomIntInclusive(lower,upper));
    }
    items.sort(compareNumbers);
    //items.reverse();

    return (items);
}
function compareNumbers(a, b){  return a - b; }

function createGoldenSet(start, count){
    var GR = 1.618;
    var grSet = [start];
    var currentValue = start;
    for(var index = 0; index < count; index++){
        // some variance on the Golden ration
        currentValue *= (GR + Math.random()/2-0.25);
        grSet.push(currentValue);
    }
    return grSet;
}

function makeTree(scene){

    var scale = 150;

    //Build utility variables
    var isTrunk = true; // initially make a trunk then make the rest of the tree
    var lastHeight = 0;
    var sections = 7;
    //var heights = [54,60,63,66,68,69,71];

    var heights = [54,60,63,66,68,69,71];

    //var heights = [ 80,80,80,80,80,80,80];
    var currentHeight = 0;//-heights[0] / 2;
    var widths = [372.245046479392,252.19076427505215 ,149.88792298482537, 101.9350748994837,71.37881792953567, 39.041810196524466, 25,0];

    //console.log(heights);

    for(var trunkIndex = 0; trunkIndex < sections; trunkIndex ++){
        var height = heights[trunkIndex];
        var botWidth = widths[trunkIndex];
        var topWidth = widths[trunkIndex + 1] / 2;

        var cubeMaterial = new THREE.MeshLambertMaterial({
            color: 0x1B5E20
        });

        //cube.position.y += currentHeight;
        currentHeight += height * 0.75;


        var geom;
        if(isTrunk){
            geom = makeSection(topWidth / 3, topWidth / 5, height,currentHeight , 0, 0);
            cubeMaterial = new THREE.MeshLambertMaterial({
                color: 0x4E342E
            });


            isTrunk = false;
        }
        else{
            geom = makeSection(botWidth, topWidth, height,currentHeight, 0, 0);
        }

        var cube = new THREE.Mesh(geom, cubeMaterial);

        //Main rotation (original before spin)
        //cube.rotation.y = Math.PI * (Math.random() * 90) / 180;
        //console.log(currentHeight);
        for(var idx in cube.vertices){
            cube.vertices[idx].position.y += currentHeight;
        }

        //add shadows
        cube.castShadow = true;
        cube.receiveShadow = false;


        //Add the cube to the scene
        scene.add(cube);
    }

    return scene;
    //scene.position.y = - currentHeight/2;

}

function refreshTree(){
    scene1.remove(treeGroup);
    var rotY = treeGroup.rotation.y;
    treeGroup = new THREE.Group();
    treeGroup = makeTree(treeGroup);
    treeGroup.rotation.y = rotY;
    scene1.add(treeGroup);
}


