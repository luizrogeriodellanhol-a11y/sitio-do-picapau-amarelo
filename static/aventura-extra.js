
(() => {
  "use strict";
  const byId=(id)=>document.getElementById(id);

  // Caça aos objetos: sem coleta de nomes, contas ou pontuação online.
  const objects=Array.from(document.querySelectorAll(".object-target[data-object]"));
  const objectProgress=byId("objectProgress");
  const objectReward=byId("objectReward");
  const found=new Set();
  function updateObjects(){
    if(objectProgress)objectProgress.textContent=found.size+" de "+objects.length+" objetos encontrados";
    if(objectReward)objectReward.hidden=found.size!==objects.length;
    objects.forEach((button)=>{
      const collected=found.has(button.dataset.object);
      button.classList.toggle("is-found",collected);
      button.setAttribute("aria-pressed",String(collected));
      button.disabled=collected;
      if(collected)button.setAttribute("aria-label","Objeto encontrado: "+button.dataset.object);
    });
  }
  objects.forEach(button=>button.addEventListener("click",()=>{
    found.add(button.dataset.object);
    updateObjects();
    if(found.size===objects.length)document.dispatchEvent(new CustomEvent("sitio:conquista",{detail:"objetos"}));
  }));
  byId("objectRestart")?.addEventListener("click",()=>{
    found.clear();
    updateObjects();
    objects[0]?.focus();
  });
  updateObjects();

  // Conversa curta com escolhas: brincadeira original, sem revelar o desfecho da peça.
  const steps=[
    {
      avatar:"🪆",speaker:"Emília",
      line:"Encontrei um pergaminho misterioso! Você quer me ajudar a investigar?",
      choices:[
        {text:"🌳 Vamos primeiro à floresta!",avatar:"🍃",speaker:"Saci",answer:"Eu conheço umas trilhas... Mas cada passo pode trazer uma surpresa!"},
        {text:"🥧 Vamos perguntar à Tia Nastácia!",avatar:"🥧",speaker:"Tia Nastácia",answer:"Uma aventura? Primeiro, levem um lanche! Não quero ninguém com fome pela floresta."}
      ]
    },
    {
      avatar:"🌽",speaker:"Visconde de Sabugosa",
      line:"O pergaminho parece guardar uma pista. Qual é o melhor jeito de entendê-la?",
      choices:[
        {text:"📚 Ler juntos e trocar ideias.",avatar:"🌽",speaker:"Visconde",answer:"Excelente! Conhecimento fica ainda melhor quando compartilhamos."},
        {text:"🔎 Observar cada detalhe.",avatar:"🧭",speaker:"Pedrinho",answer:"Boa ideia! Às vezes a menor pista nos leva à maior aventura."}
      ]
    },
    {
      avatar:"🐊",speaker:"Cuca",
      line:"Ora, ora! Vocês estão se divertindo sem mim? O que dizem?",
      choices:[
        {text:"🤝 Venha conhecer nossa equipe!",avatar:"🐊",speaker:"Cuca",answer:"Humm... Nunca me convidam assim! Que história curiosa."},
        {text:"✨ Podemos imaginar uma nova aventura!",avatar:"🪆",speaker:"Emília",answer:"Uma ideia brilhante! Aqui cabe mais de uma história."}
      ]
    }
  ];
  const line=byId("dialogueLine");
  const avatar=byId("dialogueAvatar");
  const speaker=byId("dialogueSpeaker");
  const options=byId("dialogueOptions");
  const restart=byId("dialogueRestart");
  const result=byId("dialogueResult");
  let stage=0;
  function setDialogue(a,b,c){
    if(avatar)avatar.textContent=a;
    if(speaker)speaker.textContent=b;
    if(line)line.textContent=c;
  }
  function button(label,action){
    const b=document.createElement("button");b.type="button";b.className="dialogue-option";
    b.textContent=label;b.addEventListener("click",action);return b;
  }
  function drawStage(){
    if(!options)return;
    options.replaceChildren();
    if(stage>=steps.length){
      setDialogue("📖","Narradores","E assim, com muitas ideias e imaginação, sua aventura continua! Que tal visitar outros cantinhos do Sítio?");
      if(result){result.hidden=false;result.textContent="🌟 Missão concluída! Você mostrou que uma boa história fica ainda melhor com curiosidade e amizade.";}
      if(restart)restart.hidden=false;
      document.dispatchEvent(new CustomEvent("sitio:conquista",{detail:"dialogo"}));
      return;
    }
    const step=steps[stage];
    setDialogue(step.avatar,step.speaker,step.line);
    step.choices.forEach(choice=>{
      options.append(button(choice.text,()=>{
        setDialogue(choice.avatar,choice.speaker,choice.answer);
        options.replaceChildren(button(stage===steps.length-1?"✨ Ver minha surpresa":"➡️ Continuar a história",()=>{
          stage++;drawStage();
        }));
      }));
    });
  }
  restart?.addEventListener("click",()=>{stage=0;restart.hidden=true;if(result)result.hidden=true;drawStage();});
  drawStage();
})();
