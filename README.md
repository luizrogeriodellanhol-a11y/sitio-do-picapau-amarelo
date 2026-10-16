# Uma Viagem ao Sítio — Culminância Teatral

Site responsivo e interativo para a culminância escolar inspirada no universo do Sítio do Picapau Amarelo.

## Funcionalidades
- Página inicial temática com navegação adaptada para celular.
- Cartões de personagens com descrições e intérpretes provisórios.
- Área de história com texto provisório.
- Quiz com pontuação e feedback.
- Segredos clicáveis.
- Galeria com pré-visualização local de fotos e vídeos.
- Créditos e agradecimentos.
- Sem dependências de build: HTML, CSS e JavaScript puros.

## Publicar pelo GitHub + Render
1. Crie um repositório novo no GitHub chamado `sitio-encantado`.
2. Envie `index.html`, `render.yaml` e `README.md` para a raiz do repositório.
3. No Render, escolha **New + → Static Site** e conecte o repositório.
4. O Render deve detectar o arquivo `render.yaml`; se pedir configuração manual, use:
   - Build Command: deixe vazio
   - Publish Directory: `.`
5. Publique. Nas configurações do serviço, confira se o repositório e a branch `main` estão conectados para deploy automático a cada commit.

## Editar o conteúdo
Abra `index.html` e procure por `const siteContent = {` perto do final do arquivo. Ali estão os dados provisórios:
- `eventDate` e `eventPlace`
- `characters`
- `quiz`
- `secrets`

A estrutura visual está no bloco `<style>` e as seções da página ficam no `<body>`.

## Limitação importante da galeria
O seletor de arquivos cria uma pré-visualização somente no navegador do visitante. Os arquivos não são enviados nem salvos no servidor. Para uma galeria pública persistente, será necessário integrar um serviço de armazenamento e configurar permissões.

## Privacidade
Antes de publicar fotos, vídeos ou nomes completos de estudantes, confirme a autorização da escola e dos responsáveis. Não coloque senhas, tokens ou dados privados neste repositório.
