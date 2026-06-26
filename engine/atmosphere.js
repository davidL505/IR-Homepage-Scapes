/**
 * IR Homepage Scapes — Atmosphere System
 * engine/atmosphere.js
 * Sky gradients, fog, sun/moon, ambient light, stars.
 * Re-codeable: swap sky color, fog density, sun angle here.
 */

IRScapes.Atmosphere = (function () {
  function create(scene, opts = {}) {
    const {
      skyTop=0x0a0a2e, skyBottom=0x1a1a3e,
      fogColor=0x0a0a2e, fogNear=200, fogFar=1800,
      sunColor=0xffffff, sunIntensity=1.2,
      sunPosition=new THREE.Vector3(200,300,100),
      ambientColor=0x222244, ambientIntensity=0.4,
      addStars=false, starCount=2000
    } = opts;

    // Sky gradient sphere
    const skyGeo = new THREE.SphereGeometry(3000, 32, 16);
    skyGeo.scale(-1,1,1);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: { uTop:{value:new THREE.Color(skyTop)}, uBottom:{value:new THREE.Color(skyBottom)} },
      vertexShader: `varying float vY; void main(){vY=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform vec3 uTop,uBottom;varying float vY;void main(){float t=clamp((vY+2000.0)/4000.0,0.0,1.0);gl_FragColor=vec4(mix(uBottom,uTop,t),1.0);}`,
      side: THREE.FrontSide, depthWrite: false
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.renderOrder = -1;
    scene.add(sky);

    scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

    const sun = new THREE.DirectionalLight(sunColor, sunIntensity);
    sun.position.copy(sunPosition);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.near=1; sun.shadow.camera.far=2000;
    sun.shadow.camera.left=-300; sun.shadow.camera.right=300;
    sun.shadow.camera.top=300; sun.shadow.camera.bottom=-300;
    sun.shadow.bias=-0.0005;
    scene.add(sun);

    const ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambient);

    if (addStars) {
      const starGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(starCount*3);
      for(let i=0;i<starCount*3;i+=3){
        const theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1), r=2500;
        pos[i]=r*Math.sin(phi)*Math.cos(theta); pos[i+1]=Math.abs(r*Math.cos(phi)); pos[i+2]=r*Math.sin(phi)*Math.sin(theta);
      }
      starGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color:0xffffff,size:2.5,sizeAttenuation:true})));
    }
    return { sky, sun, ambient };
  }
  return { create };
})();
