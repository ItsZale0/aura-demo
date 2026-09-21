var WORKER_URL = 'https://aria-proxy.zampese-alessandro.workers.dev';
var I18N = {};
var CUR = 'it';
var LANG_NAMES = {it:'Italiano',en:'English',es:'Español',zh:'中文'};

function setLang(l){
  CUR = l;
  document.documentElement.lang = l;
  document.querySelectorAll('#langSel button').forEach(function(b,i){
    var langs=['it','en','es','zh'];
    b.classList.toggle('active', langs[i]===l);
  });
  document.body.style.fontFamily = l==='zh' ? "'Noto Sans SC','Space Grotesk',sans-serif" : "'Space Grotesk',sans-serif";
  applyI18N();
  buildDynamic();
  try{localStorage.setItem('aria-lang',l)}catch(e){}
}

function applyI18N(){
  var t = I18N[CUR];
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var k = el.getAttribute('data-i18n');
    var v = k.split('.').reduce(function(o,p){return o&&o[p]},t);
    if(v!==undefined) el.textContent=v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){
    var k = el.getAttribute('data-i18n-html');
    var v = k.split('.').reduce(function(o,p){return o&&o[p]},t);
    if(v!==undefined) el.innerHTML=v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    var k = el.getAttribute('data-i18n-ph');
    var v = k.split('.').reduce(function(o,p){return o&&o[p]},t);
    if(v!==undefined) el.placeholder=v;
  });
}

function buildDynamic(){
  var t = I18N[CUR];
  var stats = document.getElementById('stats');
  stats.innerHTML = t.stats.map(function(s){return '<div class="stat"><div class="num">'+s.num+'</div><div class="lbl">'+s.lbl+'</div></div>'}).join('');
  var fg = document.getElementById('featGrid');
  fg.innerHTML = t.features.items.map(function(f){return '<div class="feat"><div class="icn '+['ai','cal','crm','wa','ai','ai'][t.features.items.indexOf(f)]+'">'+f.icn+'</div><h4>'+f.t+'</h4><p>'+f.d+'</p></div>'}).join('');
  var caps = ['📅','📧','💬','⏰','🎯','🔄','📊','🔔','📋','🤖','🎫','⚡'];
  var cg = document.getElementById('capGrid');
  cg.innerHTML = t.capabilities.items.map(function(c,i){return '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg);border-radius:10px;border:1px solid var(--border)"><span style="font-size:1.3em">'+caps[i]+'</span><span style="font-size:.85em">'+c+'</span></div>'}).join('');
  var tabs = document.getElementById('demo');
  tabs.innerHTML = t.tabs.map(function(tb,i){return '<div class="tab'+(i===0?' active':'')+'" onclick="selectDemo('+i+')">'+tb+'</div>'}).join('');
  buildDemos();
}

var timers=[];
function clr(){timers.forEach(clearTimeout);timers=[]}
function sch(fn,ms){timers.push(setTimeout(fn,ms))}
function selectDemo(n){document.querySelectorAll('.tab').forEach(function(tb,i){tb.classList.toggle('active',i===n)});document.querySelectorAll('.demo-view').forEach(function(v,i){v.classList.toggle('active',i===n)})}

function buildDemos(){
  var t = I18N[CUR];
  var views = document.getElementById('demoViews');
  views.innerHTML='';
  var icnMap={cal:'📅',wa:'📱',crm:'🎯'};
  var titleMap={cal:t.demoUI.calendar,wa:t.demoUI.whatsapp,crm:t.demoUI.crm};
  t.demos.forEach(function(d,n){
    var v=document.createElement('div');
    v.className='demo-view'+(n===0?' active':'');
    var vis='';
    if(d.visual==='cal'){
      vis='<div class="cal-vis"><div class="cal-top"><span class="cal-title">2026</span><div class="cal-nav"><button>‹</button><button>Today</button><button>›</button></div></div><div class="cal-grid"><div class="hdr">L</div><div class="hdr">M</div><div class="hdr">M</div><div class="hdr">G</div><div class="hdr">V</div><div class="hdr">S</div><div class="hdr">D</div>';
      for(var i=1;i<=35;i++){vis+='<div class="day'+(i===20?' today':'')+'" id="cal-day-'+(i-2)+'">'+((i>2&&i<=32)?i-2:'')+'</div>'}
      vis+='</div><div class="cal-ev" id="cal-ev"><div class="ev-time" id="cal-ht"></div><div class="ev-name" id="cal-hn"></div><div class="ev-det" id="cal-hc"></div></div></div>';
    } else if(d.visual==='wa'){
      vis='<div class="wa-vis" id="wa-box"></div>';
    } else {
      vis='<div class="crm-vis"><div class="crm-top">🎯 CRM</div><div class="crm-body"><div class="crm-lead" id="crm-card"><div class="av" id="crm-av">J</div><div class="info"><div class="n" id="crm-cn"></div><div class="m" id="crm-cc"></div></div><span class="badge hot" id="crm-cb">HOT</span></div><div class="crm-row"><span class="k">Budget</span><span class="v" id="crm-bdg"></span></div><div class="crm-row"><span class="k">Urgency</span><span class="v" id="crm-urg"></span></div><div class="crm-row"><span class="k">Need</span><span class="v" id="crm-need"></span></div></div></div>';
    }
    v.innerHTML='<div class="dash"><div class="phone"><div class="phone-head"><div class="icn">🤖</div><h4>'+d.phone.name+'</h4><span class="tag">'+d.phone.tag+'</span></div><div class="phone-chat" id="s'+n+'-chat"></div></div><div class="visual"><div class="visual-head"><div class="icn '+d.visual+'">'+icnMap[d.visual]+'</div><h4>'+titleMap[d.visual]+'</h4></div><div class="visual-body">'+vis+'</div></div></div><div class="timeline" id="s'+n+'-tl"></div><div class="prog"><div class="fill" id="s'+n+'-prog"></div></div><div class="controls"><button class="prim" id="s'+n+'-btn" onclick="startDemo('+n+')">'+t.demoUI.start+'</button><button class="sec" onclick="resetDemo('+n+')">'+t.demoUI.reset+'</button></div>';
    views.appendChild(v);
  });
}

function startDemo(n){
  clr();
  var t=I18N[CUR];
  var d=t.demos[n];
  var btn=document.getElementById('s'+n+'-btn');
  btn.textContent=t.demoUI.running;btn.disabled=true;
  document.getElementById('s'+n+'-chat').innerHTML='';
  document.getElementById('s'+n+'-tl').innerHTML='';
  document.getElementById('s'+n+'-prog').style.width='0%';
  if(d.visual==='cal'){document.getElementById('cal-ev').classList.remove('show');document.querySelectorAll('.cal-grid .day').forEach(function(el){el.classList.remove('has-ev','flash')})}
  else if(d.visual==='wa'){document.getElementById('wa-box').innerHTML=''}
  else{document.getElementById('crm-card').classList.remove('show')}
  d.steps.forEach(function(s,i){
    var div=document.createElement('div');
    div.className='tl-step';div.id='s'+n+'-step'+i;
    var h='<div class="tl-head"><div class="tl-num">'+(i+1)+'</div><div class="tl-title">'+s.title+'</div><div class="tl-time">'+s.t+'</div></div><div class="tl-body">'+s.body+'</div>';
    if(s.action){h+='<div class="tl-actions"><div class="tl-action"><div class="ic '+s.action.ic+'">'+({cal:'📅',wa:'📱',crm:'🎯'}[s.action.ic])+'</div><div><div style="font-weight:600">'+s.action.t+'</div><div style="color:var(--muted)">'+s.action.s+'</div></div></div></div>'}
    div.innerHTML=h;
    document.getElementById('s'+n+'-tl').appendChild(div);
  });
  d.steps.forEach(function(s,i){
    sch(function(){var el=document.getElementById('s'+n+'-step'+i);if(el)el.classList.add('visible');document.getElementById('s'+n+'-prog').style.width=((i+1)/d.steps.length)*100+'%'},s.delay);
    if(s.say)sch(function(){var c=document.getElementById('s'+n+'-chat');c.innerHTML+='<div class="msg bot"><div class="lbl">'+t.demoUI.aria+'</div>'+s.say+'</div>';c.scrollTop=999},s.delay+300);
    if(s.user)sch(function(){var c=document.getElementById('s'+n+'-chat');c.innerHTML+='<div class="msg user"><div class="lbl">'+t.demoUI.customer+'</div>'+s.user+'</div>';c.scrollTop=999},s.delay+300);
    if(s.think)sch(function(){var c=document.getElementById('s'+n+'-chat');c.innerHTML+='<div class="think"><span></span><span></span><span></span></div>';c.scrollTop=999},s.delay+200);
    if(s.cal)sch(function(){document.getElementById('cal-ht').textContent=s.h;document.getElementById('cal-hn').textContent=s.n;document.getElementById('cal-hc').textContent=s.company;document.getElementById('cal-ev').classList.add('show');var de=document.getElementById('cal-day-19');if(de){de.classList.add('has-ev','flash');setTimeout(function(){de.classList.remove('flash')},800)}},s.delay+400);
    if(s.wa)sch(function(){var b=document.getElementById('wa-box');b.innerHTML+='<div class="wa-msg sent">'+s.msg+'<div class="time">10:0'+Math.floor(Math.random()*9)+' ✓✓</div></div>';b.scrollTop=999},s.delay+300);
    if(s.crm)sch(function(){document.getElementById('crm-av').textContent=s.nm.charAt(0);document.getElementById('crm-cn').textContent=s.nm;document.getElementById('crm-cc').textContent=s.comp;document.getElementById('crm-bdg').textContent=s.bdg;document.getElementById('crm-urg').textContent=s.urg;document.getElementById('crm-need').textContent=s.need;document.getElementById('crm-card').classList.add('show')},s.delay+400);
  });
  var last=d.steps[d.steps.length-1].delay;
  sch(function(){document.getElementById('s'+n+'-btn').textContent=t.demoUI.replay;document.getElementById('s'+n+'-btn').disabled=false},last+3000);
}

function resetDemo(n){
  clr();var t=I18N[CUR];
  document.getElementById('s'+n+'-chat').innerHTML='';
  document.getElementById('s'+n+'-tl').innerHTML='';
  document.getElementById('s'+n+'-prog').style.width='0%';
  document.getElementById('s'+n+'-btn').textContent=t.demoUI.start;
  document.getElementById('s'+n+'-btn').disabled=false;
}

function parseAIJSON(raw){
  // --- Robust AI JSON parser: never throws on null/weird input ---
  if(raw===null||raw===undefined) throw new Error('AI returned empty response');
  var str = typeof raw==='string' ? raw : (raw && raw.toString ? raw.toString() : '');
  if(!str.trim()) throw new Error('AI returned empty response');

  // 1. Strip markdown fences and BOM
  str = str.replace(/^\uFEFF/, '').replace(/```(?:json|JSON)?\s*/g, '').replace(/```/g, '');
  // 2. Extract outermost {...} block
  var start = str.indexOf('{'), end = str.lastIndexOf('}');
  if(start === -1 || end === -1 || end <= start) throw new Error('No JSON object found in AI response');
  str = str.substring(start, end + 1);

  // 3. Try direct parse first
  try { return JSON.parse(str); } catch(e) {}

  // 4. Iterative repair (up to 25 cycles)
  var prev = '';
  for(var iter = 0; iter < 25 && str !== prev; iter++){
    prev = str;
    // missing commas between objects/arrays
    str = str.replace(/\}\s*\{/g, '},{');
    str = str.replace(/\]\s*\{/g, '],{');
    str = str.replace(/\}\s*\[/g, '},[');
    str = str.replace(/\]\s*\[/g, '],[');
    // missing commas between "value" and "key"
    str = str.replace(/"\s*\n\s*"/g, ',"');
    // trailing commas
    str = str.replace(/,\s*\]/g, ']');
    str = str.replace(/,\s*\}/g, '}');
    // smart quotes -> straight quotes
    str = str.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
    // try parse after each repair cycle
    try { return JSON.parse(str); } catch(e) {}
  }

  // 5. Last resort: extract script[] and actions[] separately
  var fallback = {title:'', scenario:'', script:[], actions:[]};
  var scriptMatch = str.match(/"script"\s*:\s*\[([\s\S]*?)\]/);
  if(scriptMatch){
    try{
      fallback.script = JSON.parse('[' + scriptMatch[1].replace(/}\s*{/g, '},{') + ']');
    }catch(e){
      // extract individual speaker/text pairs
      var re = /"speaker"\s*:\s*"([^"]*)"\s*,\s*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
      var m;
      while((m = re.exec(str)) !== null){
        fallback.script.push({speaker: m[1], text: m[2].replace(/\\n/g,' ').replace(/\\"/g,'"')});
      }
    }
  }
  var titleMatch = str.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if(titleMatch) fallback.title = titleMatch[1];
  var scenMatch = str.match(/"scenario"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if(scenMatch) fallback.scenario = scenMatch[1];
  var actMatch = str.match(/"actions"\s*:\s*\[([\s\S]*?)\]\s*\}/);
  if(actMatch){
    try{
      fallback.actions = JSON.parse('[' + actMatch[1].replace(/}\s*{/g, '},{') + ']');
    }catch(e){}
  }
  if(fallback.script.length === 0) throw new Error('Could not parse AI conversation');
  return fallback;
}

// Normalize demo object: guarantee fields exist and are safe types
function normalizeDemo(d){
  var demo = (typeof d === 'object' && d !== null) ? d : {};
  if(typeof demo.title !== 'string') demo.title = 'Demo';
  if(typeof demo.scenario !== 'string') demo.scenario = '';
  if(!Array.isArray(demo.script)) demo.script = [];
  demo.script = demo.script.filter(function(m){
    return m && typeof m === 'object' && typeof m.text === 'string' && m.text.trim();
  }).map(function(m){
    return {speaker: (typeof m.speaker === 'string' && m.speaker) ? m.speaker : 'Aria', text: m.text};
  });
  if(!Array.isArray(demo.actions)) demo.actions = [];
  demo.actions = demo.actions.filter(function(a){
    return a && typeof a === 'object' && a.type;
  }).map(function(a){
    return {type: String(a.type), details: (a.details && typeof a.details === 'object') ? a.details : {}};
  });
  if(demo.script.length === 0){
    demo.script = [{speaker:'Aria', text:'...'}, {speaker:'Customer', text:'...'}];
  }
  return demo;
}

// Safe escape for HTML injection
function esc(s){
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

var GEN_TIMERS=[];

// Sanitize user input: strip chars that break prompts/JSON, limit length
function sanitizeInput(s, maxLen){
  s = String(s === null || s === undefined ? '' : s);
  maxLen = maxLen || 300;
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // control chars
    .replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'") // smart quotes
    .replace(/[{}<>`\\]/g, ' ') // chars that break JSON structure
    .replace(/\s{2,}/g, ' ')
    .trim()
    .substring(0, maxLen);
}

// Validate demo object: returns array of error strings (empty = valid)
function validateDemo(d){
  var errs = [];
  if(!d || typeof d !== 'object'){ errs.push('demo is not an object'); return errs; }
  if(typeof d.title !== 'string' || !d.title.trim()) errs.push('missing title');
  if(!Array.isArray(d.script) || d.script.length < 4) errs.push('script must have at least 4 messages');
  if(Array.isArray(d.script)){
    d.script.forEach(function(m, i){
      if(!m || typeof m !== 'object' || !m.text || typeof m.text !== 'string'){
        errs.push('script[' + i + '] missing text');
      }
    });
  }
  return errs;
}

// Repair agent: asks the AI to fix broken JSON, returns raw text
async function repairJSON(brokenText, errors){
  var repairPrompt = 'The following JSON is broken. Errors: ' + errors.join('; ') + '.\nReturn ONLY the corrected valid JSON, nothing else. Same schema: {"title":"...","scenario":"...","script":[{"speaker":"Aria","text":"..."}],"actions":[{"type":"...","details":{...}}]}\n\nBROKEN JSON:\n' + brokenText.substring(0, 6000);
  var res = await fetch(WORKER_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({model:'nvidia/nemotron-3-ultra-550b-a55b:free', messages:[{role:'user', content:repairPrompt}], max_tokens:2000})});
  var result = await res.json();
  if(result.error) throw new Error(result.error.message || 'repair service error');
  if(!result.choices || !result.choices[0] || !result.choices[0].message) throw new Error('invalid repair response');
  return result.choices[0].message.content;
}

async function generateDemo(){
  var t=I18N[CUR];
  var btn=document.getElementById('pBtn');
  var out=document.getElementById('pOutput');
  var data={
    name:sanitizeInput(document.getElementById('pName').value, 120),
    type:sanitizeInput(document.getElementById('pType').value, 120),
    services:sanitizeInput(document.getElementById('pServices').value, 400),
    problem:sanitizeInput(document.getElementById('pProblem').value, 300)
  };
  data.lang = LANG_NAMES[CUR];
  if(!data.name||!data.type||!data.services){alert(t.personalizza.fillFields);return}
  btn.disabled=true;btn.textContent=t.personalizza.generating;
  out.style.display='block';
  out.innerHTML='<div style="display:flex;align-items:center;gap:12px;padding:20px"><div style="width:24px;height:24px;border:3px solid #5c5c7a;border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite"></div><span style="color:var(--muted)">'+t.personalizza.generating+'</span></div>';
  var langInstr = CUR==='it'?'Rispondi SOLO con JSON valido in italiano.':CUR==='es'?'Responde SOLO con JSON válido en español.':CUR==='zh'?'仅用有效的中文 JSON 回答。':'Respond ONLY with valid JSON in English.';
  var prompt='You are Aria, an AI voice assistant. Generate a custom demo in '+LANG_NAMES[CUR]+'.\nBUSINESS: '+data.name+' ('+data.type+')\nSERVICES: '+data.services+'\nPROBLEM: '+(data.problem||'Missed calls')+'\n\n'+langInstr+'\nCreate a LONG conversation (8-10 messages) with MANY ACTIONS (5-6).\nFormat: {"title":"...","scenario":"...","script":[{"speaker":"Aria","text":"..."},{"speaker":"Customer","text":"..."}],"actions":[{"type":"CREATE_APPOINTMENT","details":{"service":"...","datetime":"..."}}]}';
  try{
    var res=await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'nvidia/nemotron-3-ultra-550b-a55b:free',messages:[{role:'user',content:prompt}],max_tokens:2000})});
    if(!res.ok) throw new Error('API error '+res.status);
    var result=await res.json();
    if(result.error) throw new Error(result.error.message || 'AI service error');
    if(!result.choices || !result.choices[0] || !result.choices[0].message) throw new Error('Invalid API response');
    var text=result.choices[0].message.content;
    if(!text) throw new Error('AI returned no content (try again)');

    // Parse + validate + repair loop (subagent fixer, max 2 repair attempts)
    var demo, parseErr = null;
    try{
      demo = normalizeDemo(parseAIJSON(text));
    }catch(e){
      parseErr = e;
      demo = null;
    }
    // Validate even if parse succeeded
    var vErrs = demo ? validateDemo(demo) : [parseErr ? parseErr.message : 'unknown parse error'];

    if(vErrs.length > 0){
      // Subagent repair: send broken JSON + errors back to AI to fix
      for(var attempt = 0; attempt < 2 && vErrs.length > 0; attempt++){
        try{
          var repaired = await repairJSON(text, vErrs);
          demo = normalizeDemo(parseAIJSON(repaired));
          vErrs = validateDemo(demo);
          if(vErrs.length === 0) break;
          text = repaired; // use repaired text for next attempt
        }catch(re){
          vErrs = [re.message];
        }
      }
      if(vErrs.length > 0){
        // Even repair failed — show what we salvaged if any script exists
        if(demo && demo.script && demo.script.length >= 2){
          runGenDemo(out, demo); // show partial result
        } else {
          throw new Error('JSON repair failed: ' + vErrs.join('; '));
        }
      }
    }
    runGenDemo(out, demo);
  }catch(err){
    var msg = String(err.message || err);
    var retry = msg.indexOf('overloaded')>=0 || msg.indexOf('503')>=0 || msg.indexOf('empty')>=0;
    out.innerHTML='<div style="color:#ff6666;padding:12px;background:rgba(255,100,100,.08);border-radius:8px">⚠️ '+esc(msg)+(retry?' — <button onclick="generateDemo()" style="background:var(--accent);color:#000;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-weight:600;font-family:inherit">↻ Retry</button>':'')+'</div>';
  }
  btn.disabled=false;btn.textContent=t.personalizza.btn;
}

function runGenDemo(container,demo){
  GEN_TIMERS.forEach(clearTimeout);GEN_TIMERS=[];
  demo = normalizeDemo(demo);
  container.innerHTML='<div style="color:var(--accent);font-weight:600;margin-bottom:8px">'+esc(demo.title)+'</div><div style="color:var(--muted);font-size:.85em;margin-bottom:16px">'+esc(demo.scenario)+'</div><div style="width:100%;height:3px;background:var(--surface2);border-radius:2px;margin-bottom:16px;overflow:hidden"><div id="gen-prog" style="height:100%;background:var(--accent);width:0%;transition:width .4s"></div></div><div id="gen-chat" style="background:var(--surface2);border-radius:8px;padding:14px;font-size:.85em;min-height:150px"></div><div id="gen-actions" style="margin-top:16px;display:flex;flex-direction:column;gap:8px"></div>';
  demo.script.forEach(function(msg,i){
    GEN_TIMERS.push(setTimeout(function(){
      var chat=document.getElementById('gen-chat');
      if(!chat)return;
      var color=msg.speaker==='Aria'?'var(--accent)':'var(--text)';
      chat.innerHTML+='<div style="margin-bottom:8px;animation:msgIn .3s ease"><strong style="color:'+color+'">'+esc(msg.speaker)+':</strong> '+esc(msg.text)+'</div>';
      chat.scrollTop=999;
      var prog=document.getElementById('gen-prog');
      if(prog)prog.style.width=((i+1)/demo.script.length)*100+'%';
    },1500+i*2500));
  });
  var actTotal=(demo.script.length*2500)+2000;
  demo.actions.forEach(function(a,i){
    GEN_TIMERS.push(setTimeout(function(){
      var acts=document.getElementById('gen-actions');
      if(!acts)return;
      var ic={CREATE_APPOINTMENT:'📅',SEND_WHATSAPP_CONFIRMATION:'📱',SEND_EMAIL:'📧',SEND_SMS:'💬',SCHEDULE_REMINDER:'⏰',LOG_CALL_CRM:'🎯',NOTIFY_THERAPIST:'🔔',SEND_DIGITAL_INTAKE_FORM:'📋'}[a.type]||'⚡';
      var dt=Object.keys(a.details).map(function(k){return k+': '+a.details[k]}).join(' · ');
      acts.innerHTML+='<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;animation:actIn .3s ease"><span style="font-size:1.2em">'+ic+'</span><div><div style="font-size:.8em;font-weight:600">'+esc(a.type)+'</div><div style="font-size:.7em;color:var(--muted)">'+esc(dt)+'</div></div></div>';
    },actTotal+i*1500));
  });
}

// INIT
(function(){
  var langs=['it','en','es','zh'];
  var loaded=0;
  langs.forEach(function(l){
    fetch(l+'.json').then(function(r){return r.json()}).then(function(d){I18N[l]=d;loaded++;if(loaded===4){var saved='it';try{saved=localStorage.getItem('aria-lang')||'it'}catch(e){}setLang(saved)}}).catch(function(){loaded++;if(loaded===4){setLang('it')}});
  });
})();
