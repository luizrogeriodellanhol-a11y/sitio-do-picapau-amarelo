# Sítio do Picapau Amarelo — Livro Encantado 🌻

Site de aventura lúdica para crianças e adolescentes, inspirado na peça escolar **Uma Aventura Mágica**. Sem banco de dados, sem cadastro, sem coleta de nomes ou ranking público.

## O que funciona
- Capa animada de livro com botão para pular e reabrir;
- Navegação em capítulos, cena ilustrada, mapa com locais para explorar;
- Personagens com curiosidades, quiz, jogo da memória, selos e passaporte mágico;
- Caça aos objetos, história com escolhas, palavras embaralhadas, sombras, quebra-cabeça, gerador de histórias;
- Escolha de um guia, curiosidades dobráveis e álbum de conquistas;
- Controles de volume, letras maiores, contraste, menos movimento e voltar ao topo;
- Galeria e créditos com espaços para conteúdo autorizado.

**As conquistas são salvas apenas no navegador da pessoa, por meio de armazenamento local, sem servidor.** Limpar os dados de navegação apaga esse progresso.

## Publicação (dois formatos compatíveis)
O projeto possui dois serviços Render porque foi criado assim anteriormente:
1. **Web Service Python existente**: `pip install -r requirements.txt` e `gunicorn app:app`, sem nenhuma variável obrigatória ou banco.
2. **Static Site**: raiz `.` como diretório de publicação, sem build. O arquivo `render.yaml` descreve essa opção estática.

As duas versões usam os mesmos arquivos de interface. Na publicação, use o endereço do serviço que quer compartilhar. Evite confundir com o site antigo.

## Como mudar textos e imagens sem banco
- Abra `static/conteudo.json` no GitHub para editar título, mensagem de boas-vindas, sinopse, data e local, créditos, intérpretes e links de três fotos.
- Abra `index.html` para mudar a estrutura da página, personagens ou perguntas.
- Estilos: `static/encantamento.css` e `static/novidades.css`.
- Interações: `static/encantamento.js`, `static/aventura-extra.js` e `static/novidades.js`.
- Ilustração original: `static/cenario-encantado.svg`.

O painel administrativo anterior está desativado e mostra um aviso. **Não é possível salvar edições feitas no navegador para todos os visitantes sem uma forma de publicação/autenticação.** As alterações públicas são feitas por commit no GitHub.

## Segurança e cuidado com os estudantes
- Não adicione senhas, tokens ou informações privadas a arquivos públicos.
- Só publique nomes e imagens com as autorizações adequadas.
- A música é opcional, feita por síntese no dispositivo, e começa desligada.
- As histórias e brincadeiras são independentes do banco de dados.

Veja `TESTES.md` para o roteiro de verificação antes de divulgar.
