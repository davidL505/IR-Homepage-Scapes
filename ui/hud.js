/**
 * IR Homepage Scapes — HUD Controller ui/hud.js
 * Re-codeable: add minimap, weather, time-of-day controls here.
 */
IRScapes.HUD=(function(){
  function init(){
    const backBtn=document.getElementById('back-btn');
    if(backBtn)backBtn.onclick=()=>IRScapes.goHome();
    const qBtns=document.querySelectorAll('#quality-toggle button');
    qBtns.forEach((btn,i)=>{
      const levels=['low','medium','high'];
      btn.onclick=()=>{IRScapes.setQuality(levels[i]);qBtns.forEach((b,j)=>b.classList.toggle('active',j===i));};
      btn.classList.toggle('active',i===2);
    });
  }
  function showInteractHint(msg,duration=2500){
    const hint=document.getElementById('interact-hint');
    if(!hint)return;
    hint.textContent=msg;
    hint.classList.remove('hidden');
    clearTimeout(hint._timer);
    hint._timer=setTimeout(()=>hint.classList.add('hidden'),duration);
  }
  function setWorldLabel(name){
    const label=document.getElementById('world-label');
    if(label)label.textContent=name;
  }
  return{init,showInteractHint,setWorldLabel};
})();
window.addEventListener('DOMContentLoaded',()=>IRScapes.HUD.init());
