
var renderer, scene, camera, controls, effect, reticle, manager; 
var planeClouds, planeBirds, planeShield;
var planeClose;
var plane;
var symbolControl = new THREE.Object3D();
var websites = new THREE.Object3D();
var trust = new THREE.Object3D();
var titleControl = new THREE.Object3D();
var birdControl = new THREE.Object3D();
var symbols = [];
var cloudChildren = [];
var cube;
var dae;
var video, videoImage, videoImageContext, videoTexture;
var count = 0;
var currentObj = null;

var planeShieldTest;
var movable = false; 
var attached = false;

var fogChange = false;

var hitSymbol = false; 
var moveOut = false;

var cloudsPosInit = new THREE.Vector3();
var birdsPosInit = new THREE.Vector3();
var shieldPosInit = new THREE.Vector3();

var facebook, twitter, tumblr;
var trusted, untrusted;
var bird_1, bird_2, bird_3;
var title;

var objectForMoving;

var x = 0;
var waveHeight = 0.01;
var speed = 0.1;
var waveLength = 50;
var noiseStrength = 0.0001;
var noiseWalk = .00001;
var randomHeight = 0.001;
var randomSpeed = 0.0001;
var noiseOffset = 0.01;
var randSign = function() { return (Math.random() > 0.5) ? .05 : -.05; };

var baseHeight;

var posOff = new THREE.Vector3(0, .2, 0);

var move = true;
var opac = .7;
var circumference = 3.6;
var radius = circumference / 3.14 / 2;
var height = 0.9;

var sceneFog = 0.5
var fogCount = sceneFog;

var color = new THREE.Color(0.937, 0.820, 0.710);
var color2 = new THREE.Color(0, 0.05, .1);
var fogColor = new THREE.Color(0.937, 0.820, 0.710);

var alpha = 0;

renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setClearColor( 0xffffff, 1);
renderer.sortObjects = false;
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

var clock = new THREE.Clock(true);
scene = new THREE.Scene();


camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.001, 1000 );
controls = new THREE.VRControls( camera );

var listener = new THREE.AudioListener();
camera.add( listener );

effect = new THREE.VREffect( renderer );
effect.setSize( window.innerWidth, window.innerHeight );

manager = new WebVRManager(renderer, effect);

var makePlaneGeometry = function(width, height, widthSegments, heightSegments) {
	// var geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
	var geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
	// for (var vertIndex = 0; vertIndex < geometry.vertices.length; vertIndex++) {
	// 	geometry.vertices[vertIndex].x += Math.random() / 0.2 * randSign();
	// 	geometry.vertices[vertIndex].y += Math.random() / 0.2 * randSign();
	// 	geometry.vertices[vertIndex].z += Math.random() / 0.2 * randSign();
	// }
	
	// geometry.dynamic = true;
	// geometry.computeFaceNormals();
	// geometry.computeVertexNormals();
	// geometry.normalsNeedUpdate = true;
	return geometry;
};

var makePlane = function(geometry, color, url) {  
	var material =  new THREE.MeshLambertMaterial( {color: color, side: THREE.DoubleSide, transparent: true, opacity: 0, visible: true, map: THREE.ImageUtils.loadTexture( url ) } );
	var plane = new THREE.Mesh(geometry, material);
	plane.recieveShadow = true;
	plane.recieveLights = true;
	return plane;
};

initSymbols();
	//create gaze interaction manager
	reticle = vreticle.Reticle(camera);

// 		    reticle.reticle_text_sprite = reticle.makeTextSprite("Test ", {
//             fontsize: 50,
//             fontface: "Georgia",
//             borderThickness: 2, 
//             borderColor: {
//                 r: 170,
//                 g: 30,
//                 b: 200,
//                 a: .8
//             },
//             backgroundColor: {
//                 r: 255,
//                 g: 255,
//                 b: 255,
//                 a: .5
//             }

//         });
// reticle.reticle_text_sprite.position.setZ(-.5).setY(-.15).setX(.25);
scene.add(camera);

var enviroment = new THREE.ColladaLoader();
enviroment.options.convertUpAxis = true;
enviroment.load( 'models/test_environment.dae', function ( collada ) {

	enviroment = collada.scene;
	enviroment.traverse( function ( child ) {

		if ( child instanceof THREE.Mesh ) {

			child.geometry.computeFaceNormals();
			child.material.shading = THREE.FlatShading;
			child.recieveLights;
									// child.material.shininess = 0x3D3d3D;
									// child.material.specular = 1;
									// child.material.metal = false;			
								}
								// child.traverse( function(e) {
								// 	e.recieveShadow = true;				
								// })
							} );

	//enviroment.scale.x = enviroment.scale.y = enviroment.scale.z = 1;
	enviroment.position.y = -.2;	
	enviroment.position.x = .1;
	//enviroment.rotation.y = 2 *  -Math.PI/4;
	enviroment.updateMatrix();
} );

function movePlaneIn( plane ){
	currentObj = plane;
	new TWEEN.Tween( plane.position ).to( {
		x: .7,
		y: .35,
		z: -.4 }, 2000 )
	.easing( TWEEN.Easing.Elastic.Out).start();

}
function movePlaneOut( plane ){
	new TWEEN.Tween( plane.position ).to( {
		x: .7,
		y: -.2,
		z: -.4 }, 2000 )
	.easing( TWEEN.Easing.Elastic.Out).start();

}

var birdSymbol = new THREE.ColladaLoader();
birdSymbol.options.convertUpAxis = true;
birdSymbol.load( 'models/RotateSymbols/bird.dae', function ( collada ) {
	count = 0;
	birdSymbol = collada.scene;
	console.log(birdSymbol.children[0]);
	birdSymbol.traverse( function ( child ) {

		if ( child instanceof THREE.Mesh ) {
			if(count == 1){
				reticle.add_collider(child);

				var sound1 = new THREE.Audio( listener );
				sound1.load( 'audio/Bird.mp3' );
				sound1.setRefDistance( .05 );
				sound1.autoplay = true;
				child.add( sound1 );
				child.ongazelong = function(){
					if(currentObj != null && currentObj != planeBirds){
						currentObj.material.opacity = 0;
						currentObj.position.set( 0.7, -0.2, -.4)
						//currentObjOut = currentObj;
											
						move = true;
					}
			
					if(move){
						movePlaneIn(planeBirds);
						move = false;
					}else{
						movePlaneOut(planeBirds);
						move = true;	
					}
				}

				child.ongazeover = function(){
					this.material = new THREE.MeshLambertMaterial({
						color: 0xf1c40f 
					});						
					
				}

				child.ongazeout = function(){
					this.material = new THREE.MeshLambertMaterial({
						color: 0xd8b115 
					});	
					//planeBirds.material.visible = false;		
					// video.pause();
					// video.currentTime = 0;
					}
				}
			count ++;
			} 
			child.traverse( function(e) {
				e.recieveShadow = true;
				e.recieveLights = true;
				e.castShadow = true;
			})
		} );

	birdSymbol.scale.x = birdSymbol.scale.y = birdSymbol.scale.z = 0.03;
	birdSymbol.rotation.y = 2 * -Math.PI / 4;
	birdSymbol.position.set(.7, 0, -.4);
	birdSymbol.updateMatrix();
} );

var shieldSymbol = new THREE.ColladaLoader();
shieldSymbol.options.convertUpAxis = true;
shieldSymbol.load( 'models/RotateSymbols/shield.dae', function ( collada ) {
	count = 0;
	shieldSymbol = collada.scene;

	
	shieldSymbol.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { 
		if(count == 1){
			reticle.add_collider(node);
			node.ongazelong = function(){
				if(currentObj != null && currentObj != planeShield){
					currentObj.material.opacity = 0;
					currentObj.position.set( 0.7, -0.2, -.4)
					//currentObjOut = currentObj;
										
					move = true;
				}
		
				if(move){
					movePlaneIn(planeShield);
					move = false;
				}else{
					movePlaneOut(planeShield);
					move = true;	
				}
				

			}

			node.ongazeover = function(){
				//moveOut = false;
				this.material = new THREE.MeshBasicMaterial({
					color: 0xE84C3D
				});
				//planeShield.material.visible = true;
				//video.play();
				//reticle.show_text_sprite();
			}

			node.ongazeout = function(){
				//hitSymbol = !hitSymbol;
				
				this.material = new THREE.MeshLambertMaterial({
						color: 0x7F2A26
					});
				
				// video.pause();
				// video.currentTime = 0;
				//reticle.hide_text_sprite();
				}
			}
			count ++;

			} 
			} );

	shieldSymbol.scale.x = shieldSymbol.scale.y = shieldSymbol.scale.z = 0.03;
	shieldSymbol.add( planeShieldTest );
	shieldSymbol.rotation.y = 2 * -Math.PI / 4;
	shieldSymbol.position.set(1, .25, .2);
	shieldSymbol.updateMatrix();

	} );

var cloudSymbol = new THREE.ColladaLoader();
cloudSymbol.options.convertUpAxis = true;
cloudSymbol.load( 'models/RotateSymbols/Clouds.dae', function ( collada ) {
	count = 0;
	cloudSymbol = collada.scene;
	

	cloudSymbol.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { 
		if(count == 1){

			reticle.add_collider(node);
			node.ongazelong = function(){
				if(currentObj != null && currentObj != planeClouds){
					currentObj.material.opacity = 0;
					currentObj.position.set( 0.7, -0.2, -.4)
					
										
					move = true;
				}
		
				if(move){
					movePlaneIn(planeClouds);
					move = false;
				}else{
					movePlaneOut(planeClouds);
					move = true;	
				}
			}

			node.ongazeover = function(){
				this.material = new THREE.MeshBasicMaterial({
					color: 0xff983e
				});
				planeClouds.material.visible = true;
				//video.play();
			}

			node.ongazeout = function(){
				this.material = new THREE.MeshLambertMaterial({
					color: 0xe77e23
				});
				
				// video.pause();
				// video.currentTime = 0;
			}
		}
		count ++ 

	} 
} );


	cloudSymbol.scale.x = cloudSymbol.scale.y = cloudSymbol.scale.z = 0.03;

						cloudSymbol.rotation.y = 2 * -Math.PI / 4;

						cloudSymbol.position.set(.55, 0, -1);
						cloudSymbol.updateMatrix();

					} );


var rock = new THREE.ColladaLoader();
rock.options.convertUpAxis = true;
rock.load( 'models/rock.dae', function ( collada ) {
	count = 0;
	rock = collada.scene;
	

	rock.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { 
		 var originalMaterial = this.material;
		 console.log(originalMaterial);
			reticle.add_collider(node);
			node.ongazelong = function(){
				
			}

			node.ongazeover = function(){
				this.material = new THREE.MeshLambertMaterial({
					color: 0xe77e23
				});
				hitSymbol = true;
				objectForMoving = rock;
			}

			node.ongazeout = function(){
				if(!movable){
					hitSymbol = false;
				}
				this.material = new THREE.MeshLambertMaterial({
					color: 0x606060 
				});
			}
		}});


	rock.scale.x = rock.scale.y = rock.scale.z = 0.01;
	rock.position.set(.7, -.25, .6);
	rock.updateMatrix();
	
	});

var rock_2 = new THREE.ColladaLoader();
rock_2.options.convertUpAxis = true;
rock_2.load( 'models/rock.dae', function ( collada ) {
	count = 0;
	rock_2 = collada.scene;
	

	rock_2.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { 
		 var originalMaterial = this.material;
		 console.log(originalMaterial);
			reticle.add_collider(node);
			node.ongazelong = function(){
				
			}

			node.ongazeover = function(){
				this.material = new THREE.MeshLambertMaterial({
					color: 0xe77e23
				});
				hitSymbol = true;
				objectForMoving = rock_2;
			}

			node.ongazeout = function(){
				if(!movable){
					hitSymbol = false;
				}
				this.material = new THREE.MeshLambertMaterial({
					color: 0x606060 
				});
			}
		}});


	rock_2.scale.x = rock.scale.y = rock.scale.z = 0.01;
	rock_2.position.set(1, -.25, 0);
	rock_2.updateMatrix();
	
	});



var birdModel = new THREE.ColladaLoader();
birdModel.options.convertUpAxis = true;
birdModel.load( 'models/bird_test.dae', function ( collada ) {

	birdModel = collada.scene;

	birdModel.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
	//birdModel.scale.x = cloudsModel.scale.y = cloudsModel.scale.z = 0.01;
	birdModel.updateMatrix();

	
	
	} );

setTimeout(init, 3000);

function init() { 		
					scene.fog = new THREE.FogExp2( color, sceneFog, 1 );
					// var light = new THREE.DirectionalLight( 0xffffff, 1 );
					// light.position.set( 0, -10, -10 );
					// light.castShadow = true;
					// light.shadowDarkness = 0.5;
					// light.shadowCameraVisible = true;
					// light.target.position.set( -1, 1, 0);

					// var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee );
					// 	directionalLight.position.x = Math.random() - 0.5;
					// 	directionalLight.position.y = Math.random() - 0.5;
					// 	directionalLight.position.z = Math.random() - 0.5;
					// 	directionalLight.position.normalize();
					// 	directionalLight.shadowCameraVisible = true;

					// 	directionalLight.castShadow = true;
					// 	directionalLight.shadowDarkness = 0.5;
					// 	scene.add( directionalLight );

					// Lights

						// var directionalLight = new THREE.HemisphereLight( 0xffeeee, 0x111122, 0.7 );
						// directionalLight.position.x = -0.5;
						// directionalLight.position.y = 0.5;
						// directionalLight.position.z = -0.5;
						// directionalLight.position.normalize();
						// //directionalLight.castShadow = true;
						// //directionalLight.shadowDarkness = 0.5;
						// scene.add( directionalLight );
						title.lookAt( new THREE.Vector3(0,0,0) );

						var light = new THREE.AmbientLight(0x404040);
						scene.add(light);

						var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
						directionalLight.position.set(-1, 1, 1);
						directionalLight.position.normalize();

						scene.add(directionalLight);

						var dirLight = new THREE.DirectionalLight(0xdfe8ef, 0.03);
						  dirLight.position.set(5, 2, 1);
						  this.scene.add(dirLight);

						var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
						hemisphereLight.position.set(-1, 5, 5.5);
						scene.add(hemisphereLight);

					
					// var info_G = new THREE.CylinderGeometry( radius, radius, height, 60, 1, true );
					// 	info_G.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

					// 	var info_M = new THREE.MeshBasicMaterial( { 
					// 		transparent: true, 
					// 		side: THREE.DoubleSide,
					// 		map: THREE.ImageUtils.loadTexture( 'images/slimWhiteBackground.png' )
					// 	});
					// 	var info = new THREE.Mesh( info_G, info_M );
					// 	scene.add( info );	

					// plane = makePlane(makePlaneGeometry(5, 5, 20, 20));
					// baseHeight = plane.geometry.vertices;
					// plane.recieveLights;
					// plane.position.set(0, -.5, 0);
					// scene.add(plane);
					reticle.add_collider(planeClose);
					planeClose.ongazelong = function(){
							if(currentObj != null){
							movePlaneOut(currentObj);
							}
							move = true;
					}
					planeClose.ongazeover = function(){		
					}
					planeClose.ongazeout = function(){
					}

					

					reticle.add_collider(trusted);
					trusted.ongazelong = function(){
							if(currentObj == planeClouds){
							fogChange = false;
						}
					}
					trusted.ongazeover = function(){
							alpha = 0;		
					}
					trusted.ongazeout = function(){
					}

					reticle.add_collider(untrusted);
					untrusted.ongazelong = function(){
						if(currentObj == planeClouds){
							fogChange = true;
						}
					}
					untrusted.ongazeover = function(){		
							alpha = 0;
					}
					untrusted.ongazeout = function(){
					}


					bird_1 = birdModel.clone();

					bird_1.position.set(0, 0, .2);
					scene.add(bird_1);
					bird_1.parent = birdControl;

					bird_2 = birdModel.clone();
					bird_2.position.set(.2, 0, .1);
					bird_2.rotation.y = 2 * Math.PI / 8;
					scene.add(bird_2);
					bird_2.parent = birdControl;

					bird_3 = birdModel.clone();
					bird_3.position.set(-.2, 0, -.1);
					bird_3.rotation.y = 2 * -Math.PI / 3;
					scene.add(bird_3);
					bird_3.parent = birdControl;

					birdControl.position.set(1, 2.5, -.5);


					initTitle();
					initWorld();

					scene.add(titleControl);
					scene.add(cloudSymbol);
					scene.add(birdSymbol);
					scene.add(shieldSymbol);		
					scene.add(rock);
					scene.add(rock_2);
					scene.add(enviroment);
					scene.add(birdControl);
					//scene.add(cloudsModel);
					//scene.add(title);
					//scene.add(loader);
					
					// renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
					// renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
					animate();
						

					}

					function initSymbols() {

						planeClouds = makePlane( makePlaneGeometry(0.7, .15, 1, 1 ), 0xffffff , 'images/atmosphere.png' ); //0xff983e
						planeClouds.position.set(.7, -.2, -.4);
						scene.add(planeClouds);

						planeBirds = makePlane( makePlaneGeometry(0.7, .15, 1, 1 ), 0xffffff, 'images/trackers.png' ); //0xf0d97a
						planeBirds.position.set(.7, -.2, -.4);
						scene.add(planeBirds);

						planeShield = makePlane( makePlaneGeometry(0.7, .35, 1, 1 ), 0xffffff , 'images/possible layout.png' ); //0xE84C3D
						planeShield.position.set(.7, -.2, -.4);
						scene.add(planeShield);

						planeClose = makePlane( makePlaneGeometry(0.15, .075, 1, 1 ), 0xffffff, 'images/exit.png' );
						planeClose.position.set(.7, .7, -.41);
						planeClose.material.opacity = 0;					
						scene.add(planeClose);

						title = makePlane( makePlaneGeometry(0.5, .25, 1, 1 ), 0xffffff, 'images/title.png' );
						title.material.opacity = 1;
						title.position.set(-.205, 0, -.59);			
						scene.add(title);

						// facebook = makePlane( makePlaneGeometry(0.05, 0.05, 1, 1 ), 0xffffff, 'images/facebook.png' );
						// //facebook.material.opacity = 1;
						// facebook.position.set(0, 0, 0);
						// facebook.updateMatrix();
						// //scene.add(facebook);					
						// //facebook.parent = websites;

						// twitter = makePlane( makePlaneGeometry(0.05, 0.05, 1, 1 ), 0xffffff, 'images/twitter.png' );
						// //twitter.material.opacity = 1;
						// twitter.updateMatrix();	
						// scene.add(twitter);				
						// twitter.parent = websites;

						// tumblr = makePlane( makePlaneGeometry(0.05, 0.05, 1, 1 ), 0xffffff, 'images/tumblr.png' );
						// //tumblr.material.opacity = 1;
						// tumblr.position.set(.1, 0, 0);
						// tumblr.updateMatrix();		
						// scene.add(tumblr);			
						// tumblr.parent = websites;

						// websites.position.set(.7, .2, -.41);
						// scene.add(websites);


						trusted = makePlane( makePlaneGeometry(0.15, 0.075, 1, 1 ), 0xffffff, 'images/trusted.png' );
						trusted.position.set(.1, 0, 0);
						trusted.updateMatrix();		
						scene.add(trusted);
						trusted.parent = trust;

						untrusted = makePlane( makePlaneGeometry(0.15, 0.075, 1, 1 ), 0xffffff, 'images/untrusted.png' );
						untrusted.position.set(-.1, 0, 0);
						untrusted.updateMatrix();		
						scene.add(untrusted);
						untrusted.parent = trust;

						trust.position.set(.65, .2, -.41);
						scene.add(trust);
					}

					function Plane(){
						var plane_M = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, opacity: 0.6} );
						var plane_G = new THREE.PlaneGeometry(Math.PI / 16, 0.1, 1);
						plane_BG = new THREE.Mesh(plane_G, plane_M);
						plane_BG.scale.set(1.2, 1.2, 1.2);
						plane_BG.position.set(0,0,-0.51);
					}

					function initTitle(){

						video = document.createElement( 'video' );
						// video.id = 'video';
						// video.type = ' video/ogg; codecs="theora, vorbis" ';
						video.src = "videos/Add_3.mp4";
						video.loop = "true";
						video.load(); // must call after setting/changing source
						video.play();

						videoImage = document.createElement( 'canvas' );
						videoImage.width = 500;
						videoImage.height = 700;

						videoImageContext = videoImage.getContext( '2d' );
						// background color if no video present
						videoImageContext.fillStyle = '#000000';
						videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

						videoTexture = new THREE.Texture( videoImage );
						videoTexture.minFilter = THREE.LinearFilter;
						videoTexture.magFilter = THREE.LinearFilter;

						var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, side:THREE.DoubleSide } );
						// the geometry on which the movie will be displayed;
						// 		movie image will be scaled to fit these dimensions.

						var planePhone_G = new THREE.PlaneGeometry(.25, .5, 1);
						

						planePhone = new THREE.Mesh(planePhone_G, movieMaterial);
						planePhone.lookAt(camera.position);
						planePhone.position.z = .4;
						planePhone.position.x = 1;
						planePhone.position.y = -.1;
						planePhone.updateMatrix();
						titleControl.add(planePhone);

						var planePhone_G_2 = new THREE.PlaneGeometry(.25, .25, 1);
						planePhone_2 = new THREE.Mesh(planePhone_G_2, movieMaterial);
						planePhone_2.lookAt(camera.position);
						planePhone_2.position.z = .1;
						planePhone_2.position.x = 1;
						planePhone_2.position.y = -.2;
						titleControl.add(planePhone_2);

					}

					function initWorld(){
						var worldImg_G = new THREE.SphereGeometry( 1000, 64, 32 );
						worldImg_G.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

						var worldImg_M = new THREE.MeshBasicMaterial( {
							color: 0x3598db
						} );

						var worldImg = new THREE.Mesh( worldImg_G, worldImg_M );
						scene.add( worldImg );
					}

					function fogChangeMethod() {
						if(fogChange){
							if(fogCount < 1){
							scene.fog.density = fogCount;
							fogCount += .005;
							}

							fogColor.lerp(color2, alpha);
							scene.fog.color.set(fogColor);

							if(alpha < 1){
								alpha += 0.001;
							}
							
						}else{
							if(fogCount > sceneFog){
							scene.fog.density = fogCount;
							fogCount -= .005;
							}	
							fogColor.lerp(color, alpha);
							//console.log();
							scene.fog.color.set(fogColor);
							if(alpha < 1){
								alpha += 0.001;
							}
							

						}
					}

					function animate() {
						// cloudsModel.traverse( function( node ) { if ( node instanceof THREE.Mesh )
						//  { 
						//  	node.position.x += Math.random() / 1.5 * randSign(); 
						//  	node.position.y += Math.random() /1.5 * randSign(); 
						//  	node.position.z +=Math.random() / 1.5 * randSign();
						//  } 
						// });
						// cloudsModel.rotation.y += 0.0001;
						//  for (var vertIndex = 0; vertIndex < plane.geometry.vertices.length; vertIndex++) {
						// // 	//console.log(Math.sin(x * speed + baseHeight[vertIndex].x * waveLength + baseHeight[vertIndex].y * waveLength) * waveHeight);
						//  	plane.geometry.vertices[vertIndex].z +=  Math.sin(x * speed +  baseHeight[vertIndex].x * waveLength +  baseHeight[vertIndex].z * waveLength) * waveHeight;
						//   	plane.geometry.vertices[vertIndex].z += Math.sin(Math.cos(Math.random() * 1) * randomHeight * Math.cos (x * randomSpeed * Math.sin(Math.random() * 1)));
						// // 	//plane.geometry.vertices[vertIndex].z += Math.random() / Z_OFFSET_DAMPEN * randSign();
						//  }
						//  x++
						//  plane.geometry.verticesNeedUpdate = true;

						birdControl.rotation.y -= 0.001;

						if(opac < 0){
							opac = 0;
							//currentObj.visible = false;
							//planeClose.visible = false;
							//console.log("visibility " + planeClose.visible);
						}else if(opac > .7){
							opac = .7;
						}

						if(move && currentObj != null){
							
								
								trusted.material.opacity = 0;
								untrusted.material.opacity = 0;
							
							
							currentObj.material.opacity = opac;
							planeClose.material.opacity = opac;
							opac -= 0.05;

							//boxMesh.material.visible = false;
						}else if(currentObj != null){
							//currentObj.visible = true;


							if(currentObj == planeClouds){
								trusted.material.opacity = 1;
								untrusted.material.opacity = 1;
							}else{
								trusted.material.opacity = 0;
								untrusted.material.opacity = 0;
							}
							
							
							currentObj.material.opacity = opac;
							planeClose.material.opacity = opac;
							opac += 0.05;
						}

						update();
						THREE.AnimationHandler.update( clock.getDelta() );
						render();
					}

					function update(){
						scene.updateMatrixWorld();
						TWEEN.update();
						controls.update();

						moveObj(objectForMoving);
						fogChangeMethod();
						//console.log(camera.rotation.y);
						var arrayLength = symbols.length;

						planePhone.lookAt(camera.position);
						planePhone_2.lookAt(camera.position);

						trust.lookAt(camera.position);

						shieldSymbol.lookAt(camera.position);
						birdSymbol.lookAt(camera.position);
						cloudSymbol.lookAt(camera.position);
						planeClose.lookAt(camera.position);
						
						planeClouds.lookAt(camera.position);
						planeBirds.lookAt(camera.position);
						planeShield.lookAt(camera.position);						
						manager.render(scene, camera);
					//reticle_loop
					reticle.reticle_loop();

				}

				function render() {

					if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
					{
						videoImageContext.drawImage( video, 0, 0 );
						if ( videoTexture ) 
							videoTexture.needsUpdate = true;
					}
					effect.render( scene, camera );
					requestAnimationFrame( animate );

				}

				// function onDocumentMouseDown( event ) {
				// 	event.preventDefault();
				// 	movable = true;
				// }

				// function onDocumentMouseUp( event ) {
				// 	event.preventDefault();
				// 	movable = false
				// }

				function moveObj(objectToMove){
					

					if(movable && hitSymbol){
						 if (attached) {
        					console.log ("already attached");
   						 } else {
						console.log(objectToMove.position.x + " " + objectToMove.position.y + " " + objectToMove.position.z  );
						THREE.SceneUtils.attach(objectToMove, scene, camera);
						attached = true;
						}
					}else{
						if ( ! attached) {
        					console.log ("not attached");
   						 } else {
						THREE.SceneUtils.detach(objectToMove, camera, scene);
						// if(objectToMove.position.x > 1.5){
						// 	objectToMove.position.x = 1.5;
						// }
						// if(objectToMove.position.x < 0){
						// 	objectToMove.position.x = 0;
						// }
						// if(objectToMove.position.y > 0){
						// 	objectToMove.position.y = 0;
						// }
						if(objectToMove.position.y < -.3){
							objectToMove.position.y = -.3;
						}
						// if(objectToMove.position.z > -1.2){
						// 	objectToMove.position.z = -1.2;
						// }
						// if(objectToMove.position.z < -1.5){
						// 	objectToMove.position.z = -1.5;
						// }
						console.log ("should be detaching");
						attached = false;
						objectForMoving = null
						// objectToMove.position = new THREE.Vector3(1, 0, 1);
					 //    console.log ( camera.position.clone().setFromMatrixPosition( objectToMove.matrixWorld ) );
					 //    objectToMove.updateMatrix();
					 //    scene.add(objectToMove);
						console.log(objectToMove.position.x + " " + objectToMove.position.y + " " + objectToMove.position.z  );
						}
					}

				}
				

				/*
				Listen for double click event to enter full-screen VR mode
				*/
				document.body.addEventListener( 'dblclick', function() {
					effect.setFullScreen( true );
				});

				/*
				Listen for keyboard events to zero positional sensor or enter full-screen VR mode.
				*/
				function onkey(event) {

					if (!(event.metaKey || event.altKey || event.ctrlKey)) {
						event.preventDefault();
					}

			    if (event.charCode == 'z'.charCodeAt(0)) { // z
			    	controls.zeroSensor();
			    } else if (event.charCode == 'f'.charCodeAt(0)) { // f
			    	effect.setFullScreen( true );
			    }  else if (event.charCode == 'm'.charCodeAt(0)) { // f
			    	movable = !movable;
			    	if(!movable){
			    		hitSymbol = false;
			    	}
			    	console.log("movable is " + movable);
			    }
			};

			window.addEventListener("keypress", onkey, true);

				/*
				Handle window resizes
				*/
				function onWindowResize() {
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();

					effect.setSize( window.innerWidth, window.innerHeight );
				}

				window.addEventListener( 'resize', onWindowResize, false );