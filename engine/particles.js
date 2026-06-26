/**
 * IR Homepage Scapes — Particle System
 * engine/particles.js
 * Presets: snow, rain, petals, bioluminescence, fireflies, embers, mist
 */
IRScapes.Particles = (function () {
  const PRESETS = {
    snow:{count:3000,color:0xffffff,size:1.2,spread:[400,200,400],fallSpeed:[8,15],drift:3,opacity:0.85,additive:false},
    rain:{count:5000,color:0x88aacc,size:0.4,spread:[300,120,300],fallSpeed:[60,90],drift:0.5,opacity:0.4,additive:false},
    petals:{count:400,color:0xffb7c5,size:2.5,spread:[200,80,200],fallSpeed:[3,7],drift:8,opacity:0.8,additive:false},
    bioluminescence:{count:800,color:0x00ffaa,size:3,spread:[200,80,200],fallSpeed:[-2,2],drift:5,opacity:0.6,additive:true},
    fireflies:{count:200,color:0xffff44,size:2,spread:[150,50,150],fallSpeed:[-1,1],drift:6,opacity:0.7,additive:true},
    embers:{count:300,color:0xff6600,size:1.5,spread:[80,60,80],fallSpeed:[-12,-4],drift:10,opacity:0.8,additive:true},
    mist:{count:200,color:0xaabbcc,size:18,spread:[300,30,300],fallSpeed:[0.5,2],drift:4,opacity:0.06,additive:false}
  };
  function create(scene,presetName,overrides={}){
    const cfg=Object.assign({},PRESETS[presetName]||PRESETS.snow,overrides);
    const geo=new THREE.BufferGeometry();
    const positions=new Float32Array(cfg.count*3);
    const velocities=[];
    for(let i=0;i<cfg.count;i++){
      positions[i*3]=(Math.random()-.5)*cfg.spread[0];
      positions[i*3+1]=Math.random()*cfg.spread[1];
      positions[i*3+2]=(Math.random()-.5)*cfg.spread[2];
      velocities.push({x:(Math.random()-.5)*cfg.drift,y:-(cfg.fallSpeed[0]+Math.random()*(cfg.fallSpeed[1]-cfg.fallSpeed[0])),z:(Math.random()-.5)*cfg.drift,phase:Math.random()*Math.PI*2});
    }
    geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    const mat=new THREE.PointsMaterial({color:cfg.color,size:cfg.size,transparent:true,opacity:cfg.opacity,depthWrite:false,blending:cfg.additive?THREE.AdditiveBlending:THREE.NormalBlending,sizeAttenuation:true});
    const points=new THREE.Points(geo,mat);
    points.userData={velocities,cfg};
    scene.add(points);
    return points;
  }
  function tick(systems,delta,elapsed){
    systems.forEach(sys=>{
      const pos=sys.geometry.attributes.position.array;
      const{velocities,cfg}=sys.userData;
      for(let i=0;i<cfg.count;i++){
        const v=velocities[i];
        pos[i*3]+=v.x*delta+Math.sin(elapsed*.5+v.phase)*.3*delta;
        pos[i*3+1]+=v.y*delta;
        pos[i*3+2]+=v.z*delta+Math.cos(elapsed*.4+v.phase)*.3*delta;
        if(v.y<0&&pos[i*3+1]<-5){pos[i*3]=(Math.random()-.5)*cfg.spread[0];pos[i*3+1]=cfg.spread[1];pos[i*3+2]=(Math.random()-.5)*cfg.spread[2];}
        if(v.y>0&&pos[i*3+1]>cfg.spread[1]+20)pos[i*3+1]=0;
      }
      sys.geometry.attributes.position.needsUpdate=true;
    });
  }
  function dispose(systems,scene){systems.forEach(s=>{s.geometry.dispose();s.material.dispose();scene.remove(s);});}
  return{create,tick,dispose};
})();
