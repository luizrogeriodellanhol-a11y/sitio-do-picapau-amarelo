# Etapa atual — Experiência sem banco de dados

O site foi simplificado: **o PostgreSQL, login administrativo e ORM foram retirados da execução** por decisão do projeto. O Web Service Flask apenas entrega a página e os arquivos; o site também pode ser publicado como Static Site.

- O código da interface está no `index.html` e `static/`.
- As informações editáveis do espetáculo ficam em `static/conteudo.json`.
- `/health` retorna o estado do servidor Python.
- `/admin` e `/admin/login` informam que não existe mais edição por painel.
- `/api/site` apenas disponibiliza o conteúdo estático por compatibilidade.
- `DATABASE_URL`, `SECRET_KEY` e `ADMIN_PASSWORD` não são mais utilizados; depois de conferir que este código está publicado, essas variáveis antigas podem ser excluídas do serviço Render.
- A publicação atual pode ser conferida em `TESTES.md`.

**Importante:** dados armazenados no banco antigo não migram automaticamente para o arquivo JSON. Preencha os textos confirmados em `static/conteudo.json` via GitHub. O progresso dos jogos fica só no navegador de cada visitante.
