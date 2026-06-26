/**
 * IR Homepage Scapes — World: Arctic Tundra
 * Snow terrain, frozen lake, blizzard, aurora sky, polar bear & arctic fox.
 */
const ArcticTundra=(function(){
  const TO={size:2000,segments:180,maxHeight:80,minHeight:0,octaves:5,scale:0.004,seed:42,colorHigh:new THREE.Color(0xeef4ff),colorLow:new THREE.Color(0xaabbd4)};
  let terrain,water,aurora,particles,animals;

  function build(scene,renderer,quality){
    IRScapes.Atmosphere.create(scene,{skyTop:0x020814,skyBottom:0x051428,fogColor:0x0a1428,fogNear:300,fogFar:1800,sunColor:0x88aaff,sunIntensity:0.4,sunPosition:new THREE.Vector3(-200,150,-300),ambientColor:0x1a2244,ambientIntensity:0.5,addStars:true,starCount:3000});
    terrain=IRScapes.Terrain.generate(TO); scene.add(terrain);
    water=IRScapes.Water.create(scene,{size:300,segments:60,y:2,deepColor:new THREE.Color(0x88aabb),shallowColor:new THREE.Color(0xccddee),opacity:0.65,waveHeight:0.3,waveFreq:0.03});
    aurora=IRScapes.Aurora.create(scene,{bandCount:quality==='high'?6:3,color1:new THREE.Color(0x00ff88),color2:new THREE.Color(0x00ccff),color3:new THREE.Color(0x9944ff),opacity:0.6,waveAmp:35,waveFreq:0.007});
    particles=[IRScapes.Particles.create(scene,'snow',{count:quality==='high'?4000:1500,spread:[500,200,500],fallSpeed:[10,20]})];
    animals=IRScapes.Animals.spawn(scene,[
      {type:'polar-bear',count:3,color:0xf0f0ee,bodyW:3,bodyH:1.8,bodyL:4.5,headW:2,headH:1.5,headD:1.8,headY:1,headZ:2.5,legH:1.8,walkSpeed:2,interactMsg:'🐻‍❄️ Polar bear watches you curiously'},
      {type:'arctic-fox',count:5,color:0xfafafa,bodyW:0.9,bodyH:0.6,bodyL:1.6,headW:0.7,headH:0.7,headD:0.8,headY:0.4,headZ:0.9,legH:0.7,walkSpeed:5,interactMsg:'🦊 Arctic fox dashes away!'}
    ],TO);
  }

  function tick(delta,elapsed){IRScapes.Aurora.tick(aurora,elapsed);IRScapes.Particles.tick(particles,delta,elapsed);IRScapes.Animals.tick(animals,delta);IRScapes.Water.tick(water,elapsed);}
  function dispose(scene){IRScapes.Aurora.dispose(aurora,scene);IRScapes.Particles.dispose(particles,scene);IRScapes.Animals.dispose(animals,scene);IRScapes.Water.dispose(water,scene);}

  return{name:'Arctic Tundra',cameraConfig:{fov:65,minRadius:20,maxRadius:250},build,tick,dispose};
})();
