/**
 * IR Homepage Scapes — Terrain Generator
  * engine/terrain.js
   *
    * Procedural heightmap terrain using layered sine/noise.
     * Re-codeable: adjust size, segments, height scale, and color per world.
      */

      IRScapes.Terrain = (function () {

        // Simple pseudo-random noise
          function smoothNoise(x, z, scale, seed) {
              const s = seed || 0;
                  return (Math.sin(x * scale + s) * Math.cos(z * scale * 0.8 + s * 1.3) * 0.5 + 0.5)
                           + (Math.sin(x * scale * 2.1 + s * 0.7) * Math.cos(z * scale * 1.9 + s) * 0.25);
                             }

                               function fbm(x, z, octaves, scale, seed) {
                                   let val = 0, amp = 1, freq = scale, max = 0;
                                       for (let i = 0; i < octaves; i++) {
                                             val += smoothNoise(x, z, freq, seed + i * 7.3) * amp;
                                                   max += amp;
                                                         amp *= 0.5;
                                                               freq *= 2.1;
                                                                   }
                                                                       return val / max;
                                                                         }

                                                                           /**
                                                                              * Generate a terrain mesh.
                                                                                 * @param {object} opts
                                                                                    *   size      - world units (default 2000)
                                                                                       *   segments  - mesh resolution (default 200)
                                                                                          *   maxHeight - peak height (default 120)
                                                                                             *   minHeight - valley depth (default 0)
                                                                                                *   octaves   - fbm octaves (default 6)
                                                                                                   *   scale     - base noise scale (default 0.003)
                                                                                                      *   seed      - random seed (default 0)
                                                                                                         *   colorHigh - THREE.Color for peaks
                                                                                                            *   colorLow  - THREE.Color for valleys
                                                                                                               *   receiveShadow - bool (default true)
                                                                                                                  */
                                                                                                                    function generate(opts = {}) {
                                                                                                                        const {
                                                                                                                              size = 2000,
                                                                                                                                    segments = 200,
                                                                                                                                          maxHeight = 120,
                                                                                                                                                minHeight = 0,
                                                                                                                                                      octaves = 6,
                                                                                                                                                            scale = 0.003,
                                                                                                                                                                  seed = 0,
                                                                                                                                                                        colorHigh = new THREE.Color(0xffffff),
                                                                                                                                                                              colorLow  = new THREE.Color(0x336633),
                                                                                                                                                                                    receiveShadow = true
                                                                                                                                                                                        } = opts;
                                                                                                                                                                                        
                                                                                                                                                                                            const geo = new THREE.PlaneGeometry(size, size, segments, segments);
                                                                                                                                                                                                geo.rotateX(-Math.PI / 2);
                                                                                                                                                                                                
                                                                                                                                                                                                    const positions = geo.attributes.position.array;
                                                                                                                                                                                                        const colors = new Float32Array(positions.length);
                                                                                                                                                                                                        
                                                                                                                                                                                                            for (let i = 0; i < positions.length; i += 3) {
                                                                                                                                                                                                                  const x = positions[i];
                                                                                                                                                                                                                        const z = positions[i + 2];
                                                                                                                                                                                                                              const h = fbm(x, z, octaves, scale, seed) * (maxHeight - minHeight) + minHeight;
                                                                                                                                                                                                                                    positions[i + 1] = h;
                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                          // Vertex color blend
                                                                                                                                                                                                                                                const t = (h - minHeight) / (maxHeight - minHeight);
                                                                                                                                                                                                                                                      const col = colorLow.clone().lerp(colorHigh, t);
                                                                                                                                                                                                                                                            colors[i] = col.r;
                                                                                                                                                                                                                                                                  colors[i + 1] = col.g;
                                                                                                                                                                                                                                                                        colors[i + 2] = col.b;
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                                                                                                                                                                                                                                                                                    geo.computeVertexNormals();
                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                        const mat = new THREE.MeshStandardMaterial({
                                                                                                                                                                                                                                                                                              vertexColors: true,
                                                                                                                                                                                                                                                                                                    roughness: 0.9,
                                                                                                                                                                                                                                                                                                          metalness: 0.0
                                                                                                                                                                                                                                                                                                              });
                                                                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                                                  const mesh = new THREE.Mesh(geo, mat);
                                                                                                                                                                                                                                                                                                                      mesh.receiveShadow = receiveShadow;
                                                                                                                                                                                                                                                                                                                          mesh.castShadow = false;
                                                                                                                                                                                                                                                                                                                              mesh.userData.isTerrain = true;
                                                                                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                                                                  return mesh;
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                      /**
                                                                                                                                                                                                                                                                                                                                         * Sample terrain height at world position (x, z).
                                                                                                                                                                                                                                                                                                                                            * Uses same fbm — call this to place animals/objects on terrain.
                                                                                                                                                                                                                                                                                                                                               */
                                                                                                                                                                                                                                                                                                                                                 function heightAt(x, z, opts = {}) {
                                                                                                                                                                                                                                                                                                                                                     const { maxHeight = 120, minHeight = 0, octaves = 6, scale = 0.003, seed = 0 } = opts;
                                                                                                                                                                                                                                                                                                                                                         return fbm(x, z, octaves, scale, seed) * (maxHeight - minHeight) + minHeight;
                                                                                                                                                                                                                                                                                                                                                           }
                                                                                                                                                                                                                                                                                                                                                           
                                                                                                                                                                                                                                                                                                                                                             return { generate, heightAt, fbm };
                                                                                                                                                                                                                                                                                                                                                             
                                                                                                                                                                                                                                                                                                                                                             })();
