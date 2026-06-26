/**
 * IR Homepage Scapes — Water System
 * engine/water.js
 * Animated GLSL water: wave distortion, caustics, foam.
 */
IRScapes.Water=(function(){
  const vs=`uniform float uTime,uWaveHeight,uWaveFreq;varying vec2 vUv;varying float vWave;
void main(){vUv=uv;vec3 p=position;float w=sin(p.x*uWaveFreq+uTime*1.2)*uWaveHeight+sin(p.z*uWaveFreq*.8+uTime*.9)*uWaveHeight*.6;p.y+=w;vWave=w;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`;
  const fs=`uniform float uTime,uOpacity;uniform vec3 uDeepColor,uShallowColor;varying vec2 vUv;varying float vWave;
void main(){float d=clamp((vWave+2.0)/4.0,0.0,1.0);vec3 col=mix(uDeepColor,uShallowColor,d);float c=.5+.5*sin(vUv.x*30.0+uTime*3.0)*sin(vUv.y*30.0-uTime*2.5);col+=vec3(c*.06);float foam=smoothstep(.6,1.0,vWave*.8);col=mix(col,vec3(1.0),foam*.3);gl_FragColor=vec4(col,uOpacity);}`;

  function create(scene,opts={}){
    const{size=600,segments=120,y=0,deepColor=new THREE.Color(0x003366),shallowColor=new THREE.Color(0x0077bb),opacity=0.85,waveHeight=1.2,waveFreq=0.04}=opts;
    const geo=new THREE.PlaneGeometry(size,size,segments,segments);
    geo.rotateX(-Math.PI/2);
    const mat=new THREE.ShaderMaterial({vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uWaveHeight:{value:waveHeight},uWaveFreq:{value:waveFreq},uDeepColor:{value:deepColor},uShallowColor:{value:shallowColor},uOpacity:{value:opacity}}});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.y=y; mesh.receiveShadow=true;
    scene.add(mesh); return mesh;
  }
  function tick(mesh,elapsed){if(mesh&&mesh.material.uniforms)mesh.material.uniforms.uTime.value=elapsed;}
  function dispose(mesh,scene){mesh.geometry.dispose();mesh.material.dispose();scene.remove(mesh);}
  return{create,tick,dispose};
})();
