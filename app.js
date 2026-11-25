const $ = id => document.getElementById(id);
const history = JSON.parse(localStorage.getItem('musicgpt-history') || '[]');

function renderHistory(){
  const el = $('history');
  if(!history.length){
    el.innerHTML = '<div class="empty">Your generated songs will appear here.</div>';
    return;
  }
  el.innerHTML = history.map((t,i)=>`
    <div class="track">
      <div class="cover">♪</div>
      <div class="track-info"><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.genre)} · ${escapeHtml(t.mood)} · ${t.duration}s</small></div>
      <audio controls preload="none" src="${escapeAttr(t.audioUrl)}"></audio>
      <a class="download" href="${escapeAttr(t.audioUrl)}" download>Download</a>
    </div>`).join('');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,'&#96;');}

$('generate').addEventListener('click', async()=>{
  const prompt=$('prompt').value.trim();
  if(prompt.length<3){ $('status').textContent='Describe the song you want first.'; return; }
  const btn=$('generate'); btn.disabled=true; btn.textContent='Creating your song…';
  $('status').textContent='Generating music. Please wait…';
  try{
    const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      prompt,genre:$('genre').value,mood:$('mood').value,duration:Number($('duration').value),vocals:$('vocals').value
    })});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||'Generation failed');
    history.unshift({title:data.title,audioUrl:data.audioUrl,genre:$('genre').value,mood:$('mood').value,duration:data.duration});
    localStorage.setItem('musicgpt-history',JSON.stringify(history.slice(0,20)));
    renderHistory();
    $('status').textContent=data.demo ? 'Demo song ready. Connect your AI music provider for real generation.' : 'Your song is ready.';
  }catch(e){$('status').textContent=e.message}
  finally{btn.disabled=false;btn.innerHTML='<span>✦</span> Generate music'}
});
renderHistory();
