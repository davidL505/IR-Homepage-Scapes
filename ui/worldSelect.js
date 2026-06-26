/**
 * IR Homepage Scapes — World Select UI
 * ui/worldSelect.js
 * Registers all 12 worlds and renders the selection grid.
 */
IRScapes.WorldSelect=(function(){
  const WORLDS=[
    {id:'arctic-tundra',name:'Arctic Tundra',desc:'Frozen plains, blizzard & polar wildlife',emoji:'🧊',color1:'#0a1628',color2:'#1a3a5c',module:'ArcticTundra'},
    {id:'northern-lights',name:'Northern Lights',desc:'Aurora borealis sanctuary & starfield sky',emoji:'🌌',color1:'#020814',color2:'#0d2d1a',module:'NorthernLights'},
    {id:'japanese-forest',name:'Japanese Forest',desc:'Cherry blossoms, bamboo & misty mountains',emoji:'🌸',color1:'#1a0a14',color2:'#3d1a2a',module:'JapaneseForest'},
    {id:'amazon-rainforest',name:'Amazon Rainforest',desc:'Dense canopy, rivers & tropical life',emoji:'🌴',color1:'#041a04',color2:'#0d3d0d',module:'AmazonRainforest'},
    {id:'atlantic-ocean',name:'Atlantic Ocean',desc:'Deep underwater: coral, whales & bioluminescence',emoji:'🐋',color1:'#020a14',color2:'#041428',module:'AtlanticOcean'},
    {id:'african-savanna',name:'African Savanna',desc:'Golden plains, acacia & African wildlife at sunset',emoji:'🦁',color1:'#1e0e04',color2:'#3d2408',module:'AfricanSavanna'},
    {id:'ancient-rome',name:'Ancient Rome',desc:'Colosseum ruins, golden hour & cobblestone',emoji:'🏛️',color1:'#1e1408',color2:'#3d2c10',module:'AncientRome'},
    {id:'futuristic-tokyo',name:'Futuristic Tokyo',desc:'Neon cyberpunk, rain-soaked streets & holographic signs',emoji:'🌆',color1:'#0a0418',color2:'#200a3d',module:'FuturisticTokyo'},
    {id:'himalayan-peaks',name:'Himalayan Peaks',desc:'Snow summits, prayer flags & eagle-eye views',emoji:'🏔️',color1:'#080c14',color2:'#1a2040',module:'HimalayanPeaks'},
    {id:'sahara-night',name:'Sahara Night',desc:'Infinite dunes under a galaxy of stars',emoji:'🌙',color1:'#0c0808',color2:'#1e1004',module:'SaharaNight'},
    {id:'nordic-fjords',name:'Nordic Fjords',desc:'Towering cliffs, crystal water & midnight sun',emoji:'⛰️',color1:'#080e14',color2:'#0a1e2d',module:'NordicFjords'},
    {id:'deep-space',name:'Deep Space Observatory',desc:'Floating among nebulae, planets & cosmic phenomena',emoji:'🪐',color1:'#020206',color2:'#060214',module:'DeepSpace'}
  ];

  function init(){
    const grid=document.getElementById('worldGrid');
    if(!grid)return;
    grid.innerHTML='';
    WORLDS.forEach(world=>{
      const card=document.createElement('div');
      card.className='world-card';
      card.style.setProperty('--color1',world.color1);
      card.style.setProperty('--color2',world.color2);
      card.innerHTML=`<div class="world-card-preview">${world.emoji}</div><div class="world-card-info"><div class="world-card-name">${world.name}</div><div class="world-card-desc">${world.desc}</div></div>`;
      card.addEventListener('click',()=>launchWorld(world));
      grid.appendChild(card);
    });
  }

  function launchWorld(world){
    const module=window[world.module];
    if(!module){console.error('[IR Scapes] World module not found:',world.module);return;}
    IRScapes.loadWorld(module);
  }

  function getWorlds(){return WORLDS;}
  return{init,getWorlds};
})();
