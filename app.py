"""Servidor simples do Sítio — sem banco de dados, contas ou senhas.

O conteúdo público e todos os jogos são carregados diretamente de arquivos.
Este arquivo mantém compatibilidade com o Web Service Python já criado no Render.
"""
from pathlib import Path

from flask import Flask, jsonify, send_file

ROOT = Path(__file__).resolve().parent
app = Flask(__name__, static_folder="static", static_url_path="/static")
app.config["JSON_AS_ASCII"] = False


@app.get("/")
def inicio():
    return send_file(ROOT / "index.html")


@app.get("/health")
def health():
    return jsonify(status="ok", storage="none")


@app.get("/api/site")
def dados_publicos():
    """Compatibilidade com a versão anterior — arquivo local, sem consultas externas."""
    return send_file(ROOT / "static" / "conteudo.json", mimetype="application/json")


@app.get("/admin")
@app.get("/admin/login")
def painel_antigo():
    return (
        '<!doctype html><html lang="pt-BR"><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>O Sítio é uma aventura!</title>'
        '<body style="max-width:620px;margin:8vh auto;padding:26px;'
        'font:20px Georgia,sans-serif;background:#f9eed4;color:#284c35">'
        '<h1>📖 O Sítio continua encantado!</h1>'
        '<p>O painel de edição foi desativado porque o projeto não utiliza '
        'mais banco de dados. Os jogos, capítulos e interações continuam '
        'disponíveis normalmente.</p><p><a href="/">🌻 Entrar no Sítio</a></p>'
        '</body></html>',
        200,
        {"Cache-Control": "no-store"},
    )


if __name__ == "__main__":
    app.run(debug=False)
