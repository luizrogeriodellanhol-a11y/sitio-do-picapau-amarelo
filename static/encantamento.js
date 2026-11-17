
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A capa é apresentada uma vez por aba; o visitante pode pular.
  const gate = $("bookGate");
  const finishGate = () => {
    if (!gate || gate.hidden) return;
    document.body.classList.remove("gate-open");
    if (reduced) {
      gate.hidden = true;
    } else {
      gate.classList.add("is-opening");
      window.setTimeout(() => { gate.hidden = true; }, 700);
    }
    try { window.sessionStorage.setItem("sitio-book-opened", "1"); } catch (_) {}
    const entry = document.querySelector(".hero .btn-gold");
    if (entry) entry.focus({preventScroll:true});
  };
  if (gate) {
    $("reopenBook")?.addEventListener("click",()=>{
      gate.classList.remove("is-opening");gate.hidden=false;
      document.body.classList.add("gate-open");
      $("openBook")?.focus({preventScroll:true});
    });
    let alreadyOpened = false;
    try { alreadyOpened = sessionStorage.getItem("sitio-book-opened") === "1"; } catch (_) {}
    if (!alreadyOpened) {
      gate.hidden = false;
      document.body.classList.add("gate-open");
      $("openBook").focus({preventScroll:true});
    }
    $("openBook").addEventListener("click", finishGate);
    $("skipBook").addEventListener("click", finishGate);
    gate.addEventListener("keydown", (e) => {
      if (e.key === "Escape") finishGate();
      if (e.key === "Tab") {
        const items = [$("openBook"), $("skipBook")];
        if (e.shiftKey && document.activeElement === items[0]) {e.preventDefault(); items[1].focus();}
        else if (!e.shiftKey && document.activeElement === items[1]) {e.preventDefault();items[0].focus();}
      }
    });
  }

  // Visitar locais do mapa desperta pequenos trechos da história.
  const places = {
    house: {icon:"🏡",title:"A casa de Dona Benta",desc:"É aqui que as melhores conversas começam. Um dia que parecia tranquilo acaba virando uma grande aventura.",hint:"Experimente conhecer o mistério na seção da história."},
    kitchen: {icon:"🥧",title:"A cozinha de Tia Nastácia",desc:"Um cantinho cheio de cheiros deliciosos! Se Rabicó aparecer, é quase certo que vai pedir um bolinho.",hint:"Você já encontrou Rabicó entre os personagens?"},
    forest: {icon:"🌳",title:"A floresta das surpresas",desc:"Pelo caminho, os amigos podem encontrar um visitante muito travesso. Quem será que conhece os segredos da floresta?",hint:"Explore os objetos encantados no Cantinho da Magia."},
    path: {icon:"🗝️",title:"O caminho misterioso",desc:"O pergaminho fala de uma passagem secreta... Mas nem todas as portas se abrem com uma chave de verdade.",hint:"Descubra pistas e reúna os selos mágicos pelo site."}
  };
  const mapButtons = document.querySelectorAll("[data-place]");
  const displayPlace = (key) => {
    const p=places[key]; if(!p) return;
    $("mapIcon").textContent=p.icon;
    $("mapTitle").textContent=p.title;
    $("mapDescription").textContent=p.desc;
    $("mapHint").textContent=p.hint;
    mapButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.place===key)));
  };
  mapButtons.forEach(b=>b.addEventListener("click",()=>displayPlace(b.dataset.place)));
  if(mapButtons.length)displayPlace("house");

  // Cartas dos personagens com revelações acessíveis pelo teclado.
  const facts = {
    "Narrador(a) 1":"É quem apresenta o mundo encantado do Sítio para a plateia.",
    "Narrador(a) 2":"Ajuda a guiar a aventura e conta o que acontece na floresta.",
    "Dona Benta":"A leitura e a imaginação têm um lugar especial em suas histórias.",
    "Tia Nastácia":"Sempre percebe quando a turma está prestes a entrar em uma confusão.",
    "Narizinho":"É uma das primeiras a descobrir que existe um mistério a investigar.",
    "Pedrinho":"Foi ele quem mostrou aos amigos o estranho pergaminho.",
    "Emília":"Ela não gosta de ficar de fora de nenhuma investigação!",
    "Visconde de Sabugosa":"Se aparece uma pergunta difícil, ele logo procura uma explicação nos livros.",
    "Rabicó":"Sua grande preocupação costuma ser a hora do próximo lanche.",
    "Saci":"Adora pregar peças e conhece os caminhos da floresta.",
    "Cuca":"Aparece quando a aventura está ficando mais misteriosa."
  };
  document.querySelectorAll("#characterGrid .character").forEach((card) => {
    const name=card.querySelector("h3");
    if(!name) return;
    const fact=facts[name.textContent.trim()];
    if(!fact) return;
    const button=document.createElement("button");
    const detail=document.createElement("p");
    const id="curiosidade-"+Array.from(card.parentNode.children).indexOf(card);
    button.type="button";
    button.className="funfact-btn";
    button.textContent="✨ Descobrir curiosidade";
    button.setAttribute("aria-controls",id);
    button.setAttribute("aria-expanded","false");
    detail.className="funfact";
    detail.id=id;
    detail.hidden=true;
    detail.textContent=fact;
    button.addEventListener("click",()=>{
      const show=detail.hidden;
      detail.hidden=!show;
      button.setAttribute("aria-expanded",String(show));
      button.textContent=show?"📖 Esconder curiosidade":"✨ Descobrir curiosidade";
    });
    card.append(button,detail);
  });

  // Jogo da memória — não coleta dados e pode ser reiniciado.
  const board=$("memoryBoard");
  const memoryState=$("memoryStatus");
  const memoryMoves=$("memoryMoves");
  const symbols=["🪆","🌽","📖","🍃","🐷","🏡"];
  let first=null, second=null, locked=false, moves=0, pairs=0, memoryGameId=0;
  const setMemoryStatus=(text)=>{if(memoryState)memoryState.textContent=text;};
  const newMemoryGame=()=>{
    if(!board)return;
    board.replaceChildren();
    memoryGameId++;first=null;second=null;locked=false;moves=0;pairs=0;
    memoryMoves.textContent="Jogadas: 0";
    setMemoryStatus("Encontre os 6 pares encantados!");
    const deck=symbols.concat(symbols);
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    deck.forEach((symbol,index)=>{
      const b=document.createElement("button");
      b.type="button";b.className="memory-card";b.textContent="✦";b.dataset.symbol=symbol;
      b.setAttribute("aria-label","Carta "+(index+1)+": fechada");
      b.addEventListener("click",()=>{
        if(locked||b.classList.contains("is-up")||b.classList.contains("is-matched"))return;
        b.classList.add("is-up");b.textContent=symbol;b.setAttribute("aria-label","Carta "+(index+1)+": "+symbol);
        if(!first){first=b;return;}
        second=b;moves++;memoryMoves.textContent="Jogadas: "+moves;
        if(first.dataset.symbol===second.dataset.symbol){
          first.classList.add("is-matched");second.classList.add("is-matched");
          first.disabled=true;second.disabled=true;pairs++;
          first=null;second=null;
          setMemoryStatus(pairs===symbols.length?"🎉 Você encontrou todos os pares!":"Muito bem! "+pairs+" de 6 pares encontrados.");
          if(pairs===symbols.length)document.dispatchEvent(new CustomEvent("sitio:conquista",{detail:"memoria"}));
        }else{
          locked=true;setMemoryStatus("Quase! Observe e tente outra vez.");
          const a=first,c=second,gameId=memoryGameId;
          window.setTimeout(()=>{
            if(gameId!==memoryGameId)return;
            a.classList.remove("is-up");c.classList.remove("is-up");
            a.textContent="✦";c.textContent="✦";
            a.setAttribute("aria-label","Carta fechada");c.setAttribute("aria-label","Carta fechada");
            first=null;second=null;locked=false;
          },1000);
        }
      });
      board.appendChild(b);
    });
  };
  newMemoryGame();
  if($("memoryRestart"))$("memoryRestart").addEventListener("click",newMemoryGame);

  // Coleção de selos mágicos: progresso somente neste navegador.
  const stampInfo={
    flor:{icon:"🌻",name:"Flor da alegria"},
    livro:{icon:"📖",name:"Livro da imaginação"},
    chave:{icon:"🗝️",name:"Chave da curiosidade"},
    estrela:{icon:"⭐",name:"Estrela da floresta"}
  };
  let collected={};
  try{collected=JSON.parse(localStorage.getItem("sitio-selos-v1")||"{}")||{};}catch(_){collected={};}
  const questPanel=$("questPanel");
  const renderStamps=()=>{
    const count=Object.keys(stampInfo).filter(k=>collected[k]).length;
    const tracker=$("questTracker");
    if(tracker)tracker.textContent="Selos "+count+"/4";
    const list=$("stampList");
    if(list){
      list.replaceChildren();
      Object.entries(stampInfo).forEach(([id,stamp])=>{
        const li=document.createElement("li");if(collected[id])li.className="is-found";
        const icon=document.createElement("span");icon.className="stamp-icon";icon.textContent=stamp.icon;
        const label=document.createElement("span");label.textContent=stamp.name+(collected[id]?" — encontrado!":" — escondido");
        li.append(icon,label);list.appendChild(li);
      });
    }
    document.querySelectorAll("[data-stamp]").forEach(b=>{
      const done=Boolean(collected[b.dataset.stamp]);
      b.classList.toggle("is-found",done);
      b.setAttribute("aria-label",(done?"Selo já descoberto: ":"Descobrir selo: ")+stampInfo[b.dataset.stamp].name);
      b.textContent=done?"✓":stampInfo[b.dataset.stamp].icon;
    });
    const ending=$("questResult");
    if(ending)ending.textContent=count===4?"🌟 Parabéns! Você encontrou todos os selos e abriu as portas da imaginação!":"Encontre os quatro símbolos escondidos nas páginas do Sítio.";
  };
  document.querySelectorAll("[data-stamp]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.stamp;
    if(!stampInfo[id]||collected[id])return;
    collected[id]=true;
    try{localStorage.setItem("sitio-selos-v1",JSON.stringify(collected));}catch(_){}
    renderStamps();
    if(Object.keys(stampInfo).every(k=>collected[k]))document.dispatchEvent(new CustomEvent("sitio:conquista",{detail:"selos"}));
    if(questPanel)questPanel.hidden=false;
    if(typeof showToast==="function")showToast("Você encontrou um selo mágico! ✨");
  }));
  renderStamps();
  if($("questToggle"))$("questToggle").addEventListener("click",()=>{
    questPanel.hidden=!questPanel.hidden;
    $("questToggle").setAttribute("aria-expanded",String(!questPanel.hidden));
  });
  if($("questClose"))$("questClose").addEventListener("click",()=>{
    questPanel.hidden=true;
    $("questToggle").setAttribute("aria-expanded","false");
    $("questToggle").focus();
  });

  // Melodia original, sintetizada no dispositivo, sempre desligada por padrão.
  let audioContext=null, masterGain=null, melodyTimer=null, step=0;
  const tune=[392,493.88,587.33,493.88,440,392,329.63,392,523.25,587.33,659.25,587.33,493.88,440,392,329.63];
  const soundBtn=$("soundToggle");
  const volume=$("soundVolume");
  const playNote=(freq)=>{
    if(!audioContext||!masterGain)return;
    const now=audioContext.currentTime;
    const osc=audioContext.createOscillator();
    const envelope=audioContext.createGain();
    osc.type="sine";osc.frequency.value=freq;
    envelope.gain.setValueAtTime(0,now);
    envelope.gain.linearRampToValueAtTime(.12,now+.04);
    envelope.gain.exponentialRampToValueAtTime(.001,now+.56);
    osc.connect(envelope);envelope.connect(masterGain);
    osc.start(now);osc.stop(now+.58);
  };
  const stopSound=()=>{
    if(melodyTimer!==null){window.clearInterval(melodyTimer);melodyTimer=null;}
    if(audioContext){audioContext.close().catch(()=>{});audioContext=null;masterGain=null;}
    soundBtn.textContent="♫ Ligar som";
    soundBtn.setAttribute("aria-pressed","false");
  };
  const startSound=async()=>{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx){soundBtn.textContent="Som indisponível";soundBtn.disabled=true;return;}
    try{
      audioContext=new Ctx();
      masterGain=audioContext.createGain();masterGain.gain.value=Number(volume.value)/100*.22;
      masterGain.connect(audioContext.destination);
      await audioContext.resume();
      const tick=()=>{playNote(tune[step%tune.length]);step++;};
      tick();melodyTimer=window.setInterval(tick,630);
      soundBtn.textContent="♫ Desligar som";
      soundBtn.setAttribute("aria-pressed","true");
    }catch(_){stopSound();}
  };
  if(soundBtn)soundBtn.addEventListener("click",()=>melodyTimer===null?startSound():stopSound());
  if(volume)volume.addEventListener("input",()=>{if(masterGain)masterGain.gain.value=Number(volume.value)/100*.22;});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&melodyTimer!==null)stopSound();});
})();
