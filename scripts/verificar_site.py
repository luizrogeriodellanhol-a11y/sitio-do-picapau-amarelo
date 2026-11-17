"""Verificações locais básicas do Sítio (sem banco de dados)."""
import json
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class SiteHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.anchors = []
        self.assets = []
        self.inline_scripts = []
        self._in_script = False
        self._current_script = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("href", "").startswith("#"):
            self.anchors.append(attrs["href"][1:])
        if tag == "link" and attrs.get("href", "").startswith("/static/"):
            self.assets.append(attrs["href"])
        if tag == "script":
            src = attrs.get("src")
            if src and src.startswith("/static/"):
                self.assets.append(src)
            if src is None:
                self._in_script = True
                self._current_script = []

    def handle_data(self, data):
        if self._in_script:
            self._current_script.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._in_script:
            self.inline_scripts.append("".join(self._current_script))
            self._in_script = False


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    page = (ROOT / "index.html").read_text(encoding="utf-8")
    parser = SiteHTML()
    parser.feed(page)
    check(len(parser.ids) == len(set(parser.ids)), "Existem IDs repetidos no HTML.")
    for anchor in parser.anchors:
        check(anchor in parser.ids, "Link interno sem destino: #" + anchor)
    for asset in parser.assets:
        check((ROOT / asset.lstrip("/")).exists(), "Arquivo estático não encontrado: " + asset)
    for key in ("bookGate", "questToggle", "wordLetters", "shadowChoices", "puzzleBoard",
                "achievementGrid", "createStory", "objectProgress", "dialogueOptions"):
        check(key in parser.ids, "Componente importante ausente: " + key)
    check("6º ano" not in page, "Referência indevida à série escolar na página.")

    config = json.loads((ROOT / "static" / "conteudo.json").read_text(encoding="utf-8"))
    check(isinstance(config, dict) and isinstance(config.get("play_title"), str),
          "Configuração JSON inválida.")
    requirements = (ROOT / "requirements.txt").read_text(encoding="utf-8")
    app_source = (ROOT / "app.py").read_text(encoding="utf-8")
    for old in ("Flask-SQLAlchemy", "psycopg", "DATABASE_URL"):
        check(old not in requirements + app_source, "Dependência antiga de banco: " + old)

    for path in sorted((ROOT / "static").glob("*.js")):
        subprocess.run(["node", "--check", str(path)], check=True)
    for index, content in enumerate(parser.inline_scripts):
        with tempfile.TemporaryDirectory() as tmp:
            js = Path(tmp) / ("inline_" + str(index) + ".js")
            js.write_text(content, encoding="utf-8")
            subprocess.run(["node", "--check", str(js)], check=True)

    from app import app
    client = app.test_client()
    for url in ("/", "/health", "/static/conteudo.json", "/static/novidades.js",
                "/static/novidades.css", "/static/cenario-encantado.svg", "/admin/login"):
        response = client.get(url)
        check(response.status_code == 200, "Falha de servidor: " + url)
    check(client.get("/health").json["storage"] == "none", "Servidor exige armazenamento.")

    print("OK: HTML, links, arquivos, JavaScript, JSON e rotas Flask sem banco.")


if __name__ == "__main__":
    main()
