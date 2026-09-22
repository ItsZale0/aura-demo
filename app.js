var WORKER_URL = 'https://aria-proxy.zampese-alessandro.workers.dev';
var I18N = {};
var CUR = 'it';
var LANG_NAMES = {it:'Italiano',en:'English',es:'Español',zh:'中文'};
var THEME_ARIA = {it:'Attiva o disattiva la modalità notte',en:'Toggle night mode',es:'Activar o desactivar el modo noche',zh:'切换夜间模式'};

function setLang(l){
  CUR = l;
  document.documentElement.lang = l;
  document.querySelectorAll('#langSel button').forEach(function(b,i){
    var langs=['it','en','es','zh'];
    b.classList.toggle('active', langs[i]===l);
    b.setAttribute('aria-pressed', langs[i]===l ? 'true' : 'false');
  });
  var themeBtn=document.getElementById('themeBtn');
  if(themeBtn) themeBtn.setAttribute('aria-label', THEME_ARIA[l]||THEME_ARIA.it);
  document.body.style.fontFamily = l==='zh' ? "'Noto Sans SC','Plus Jakarta Sans',sans-serif" : "'Plus Jakarta Sans',sans-serif";
  applyI18N();
  buildDynamic();
  showTimeGreeting();
  updateGreetingClock();
  try{localStorage.setItem('aria-lang',l)}catch(e){}
}

var TYPE_TIMER = null;
function typeText(elId, text){
  var el = document.getElementById(elId);
  if(!el) return;
  var i = 0;
  el.textContent = '';
  clearTimeout(TYPE_TIMER);
  function tick(){
    if(i <= text.length){
      el.textContent = text.substring(0, i);
      i++;
      TYPE_TIMER = setTimeout(tick, 55);
    }
  }
  tick();
}

function applyI18N(){
  var t = I18N[CUR];
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var k = el.getAttribute('data-i18n');
    var v = k.split('.').reduce(function(o,p){return o&&o[p]},t);
    if(v!==undefined){
      // Hero title: animazione speciale
      if(el.hasAttribute('data-i18n') && (k==='hero.title1' || k==='hero.title2')){
        if(k==='hero.title1'){
          el.innerHTML = '<span class="w">'+esc(v)+'</span>';
        } else {
          // title2 = typewriter, parte dopo l'ingresso di title1
          el.innerHTML = '<span class="type-wrap"><span class="accent" id="typeTarget"></span></span><span class="type-cursor" id="typeCursor"></span>';
          clearTimeout(TYPE_TIMER);
          TYPE_TIMER = setTimeout(function(){ typeText('typeTarget', v); }, 650);
        }
      } else {
        el.textContent = v;
      }
    }
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){
    var k = el.getAttribute('data-i18n-html');
    var v = k.split('.').reduce(function(o,p){return o&&o[p]},t);
    // Hero subtitle: variante casuale ad ogni load
    if(v!==undefined){
      if(k==='hero.subtitle'){
        var vars = k.split('.').reduce(function(o,p){return o&&o[p]}, {hero:{subtitle:t.hero['subtitleVariants']}});
        if(vars && vars.length){ v = vars[Math.floor(Math.random()*vars.length)]; }
      }
      el.innerHTML=v;
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    var k = el.getAttribute('data-i18n-ph');
    var v = k.split('.').reduce(function(o,p){return o&&o[p]},t);
    if(v!==undefined) el.placeholder=v;
  });
}

function buildDynamic(){
  var t = I18N[CUR];
  if(!t){ return; } // lingua non caricata: niente da costruire
  var stats = document.getElementById('stats');
  if(stats) stats.innerHTML = t.stats.map(function(s){return '<div class="stat"><div class="num">'+s.num+'</div><div class="lbl">'+s.lbl+'</div></div>'}).join('');
  var fg = document.getElementById('featGrid');
  if(fg) fg.innerHTML = t.features.items.map(function(f){return '<div class="feat"><div class="ficn">'+f.icn+'</div><h4>'+f.t+'</h4><p>'+f.d+'</p></div>'}).join('');
  var caps = ['📅','📧','💬','⏰','🎯','🔄','📊','🔔','📋','🤖','🎫','⚡'];
  var cg = document.getElementById('capGrid');
  if(cg) cg.innerHTML = t.capabilities.items.map(function(c,i){return '<div class="cap-item"><span class="cap-icn">'+caps[i]+'</span><span class="cap-txt">'+c+'</span></div>'}).join('');
  var tabs = document.getElementById('demo');
  if(tabs) tabs.innerHTML = t.tabs.map(function(tb,i){return '<div class="tab'+(i===0?' active':'')+'" onclick="selectDemo('+i+')" role="button" tabindex="0" aria-pressed="'+(i===0)+'">'+tb+'</div>'}).join('');
  buildDemos();
}

var timers=[];
function clr(){timers.forEach(clearTimeout);timers=[]}
function sch(fn,ms){timers.push(setTimeout(fn,ms))}
function selectDemo(n){document.querySelectorAll('.tab').forEach(function(tb,i){tb.classList.toggle('active',i===n);tb.setAttribute('aria-pressed', i===n)});document.querySelectorAll('.demo-view').forEach(function(v,i){v.classList.toggle('active',i===n)})}

function buildDemos(){
  var t = I18N[CUR];
  var views = document.getElementById('demoViews');
  views.innerHTML='';
  var icnMap={cal:'📅',wa:'📱',crm:'🎯'};
  var titleMap={cal:t.demoUI.calendar,wa:t.demoUI.whatsapp,crm:t.demoUI.crm};
  t.demos.forEach(function(d,n){
    var v=document.createElement('div');
    v.className='demo-view'+(n===0?' active':'');
    v.id='dv'+n;
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
    v.innerHTML='<div class="dash"><div class="panel phone"><div class="panel-head"><div class="picn">🤖</div><h4>'+d.phone.name+'</h4><span class="tag"><span class="dot"></span>'+d.phone.tag+'</span></div><div class="phone-chat" id="s'+n+'-chat"></div></div><div class="panel visual"><div class="panel-head"><div class="picn">'+icnMap[d.visual]+'</div><h4>'+titleMap[d.visual]+'</h4></div><div class="visual-body">'+vis+'</div></div></div><div class="timeline" id="s'+n+'-tl"></div><div class="prog"><div class="fill" id="s'+n+'-prog"></div></div><div class="controls"><button class="prim" id="s'+n+'-btn" onclick="startDemo('+n+')">'+t.demoUI.start+'</button><button class="sec" onclick="resetDemo('+n+')">'+t.demoUI.reset+'</button></div>';
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
  var panels=document.querySelectorAll('#dv'+n+' .panel');
  panels.forEach(function(p){p.classList.remove('running')});
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
  // HARD FILTER: keep only whitelisted feasible actions
  demo.actions = demo.actions.filter(function(a){
    return ALLOWED_ACTIONS.indexOf(a.type) >= 0;
  });
  // FEASIBILITY SUBAGENT: strip actions that lack operational sense (missing required fields)
  var feasIssues = checkFeasibility(demo);
  if(feasIssues.length > 0){
    var badIdx = {};
    feasIssues.forEach(function(f){ badIdx[f.index] = true; });
    demo.actions = demo.actions.filter(function(a, i){
      return !badIdx[i];
    });
  }
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

// Whitelist of allowed action types — all feasible with n8n automations
var ALLOWED_ACTIONS = [
  'CREATE_APPOINTMENT',        // n8n Google Calendar node
  'SEND_WHATSAPP_CONFIRMATION',// n8n WhatsApp/whapi/wa.me
  'SEND_WHATSAPP_REMINDER',    // n8n scheduled WhatsApp message
  'LOG_CALL_CRM',              // n8n Google Sheets/HubSpot/Airtable
  'SEND_EMAIL',                // n8n Gmail/SMTP node
  'SEND_SMS',                  // n8n Twilio SMS
  'CREATE_TICKET',             // n8n Zendesk/Freshdesk/Trello
  'UPDATE_CRM_STATUS',         // n8n CRM update (HubSpot etc.)
  'ADD_TO_WAITLIST',           // n8n Sheets/DB insert
  'SEND_FOLLOWUP',             // n8n scheduled follow-up message
  'GENERATE_QUOTE',            // n8n PDF generation + email/WA
  'TRANSCRIBE_SUMMARY',        // n8n OpenAI/LLM call summary + email
  'BOOK_TABLE',                // n8n restaurant booking (Sheets/DB)
  'ORDER_STATUS_CHECK',        // n8n DB/API lookup
  'CANCEL_APPOINTMENT'         // n8n Google Calendar delete/update
];

// Feasibility validator: checks that actions make operational sense for a phone receptionist
// Returns list of removal reasons; invalid actions are stripped by normalizeDemo
function checkFeasibility(demo){
  var issues = [];
  if(!demo || !Array.isArray(demo.actions)) return issues;
  demo.actions.forEach(function(a, i){
    if(!a || !a.type) return;
    var t = a.type;
    var det = a.details || {};
    // Action with no meaningful details = not feasible
    var detKeys = Object.keys(det).filter(function(k){ return det[k] !== undefined && det[k] !== null && String(det[k]).trim() !== ''; });
    if(detKeys.length === 0){
      issues.push({index: i, type: t, reason: 'no details'});
    }
    // Appointment without datetime/customer = broken
    if(t === 'CREATE_APPOINTMENT' && (!det.datetime || !det.service)){
      issues.push({index: i, type: t, reason: 'appointment missing service or datetime'});
    }
    // WhatsApp/email/sms without message = broken
    if((t === 'SEND_WHATSAPP_CONFIRMATION' || t === 'SEND_EMAIL' || t === 'SEND_SMS' || t === 'SEND_FOLLOWUP') && !det.message){
      issues.push({index: i, type: t, reason: 'message missing'});
    }
  });
  return issues;
}

// Tone checker: flags Aria messages containing technical terms she would never say aloud
var TECH_TERMS = /\b(api|token|id\b|workflow|automation|system|database|crm\b|integration|url|http|endpoint|json|webhook|ticket id|order id|reference number|unique[_ ]?token|intake form|anamnesi digitale)/i;

function checkTone(demo){
  var issues = [];
  if(!demo || !Array.isArray(demo.script)) return issues;
  demo.script.forEach(function(m, i){
    if(m && m.speaker === 'Aria' && m.text && TECH_TERMS.test(m.text)){
      issues.push('script[' + i + ']: Aria says technical term "' + (m.text.match(TECH_TERMS) || [''])[0] + '" — rewrite in natural language');
    }
  });
  return issues;
}

// Auto-sanitizer: rewrites Aria's technical phrases into natural ones (no AI call needed)
var TONE_FIXES = [
  [/\bI (?:have )?(?:created|logged|registered) (?:a |an |the )?(ticket|work ?order|task)[^.]*?(?:in|into|on) (?:the )?(?:system|crm|database)[.]?/gi, 'All done, I have everything I need.'],
  [/\bI(?:'m| am) (?:sending|going to send) (?:you )?(?:the|a|an) (?:digital )?(?:intake |anamnesi )?form (?:link|via|with|at)[^.]*[.]?/gi, 'I will send you a short message with the details.'],
  [/\b(?:your|the) (?:unique )?(?:token|reference (?:number|code)|confirmation code) is[^.]*[.]?/gi, 'You will find the details in the message.'],
  [/\bI(?:'m| am) (?:logging|saving|recording) (?:this|your call|your request)[^.]*?(?:in|into) (?:the )?(?:crm|system|database)[.]?/gi, 'Perfect, I have noted everything.'],
  [/\b(?:the )?system (?:has|will)[^.]*[.]?/gi, 'We will take care of it.'],
  [/\bvia (?:the )?(?:internal )?(?:app|portal|dashboard|api)[.]?/gi, 'right away'],
  [/\b(?:with|and) (?:the )?(?:following )?(?:details|parameters|fields)?:?[^.]*[.]?/gi, ''],
  [/\bI(?:'m| am) (?:creating|generating) (?:a |an |the )?(?:automated )?(?:workflow|automation|process)[^.]*[.]?/gi, 'I will handle that right away.'],
  [/\b(?:your|the) (?:appointment|booking) (?:id|reference)[^.]*[.]?/gi, 'Everything is confirmed.'],
  [/\bI(?:'m| am) (?:updating|syncing)[^.]*?(?:crm|system|database|status)[^.]*[.]?/gi, 'All set!'],
  [/\bhere(?:'s| is) (?:your|the)[^.]*?(?:link|url)[^.]*[.]?/gi, 'I will send it to you in a message.'],
  [/\b(?:I|i) (?:will )?(?:notify|alert|inform) (?:the )?(?:therapist|doctor|technician|team|staff) (?:via|through|on) (?:the )?(?:internal )?(?:app|system|platform)[.]?/gi, 'I will let them know right away.'],
  [/\b scheduled (?:a |an )?reminder[^.]*[.]?/gi, ' and you will get a reminder'],
  [/\b(?:status|priority|severity):?\s*\w+/gi, ''],
  [/\b(?:ticket|order|booking) (?:number|#|id)\s*[:#]?\s*\w+/gi, ''],
  [/\bhttps?:\/\/\S+/gi, ''],
  [/\b[A-Z0-9]{8,}\b/g, ''] // long codes/IDs
];

function sanitizeTone(demo){
  if(!demo || !Array.isArray(demo.script)) return demo;
  demo.script.forEach(function(m){
    if(m && m.speaker === 'Aria' && typeof m.text === 'string'){
      TONE_FIXES.forEach(function(fx){
        m.text = m.text.replace(fx[0], fx[1]);
      });
      // cleanup: double spaces, orphan punctuation
      m.text = m.text.replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').replace(/^[\s.,;:]+/, '').trim();
      // if message became empty after sanitization, replace with natural filler
      if(!m.text || m.text.length < 4){
        m.text = {it:'Perfetto, tutto fatto!',en:'Perfect, all done!',es:'¡Perfecto, todo listo!',zh:'好的，都办妥了！'}[CUR] || 'Perfect, all done!';
      }
    }
  });
  return demo;
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
  // Realism check: flag overly long messages (over 40 words)
  var longMsgs = 0;
  if(Array.isArray(d.script)){
    d.script.forEach(function(m){
      if(m && m.text && m.text.split(/\s+/).length > 40) longMsgs++;
    });
  }
  if(longMsgs > 2) errs.push('messages too long (unrealistic)');
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
  var prompt='You are Aria, a REALISTIC phone receptionist AI. Generate a demo in '+LANG_NAMES[CUR]+'.\nBUSINESS: '+data.name+' ('+data.type+')\nSERVICES: '+data.services+'\nPROBLEM: '+(data.problem||'Missed calls')+'\n\n'+langInstr+'\n\nREALISM RULES (critical):\n- Conversation: 6-8 SHORT messages total (real phone calls are brief)\n- Each message: max 15 words, natural spoken language, like a real phone call\n- Aria sounds human: polite, direct, warm, like a real receptionist\n- Customer speaks casually, sometimes brief ("Yes, perfect", "Tomorrow works")\n- datetime format: "tomorrow 10:00" or "2026-09-22 15:00"\n\nTONE RULES — Aria NEVER says technical or detailed things:\n- NEVER mention: APIs, tokens, IDs, workflows, automations, systems, databases, CRM, integrations, URLs, codes, forms with links\n- NEVER read long details aloud (no full addresses, no lists of options, no prices with decimals)\n- Aria speaks like a person: "Perfect, all set!", "I will send you a message on WhatsApp", "Marco will call you tomorrow"\n- The technical details go ONLY in the actions JSON, never in the spoken conversation\n\nACTIONS — use ONLY these types (all automatable via n8n):\nCREATE_APPOINTMENT {service, customer_name, datetime}\nSEND_WHATSAPP_CONFIRMATION {to, message}\nSEND_WHATSAPP_REMINDER {to, timing, message}\nLOG_CALL_CRM {name, request, status}\nSEND_EMAIL {to, subject, message}\nSEND_SMS {to, message}\nCREATE_TICKET {subject, priority, customer}\nUPDATE_CRM_STATUS {name, from, to}\nADD_TO_WAITLIST {name, preferred_time}\nSEND_FOLLOWUP {channel, timing, message}\nGENERATE_QUOTE {service, price_range}\nTRANSCRIBE_SUMMARY {sent_to, summary}\nBOOK_TABLE {name, people, datetime}\nORDER_STATUS_CHECK {order_id}\nCANCEL_APPOINTMENT {customer_name, datetime}\n\nPick 2-4 actions that fit this business. Every action MUST have its required fields filled.\nNEVER invent action types outside this list.\n\nExample tone: Aria: "Hi, this is Aria from Smith Plumbing. How can I help?" — Customer: "Hi, my kitchen sink is leaking." — Aria: "Sorry to hear that. Can I book a technician for you?" — Customer: "Yes, tomorrow morning if possible." — Aria: "Done, tomorrow at 9. You will get a message with the details."\n\nFormat: {"title":"...","scenario":"one short sentence","script":[{"speaker":"Aria","text":"..."},{"speaker":"Customer","text":"..."}],"actions":[{"type":"CREATE_APPOINTMENT","details":{"service":"...","customer_name":"...","datetime":"..."}}]}';
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
    // TONE CHECK: Aria must never speak technical — add violations to repair list
    if(demo && vErrs.length === 0){
      var toneIssues = checkTone(demo);
      if(toneIssues.length > 0){
        vErrs = toneIssues.concat(['TONE: rewrite Aria lines in natural human language, no technical terms']);
      }
    }

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
    // Final tone sanitization: ALWAYS applied before display (instant, no AI call)
    demo = sanitizeTone(demo);
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
  container.innerHTML='<div style="color:var(--accent);font-weight:600;margin-bottom:8px">'+esc(demo.title)+'</div><div style="color:var(--muted);font-size:.85em;margin-bottom:16px">'+esc(demo.scenario)+'</div><div style="width:100%;height:3px;background:var(--bg2);border-radius:2px;margin-bottom:16px;overflow:hidden"><div id="gen-prog" style="height:100%;background:var(--accent);width:0%;transition:width .4s"></div></div><div id="gen-chat" style="background:var(--bg2);border-radius:8px;padding:14px;font-size:.85em;min-height:150px"></div><div id="gen-actions" style="margin-top:16px;display:flex;flex-direction:column;gap:8px"></div>';
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
      var ic={CREATE_APPOINTMENT:'📅',SEND_WHATSAPP_CONFIRMATION:'📱',SEND_WHATSAPP_REMINDER:'⏰',SEND_EMAIL:'📧',SEND_SMS:'💬',LOG_CALL_CRM:'🎯',CREATE_TICKET:'🎫',UPDATE_CRM_STATUS:'🔄',ADD_TO_WAITLIST:'📋',SEND_FOLLOWUP:'📨',GENERATE_QUOTE:'🧾',TRANSCRIBE_SUMMARY:'📝',BOOK_TABLE:'🍽️',ORDER_STATUS_CHECK:'📦',CANCEL_APPOINTMENT:'❌'}[a.type]||'⚡';
      var dt=Object.keys(a.details).map(function(k){return k+': '+a.details[k]}).join(' · ');
      acts.innerHTML+='<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;animation:actIn .3s ease"><span style="font-size:1.2em">'+ic+'</span><div><div style="font-size:.8em;font-weight:600">'+esc(a.type)+'</div><div style="font-size:.7em;color:var(--muted)">'+esc(dt)+'</div></div></div>';
    },actTotal+i*1500));
  });
}


// ═══════════ TEMA DINAMICO (giorno/notte) ═══════════
var THEME = 'day';
function applyTheme(t){
  THEME = t;
  document.documentElement.setAttribute('data-theme', t === 'night' ? 'night' : '');
  var btn = document.getElementById('themeBtn');
  if(btn) btn.textContent = t === 'night' ? '🌙' : '☀️';
  try{localStorage.setItem('aria-theme', t)}catch(e){}
}
function toggleTheme(){
  applyTheme(THEME === 'day' ? 'night' : 'day');
  showToast(THEME === 'night' ? '🌙 ' + (I18N[CUR] && I18N[CUR].ui.nightOn || 'Modalità notte') : '☀️ ' + (I18N[CUR] && I18N[CUR].ui.dayOn || 'Modalità giorno'));
}

// ═══════════ SALUTO TEMPORALE ═══════════
function getTimeGreeting(){
  var h = new Date().getHours();
  if(h >= 5 && h < 12) return {icn:'🌅', key:'morning'};
  if(h >= 12 && h < 18) return {icn:'☀️', key:'afternoon'};
  if(h >= 18 && h < 23) return {icn:'🌆', key:'evening'};
  return {icn:'🌙', key:'night'};
}
function showTimeGreeting(){
  var g = getTimeGreeting();
  var el = document.getElementById('timeGreet');
  var icn = document.getElementById('tgIcon');
  var txt = document.getElementById('tgText');
  if(!el) return;
  var t = I18N[CUR];
  var msg = t && t.ui && t.ui.greetings && t.ui.greetings[g.key] ? t.ui.greetings[g.key] : '';
  if(msg){
    el.style.display = 'flex';
    icn.textContent = g.icn;
    txt.textContent = msg;
  }
}

// ═══════════ TOAST ═══════════
var toastTimer = null;
function showToast(msg, icn){
  var toast = document.getElementById('toast');
  var tIcon = document.getElementById('toastIcon');
  var tText = document.getElementById('toastText');
  if(!toast) return;
  tIcon.textContent = icn || '👋';
  tText.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 4500);
}

// ═══════════ SCROLL REVEAL ═══════════
function initReveal(){
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('on');
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
}

// ═══════════ CURSOR GLOW ═══════════
function initCursorGlow(){
  var glow = document.getElementById('cursorGlow');
  if(!glow) return;
  var raf = null;
  document.addEventListener('mousemove', function(e){
    if(raf) return;
    raf = requestAnimationFrame(function(){
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.classList.add('on');
      raf = null;
    });
  });
  document.addEventListener('mouseleave', function(){ glow.classList.remove('on'); });
}

// ═══════════ VISIT COUNTER (vita del sito) ═══════════
function initVisitVibe(){
  // numero visite in questa sessione di vita
  var visits = 0;
  try{ visits = parseInt(localStorage.getItem('aria-visits') || '0', 10) + 1; localStorage.setItem('aria-visits', visits); }catch(e){ visits = 1; }
  var t = I18N[CUR];
  setTimeout(function(){
    if(visits === 1){
      var g = getTimeGreeting();
      var msg = t && t.ui && t.ui.welcomeFirst ? t.ui.welcomeFirst : 'Benvenuto!';
      showToast(msg, g.icn);
    } else if(visits === 3){
      var msg2 = t && t.ui && t.ui.welcomeBack3 ? t.ui.welcomeBack3 : 'Ci vediamo spesso, mi piace 😊';
      showToast(msg2, '😊');
    } else if(visits > 3 && visits % 5 === 0){
      var msg3 = t && t.ui && t.ui.welcomeBack ? t.ui.welcomeBack : 'Bentornato!';
      showToast(msg3 + ' (' + visits + '° volta)', '🎉');
    }
  }, 2500);
}

// ═══════════ INIT DINAMICO ═══════════
function initDynamic(){
  // tema: salvato o auto (19-6 = notte)
  var saved = null;
  try{ saved = localStorage.getItem('aria-theme'); }catch(e){}
  var h = new Date().getHours();
  applyTheme(saved || (h >= 19 || h < 6 ? 'night' : 'day'));
  updateGreetingClock();
  initReveal();
  initCursorGlow();
  initVisitVibe();
  // saluto aggiornato ogni minuto (cambia a mezzanotte ecc)
  setInterval(updateGreetingClock, 30000);
  initScrollProgress();
  initNavActive();
  // tab demo accessibili da tastiera (Enter/Spazio)
  document.addEventListener('keydown', function(e){
    if((e.key==='Enter'||e.key===' ') && e.target && e.target.classList && e.target.classList.contains('tab')){
      e.preventDefault();
      var tabs = [].slice.call(document.querySelectorAll('.tab'));
      selectDemo(tabs.indexOf(e.target));
    }
  });
}


// ═══ OROLOGIO LIVE nel saluto ═══
function updateGreetingClock(){
  var el = document.getElementById('tgText');
  if(!el) return;
  var now = new Date();
  var hh = String(now.getHours()).padStart(2,'0');
  var mm = String(now.getMinutes()).padStart(2,'0');
  var g = getTimeGreeting();
  var t = I18N[CUR];
  var msg = t && t.ui && t.ui.greetings && t.ui.greetings[g.key] ? t.ui.greetings[g.key] : '';
  if(msg){
    el.innerHTML = msg + ' <span class="tg-sep" style="display:inline-block;margin:0 6px;vertical-align:middle"></span> <span class="tg-clock">' + hh + ':' + mm + '</span>';
  }
}

// ═══ SCROLL PROGRESS BAR ═══
function initScrollProgress(){
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var raf = null;
  window.addEventListener('scroll', function(){
    if(raf) return;
    raf = requestAnimationFrame(function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      raf = null;
    });
  }, {passive:true});
}

// ═══ NAV ACTIVE SECTION ═══
function initNavActive(){
  var links = document.querySelectorAll('.nav-links a');
  if(!links.length) return;
  var sections = [];
  links.forEach(function(a){
    var id = a.getAttribute('href');
    if(id && id.startsWith('#')){
      var s = document.querySelector(id);
      if(s) sections.push({el: s, link: a});
    }
  });
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(l){ l.classList.remove('active'); });
        var match = sections.find(function(s){ return s.el === e.target; });
        if(match) match.link.classList.add('active');
      }
    });
  }, {rootMargin: '-30% 0px -60% 0px'});
  sections.forEach(function(s){ obs.observe(s.el); });
}

// ═══ PANEL RUNNING STATE ═══
var origStartDemo = startDemo;
startDemo = function(n){
  var panels = document.querySelectorAll('#dv' + n + ' .panel');
  panels.forEach(function(p){ p.classList.add('running'); });
  origStartDemo(n);
  var last = I18N[CUR].demos[n].steps[I18N[CUR].demos[n].steps.length-1].delay;
  setTimeout(function(){ panels.forEach(function(p){ p.classList.remove('running'); }); }, last + 3500);
};
// INIT
(function(){
  var langs=['it','en','es','zh'];
  var loaded=0;
  langs.forEach(function(l){
    fetch(l+'.json').then(function(r){return r.json()}).then(function(d){I18N[l]=d;loaded++;if(loaded===4){var saved='it';try{saved=localStorage.getItem('aria-lang')||'it'}catch(e){}setLang(saved);initDynamic();}}).catch(function(){loaded++;if(loaded===4){setLang('it');initDynamic();}});
  });
})();
