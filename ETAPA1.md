# Sítio do Picapau Amarelo — Etapa 1

Site da culminância teatral. A página original `index.html` foi preservada.

## Backend
- `app.py`: Flask, PostgreSQL, login único, CSRF, configurações e registros.
- `templates/admin.html`: painel de informações do espetáculo.
- `/admin/login`: login; `/admin`: edição; `/api/site`: dados públicos; `/health`: saúde do serviço.

## Configuração no Render
Criar **Web Service** Python apontando para este repositório (não alterar outro projeto).
- Build: `pip install -r requirements.txt`
- Start: `gunicorn app:app`
- `DATABASE_URL`: URL interna do PostgreSQL existente, se reutilizado (as tabelas do Sítio têm prefixo `sitio_`; confirme que não há conflitos).
- `SECRET_KEY`: string aleatória de no mínimo 32 caracteres
- `ADMIN_PASSWORD`: uma senha exclusiva e forte (guarde apenas no painel de variáveis de ambiente do Render; não compartilhe no chat ou GitHub).
- Alternativa avançada: `ADMIN_PASSWORD_HASH` com hash do Werkzeug tem prioridade se ambas estiverem configuradas.
- `COOKIE_SECURE=true` no HTTPS do Render.

**Não publique senhas, hashes ou URLs privadas no GitHub.**

## Observações
- Esta entrega é a **fundação**: o painel salva dados, mas a página pública ainda não consome `/api/site`; integração visual é a próxima tarefa.
- A galeria persistente, upload, música e animações novas ainda não estão implementados.
- `db.create_all()` cria as tabelas iniciais; antes de evoluir o esquema, adotar migrações.
- Para produção pública, adicionar limite de tentativas de login (preferencialmente com armazenamento compartilhado), monitoramento e backup.
