
/* Novidades do Sítio: experiências locais, gratuitas e sem banco de dados. */
(() => {
  "use strict";
  const $=(id)=>document.getElementById(id);
  const key="sitio-conquistas-v2";
  const read=(k,fallback)=>{try{return localStorage.getItem(k)??fallback}catch(_){return fallback}};
  const write=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
  const shuffle=(array)=>{const result=array.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
  const emit=(id)=>document.dispatchEvent(new CustomEvent("sitio:conquista",{detail:id}));
  const achievements=[
    {id:"guia",emoji:"🧭",title:"Companheiro de viagem",hint:"Escolha quem vai te acompanhar"},
    {id:"curioso",emoji:"🔎",title:"Explorador curioso",hint:"Abra seis curiosidades"},
    {id:"quiz",emoji:"🧠",title:"Amigo do Visconde",hint:"Termine o quiz"},
    {id:"memoria",emoji:"🃏",title:"Memória encantada",hint:"Complete todos os pares"},
    {id:"selos",emoji:"🗝️",title:"Colecionador mágico",hint:"Encontre os quatro selos"},
    {id:"objetos",emoji:"✨",title:"Caçador de tesouros",hint:"Encontre os cinco objetos"},
    {id:"dialogo",emoji:"💬",title:"Bom contador",hint:"Conclua a história com escolhas"},
    {id:"palavras",emoji:"📜",title:"Mestre das palavras",hint:"Decifre cinco palavras"},
    {id:"sombras",emoji:"🌙",title:"Olhos de águia",hint:"Jogue cinco rodadas de sombras"},
    {id:"quebra",emoji:"🏡",title:"Montador do Sítio",hint:"Resolva o quebra-cabeça"},
    {id:"inventor",emoji:"🪄",title:"Inventor de aventuras",hint:"Crie sua própria história"}
  ];
  let done = new Set();
  try{const parsed=JSON.parse(read(key,"[]"));if(Array.isArray(parsed))done=new Set(parsed.filter(s=>typeof s==="string"))}catch(_){}
  const renderAchievements=()=>{
    const grid=$("achievementGrid");if(!grid)return;
    grid.replaceChildren();
    const amount=achievements.filter(a=>done.has(a.id)).length;
    achievements.forEach(a=>{
      const card=document.createElement("article");
      card.className="achievement "+(done.has(a.id)?"is-unlocked":"is-locked");
      const icon=document.createElement("span");icon.className="achievement-icon";icon.textContent=done.has(a.id)?a.emoji:"🔒";
      const title=document.createElement("h3");title.textContent=a.title;
      const p=document.createElement("p");p.textContent=done.has(a.id)?"Conquistado!":a.hint;
      card.append(icon,title,p);grid.appendChild(card);
    });
    const counter=$("badgeCounter");if(counter)counter.textContent=amount+" de "+achievements.length+" conquistas";
    const progress=$("badgeProgress");if(progress){progress.max=achievements.length;progress.value=amount;progress.setAttribute("aria-label",amount+" de "+achievements.length+" conquistas");}
    const celebration=$("badgeCelebration");if(celebration)celebration.hidden=amount!==achievements.length;
  };
  const award=(id)=>{
    if(!achievements.some(a=>a.id===id)||done.has(id))return;
    done.add(id);write(key,JSON.stringify([...done]));renderAchievements();
    const toast=$("toast");
    if(toast){toast.textContent="🌟 Nova conquista desbloqueada! Veja seu passaporte.";toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600);}
  };
  document.addEventListener("sitio:conquista",event=>award(event.detail));
  renderAchievements();

  // Acessibilidade: preferências locais.
  const body=document.body,root=document.documentElement;
  const settings={
    big:{button:"bigText",apply:()=>root.classList.toggle("big-type"),active:()=>root.classList.contains("big-type")},
    contrast:{button:"contrastToggle",apply:()=>body.classList.toggle("high-contrast"),active:()=>body.classList.contains("high-contrast")},
    motion:{button:"motionToggle",apply:()=>body.classList.toggle("less-motion"),active:()=>body.classList.contains("less-motion")}
  };
  Object.entries(settings).forEach(([name,info])=>{
    if(read("sitio-pref-"+name,"0")==="1")info.apply();
    const button=$(info.button);if(!button)return;
    const refresh=()=>button.setAttribute("aria-pressed",String(info.active()));
    button.addEventListener("click",()=>{info.apply();write("sitio-pref-"+name,info.active()?"1":"0");refresh();});
    refresh();
  });
  const progress=$("scrollProgress"),back=$("backTop");
  function updateScroll(){
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const proportion=max>0?Math.max(0,Math.min(1,window.scrollY/max)):0;
    if(progress)progress.style.width=(proportion*100).toFixed(1)+"%";
    if(back)back.hidden=window.scrollY<500;
  }
  window.addEventListener("scroll",updateScroll,{passive:true});
  window.addEventListener("resize",updateScroll);
  back?.addEventListener("click",()=>window.scrollTo({top:0,behavior:body.classList.contains("less-motion")?"auto":"smooth"}));
  updateScroll();

  // Escolha um guia sem cadastro ou informações pessoais.
  const guides={
    emilia:{name:"Emília",icon:"🪆",message:"Emília diz: ideias malucas podem virar aventuras incríveis! Explore o Sítio com coragem e curiosidade."},
    visconde:{name:"Visconde",icon:"🌽",message:"Visconde diz: cada descoberta fica melhor quando aprendemos algo novo."},
    saci:{name:"Saci",icon:"🍃",message:"Saci diz: aposto que você não consegue encontrar todos os segredos escondidos!"},
    narizinho:{name:"Narizinho",icon:"🌷",message:"Narizinho diz: o mundo está cheio de maravilhas. Vamos descobrir uma por uma!"}
  };
  function selectGuide(id){
    const guide=guides[id];if(!guide)return;
    write("sitio-guia-v1",id);
    document.querySelectorAll("[data-guide]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.guide===id)));
    const msg=$("guideMessage");if(msg)msg.textContent=guide.icon+" "+guide.message;
    award("guia");
  }
  document.querySelectorAll("[data-guide]").forEach(button=>button.addEventListener("click",()=>selectGuide(button.dataset.guide)));
  const savedGuide=read("sitio-guia-v1","");
  if(guides[savedGuide])selectGuide(savedGuide);

  // Jogo 1: palavras embaralhadas.
  const words=[
    {word:"AMIZADE",clue:"O que torna uma aventura melhor quando compartilhada?"},
    {word:"FLORESTA",clue:"Onde a turma encontra segredos no caminho?"},
    {word:"LIVROS",clue:"O que Dona Benta gosta de compartilhar?"},
    {word:"IMAGINACAO",clue:"Uma força que cria mundos e histórias (sem acento)."},
    {word:"PERGAMINHO",clue:"O objeto misterioso encontrado perto da floresta."}
  ];
  let wordIndex=0,letterOrder=[],chosen=[];
  const wordLetters=$("wordLetters"),wordSlots=$("wordSlots"),wordMsg=$("wordMessage");
  function drawWord(){
    if(!wordLetters||!wordSlots)return;
    const entry=words[wordIndex];
    const clue=$("wordClue");if(clue)clue.textContent=entry.clue;
    const n=$("wordNumber");if(n)n.textContent="Palavra "+(wordIndex+1)+" de "+words.length;
    if(wordMsg)wordMsg.textContent="Escolha as letras na ordem certa!";
    const next=$("wordNext");if(next){next.disabled=true;next.textContent=wordIndex===words.length-1?"Ver resultado":"Próxima palavra →";}
    chosen=[];
    letterOrder=shuffle(entry.word.split("").map((letter,i)=>({letter,id:i})));
    wordLetters.replaceChildren();
    letterOrder.forEach(({letter,id})=>{
      const b=document.createElement("button");b.type="button";b.textContent=letter;
      b.dataset.letterId=String(id);b.setAttribute("aria-label","Adicionar letra "+letter);
      b.addEventListener("click",()=>{
        if(chosen.includes(id)||next?.disabled===false)return;
        chosen.push(id);refreshWord();
      });wordLetters.appendChild(b);
    });
    refreshWord();
  }
  function refreshWord(){
    const entry=words[wordIndex];if(!entry||!wordSlots||!wordLetters)return;
    const typed=chosen.map(id=>entry.word[id]).join("");
    wordSlots.replaceChildren();
    for(let i=0;i<entry.word.length;i++){
      const span=document.createElement("span");span.className="word-slot";span.textContent=typed[i]||"·";
      wordSlots.appendChild(span);
    }
    [...wordLetters.children].forEach(b=>{b.disabled=chosen.includes(Number(b.dataset.letterId))});
    if(chosen.length!==entry.word.length)return;
    if(typed===entry.word){
      if(wordMsg)wordMsg.textContent="🎉 Acertou! Excelente descoberta!";
      if($("wordNext"))$("wordNext").disabled=false;
    }else if(wordMsg)wordMsg.textContent="Quase! Use o botão de voltar ou tente novamente.";
  }
  $("wordUndo")?.addEventListener("click",()=>{if(chosen.length){chosen.pop();refreshWord();if(wordMsg)wordMsg.textContent="Tente encontrar a ordem correta.";}});
  $("wordReset")?.addEventListener("click",drawWord);
  $("wordNext")?.addEventListener("click",()=>{
    if(wordIndex===words.length-1){award("palavras");wordIndex=0;drawWord();if(wordMsg)wordMsg.textContent="🏆 Você descobriu todas as palavras! Pode jogar novamente.";return;}
    wordIndex++;drawWord();
  });
  drawWord();

  // Jogo 2: sombras de personagens, cinco rodadas.
  const shadows=[
    {name:"Emília",icon:"🪆"},{name:"Saci",icon:"🍃"},{name:"Visconde",icon:"🌽"},
    {name:"Rabicó",icon:"🐷"},{name:"Cuca",icon:"🐊"},{name:"Narizinho",icon:"🌷"},
    {name:"Dona Benta",icon:"📚"},{name:"Tia Nastácia",icon:"🥧"}
  ];
  let shadowDeck=[],shadowIndex=0,shadowScore=0,shadowAnswered=false;
  function newShadows(){shadowDeck=shuffle(shadows).slice(0,5);shadowIndex=0;shadowScore=0;drawShadow();}
  function drawShadow(){
    const options=$("shadowChoices");if(!options)return;
    options.replaceChildren();shadowAnswered=false;
    const item=shadowDeck[shadowIndex],figure=$("shadowFigure"),figureIcon=$("shadowIcon");
    if(figure)figure.classList.remove("revealed");
    if(figureIcon)figureIcon.textContent=item.icon;
    const counter=$("shadowCounter");if(counter)counter.textContent="Rodada "+(shadowIndex+1)+" de 5 · Acertos: "+shadowScore;
    const message=$("shadowMessage");if(message)message.textContent="Quem será? Escolha uma opção.";
    const next=$("shadowNext");if(next){next.hidden=true;next.textContent=shadowIndex===4?"Ver resultado":"Próxima sombra →";}
    const distractors=shuffle(shadows.filter(v=>v.name!==item.name)).slice(0,3);
    shuffle([item,...distractors]).forEach(answer=>{
      const button=document.createElement("button");button.type="button";button.textContent=answer.name;
      button.addEventListener("click",()=>{
        if(shadowAnswered)return;
        shadowAnswered=true;if(figure)figure.classList.add("revealed");
        if(answer.name===item.name){shadowScore++;button.classList.add("correct");}
        else button.classList.add("wrong");
        [...options.children].forEach(b=>{b.disabled=true;if(b.textContent===item.name)b.classList.add("correct")});
        if(message)message.textContent=answer.name===item.name?"🌟 Você descobriu a sombra!":"Era "+item.name+"! Vamos à próxima.";
        if(next)next.hidden=false;
      });options.appendChild(button);
    });
  }
  $("shadowNext")?.addEventListener("click",()=>{
    if(shadowIndex===4){
      const finalScore=shadowScore;award("sombras");newShadows();
      if($("shadowMessage"))$("shadowMessage").textContent="🎉 Você acertou "+finalScore+" de 5! Vamos jogar novamente.";
      return;
    }
    shadowIndex++;drawShadow();
  });
  $("shadowRestart")?.addEventListener("click",newShadows);
  newShadows();

  // Jogo 3: quebra-cabeça com nove peças.
  let puzzle=[],selected=null,puzzleMoves=0,puzzleSolved=false;
  const puzzleBoard=$("puzzleBoard");
  function newPuzzle(){
    puzzle=shuffle([0,1,2,3,4,5,6,7,8]);
    if(puzzle.every((v,i)=>v===i)) [puzzle[0],puzzle[1]]=[puzzle[1],puzzle[0]];
    selected=null;puzzleMoves=0;puzzleSolved=false;drawPuzzle();
    if($("puzzleMessage"))$("puzzleMessage").textContent="Toque em duas peças para trocar de lugar!";
  }
  function drawPuzzle(){
    if(!puzzleBoard)return;
    puzzleBoard.replaceChildren();puzzleBoard.classList.toggle("is-solved",puzzleSolved);
    if($("puzzleCounter"))$("puzzleCounter").textContent="Trocas: "+puzzleMoves;
    puzzle.forEach((tile,index)=>{
      const button=document.createElement("button");button.type="button";
      button.className="puzzle-piece"+(selected===index?" is-selected":"");
      button.style.backgroundPosition=((tile%3)*50)+"% "+(Math.floor(tile/3)*50)+"%";
      button.setAttribute("aria-label","Peça na posição "+(index+1)+(selected===index?". Selecionada.":". Selecionar para trocar."));
      button.setAttribute("aria-pressed",String(selected===index));
      button.addEventListener("click",()=>{
        if(puzzleSolved)return;
        if(selected===null){selected=index;drawPuzzle();puzzleBoard.children[index]?.focus();return;}
        if(selected===index){selected=null;drawPuzzle();puzzleBoard.children[index]?.focus();return;}
        [puzzle[selected],puzzle[index]]=[puzzle[index],puzzle[selected]];
        selected=null;puzzleMoves++;puzzleSolved=puzzle.every((v,i)=>v===i);drawPuzzle();
        if(puzzleSolved){
          if($("puzzleMessage"))$("puzzleMessage").textContent="🏡 Você remontou o Sítio! Excelente trabalho!";
          emit("quebra");
        }else if($("puzzleMessage"))$("puzzleMessage").textContent="Boa tentativa! Continue trocando as peças.";
        puzzleBoard.children[index]?.focus();
      });puzzleBoard.appendChild(button);
    });
  }
  $("puzzleRestart")?.addEventListener("click",newPuzzle);
  $("puzzlePeek")?.addEventListener("click",()=>{
    if(!puzzleBoard)return;
    const pressed=puzzleBoard.classList.toggle("is-peeking");
    $("puzzlePeek").setAttribute("aria-pressed",String(pressed));
    $("puzzlePeek").textContent=pressed?"👀 Esconder dica":"👁️ Ver a imagem";
    const preview=$("puzzlePreview");if(preview)preview.hidden=!pressed;
  });
  newPuzzle();

  // Jogo 4: gerador de pequenas histórias originais.
  const places={casa:"na varanda da casa amarela",floresta:"em uma trilha escondida na floresta",cozinha:"na cozinha cheirando a bolinho",jardim:"no jardim cheio de borboletas"};
  const companions={emilia:"Emília",saci:"Saci",visconde:"Visconde",rabico:"Rabicó"};
  const treasures={pergaminho:"um pergaminho cheio de desenhos",chave:"uma chave dourada",livro:"um livro de páginas brilhantes",flor:"uma flor que muda de cor"};
  const endings=[
    "Juntos, descobriram que uma boa ideia pode nascer de uma pergunta simples.",
    "No caminho, aprenderam que a amizade transforma qualquer passeio em aventura.",
    "No fim, perceberam que a imaginação abre portas que ninguém sabia que existiam.",
    "E foi assim que uma surpresa se tornou uma história para contar muitas vezes."
  ];
  let storyCount=0;
  $("createStory")?.addEventListener("click",()=>{
    const where=places[$("storyWhere")?.value]||places.jardim;
    const who=companions[$("storyWho")?.value]||companions.emilia;
    const what=treasures[$("storyWhat")?.value]||treasures.livro;
    const ending=endings[storyCount%endings.length];storyCount++;
    const tale="Era uma vez "+who+", que encontrou "+what+" "+where+". De repente, o objeto começou a brilhar e uma voz misteriosa sussurrou: 'Sua aventura começa quando você faz uma escolha!' "+who+" decidiu chamar os amigos para investigar. "+ending;
    const container=$("storyOutput");if(!container)return;
    container.hidden=false;container.replaceChildren();
    const title=document.createElement("h4");title.textContent="📖 Uma história só sua";
    const p=document.createElement("p");p.textContent=tale;container.append(title,p);award("inventor");
  });

  // Curiosidades em páginas dobráveis.
  const opened=new Set();
  try{const parsed=JSON.parse(read("sitio-curiosidades-v1","[]"));if(Array.isArray(parsed))parsed.forEach(id=>opened.add(id));}catch(_){}
  function updateFacts(){
    const counter=$("factsCounter");
    if(counter)counter.textContent=opened.size+" de "+document.querySelectorAll(".discovery-item").length+" descobertas abertas";
    if(opened.size>=6)award("curioso");
  }
  document.querySelectorAll(".discovery-item").forEach(item=>{
    item.addEventListener("toggle",()=>{
      if(!item.open||!item.id)return;
      opened.add(item.id);write("sitio-curiosidades-v1",JSON.stringify([...opened]));updateFacts();
    });
  });
  updateFacts();

  // Integração com atividades anteriores.
  const visitedPeople=new Set();
  document.addEventListener("click",event=>{
    const button=event.target.closest?.(".funfact-btn");
    if(!button||button.getAttribute("aria-expanded")!=="true")return;
    const name=button.closest(".character")?.querySelector("h3")?.textContent?.trim();
    if(name){visitedPeople.add(name);if(visitedPeople.size>=6)award("curioso");}
  });
  try{
    const seals=JSON.parse(read("sitio-selos-v1","{}"));
    if(seals&&Object.keys(seals).filter(k=>seals[k]).length>=4)award("selos");
  }catch(_){}
  $("resetBadges")?.addEventListener("click",()=>{
    if(!window.confirm("Recomeçar conquistas e selos deste navegador? Isso não apaga o site."))return;
    for(const k of [key,"sitio-selos-v1","sitio-guia-v1","sitio-curiosidades-v1"]){try{localStorage.removeItem(k)}catch(_){}}
    location.reload();
  });
  $("printBadges")?.addEventListener("click",()=>window.print());
})();
