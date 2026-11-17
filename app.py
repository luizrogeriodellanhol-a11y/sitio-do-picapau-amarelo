import os
import secrets
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path

from flask import Flask, abort, jsonify, redirect, render_template, request, send_file, session, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

BASE = Path(__file__).resolve().parent
db = SQLAlchemy()

class Setting(db.Model):
    __tablename__ = 'sitio_settings'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(80), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=False, default="")

class AuditLog(db.Model):
    __tablename__ = 'sitio_audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

FIELDS = {
    "play_title": "Título da peça",
    "event_date": "Data do espetáculo",
    "event_time": "Horário",
    "event_location": "Local",
    "welcome": "Mensagem de boas-vindas",
    "synopsis": "Sinopse da história",
    "gallery_title_1": "Bastidores — título da foto",
    "gallery_url_1": "Bastidores — link direto da imagem HTTPS",
    "gallery_title_2": "Cenários e figurinos — título da foto",
    "gallery_url_2": "Cenários e figurinos — link direto da imagem HTTPS",
    "gallery_title_3": "Dia da apresentação — título da foto",
    "gallery_url_3": "Dia da apresentação — link direto da imagem HTTPS",
    "credits_cast": "Agradecimentos ao elenco",
    "credits_orientation": "Agradecimentos à orientação",
    "credits_production": "Agradecimentos à produção",
    "actor_0": "Narrador(a) 1 — intérprete",
    "actor_1": "Narrador(a) 2 — intérprete",
    "actor_2": "Dona Benta — intérprete",
    "actor_3": "Tia Nastácia — intérprete",
    "actor_4": "Narizinho — intérprete",
    "actor_5": "Pedrinho — intérprete",
    "actor_6": "Emília — intérprete",
    "actor_7": "Visconde de Sabugosa — intérprete",
    "actor_8": "Rabicó — intérprete",
    "actor_9": "Saci — intérprete",
    "actor_10": "Cuca — intérprete",
}

# Valores iniciais do roteiro; configurações já salvas pelo administrador prevalecem.
DEFAULT_FIELD_VALUES = {
    "play_title": "O Sítio do Picapau Amarelo",
    "synopsis": "Um dia tranquilo no Sítio muda quando Narizinho e Pedrinho encontram um pergaminho misterioso perto da floresta. Ao lado de Emília e Visconde, eles partem em busca de respostas e encontram personagens inesperados pelo caminho. Mas o que será preciso para desvendar esse segredo?",
}

def create_app():
    app = Flask(__name__, template_folder=str(BASE / "templates"))
    secret = os.environ.get("SECRET_KEY")
    if not secret or len(secret) < 32:
        raise RuntimeError("Configure SECRET_KEY com pelo menos 32 caracteres.")
    app.secret_key = secret
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("Configure DATABASE_URL do PostgreSQL.")
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    app.config.update(
        SQLALCHEMY_DATABASE_URI=url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("COOKIE_SECURE", "true").lower() == "true",
        MAX_CONTENT_LENGTH=1024 * 1024,
    )
    db.init_app(app)
    with app.app_context():
        db.create_all()

    def authenticated(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not session.get("admin"):
                return redirect(url_for("login"))
            return fn(*args, **kwargs)
        return wrapper

    def valid_csrf():
        return secrets.compare_digest(str(session.get("csrf", "")), str(request.form.get("csrf", ""))) and bool(session.get("csrf"))

    @app.after_request
    def headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"] = "no-store" if request.path.startswith("/admin") else "public, max-age=300"
        return response

    @app.get("/")
    def home():
        return send_file(BASE / "index.html")

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    @app.get("/api/site")
    def public_site():
        return jsonify({s.key: s.value for s in Setting.query.all() if s.key in FIELDS})

    @app.route("/admin/login", methods=["GET", "POST"])
    def login():
        if "csrf" not in session:
            session["csrf"] = secrets.token_urlsafe(32)
        error = None
        if request.method == "POST":
            if not valid_csrf():
                abort(400)
            stored = os.environ.get("ADMIN_PASSWORD_HASH", "")
            password = os.environ.get("ADMIN_PASSWORD", "")
            attempt = request.form.get("password", "")
            if not stored and not password:
                error = "A senha administrativa ainda não foi configurada."
            elif (stored and check_password_hash(stored, attempt)) or (
                not stored and password and secrets.compare_digest(password, attempt)
            ):
                session.clear()
                session["admin"] = True
                session["csrf"] = secrets.token_urlsafe(32)
                return redirect(url_for("admin"))
            else:
                error = "Senha inválida."
        return render_template("admin.html", login=True, csrf=session["csrf"], error=error)

    @app.route("/admin", methods=["GET", "POST"])
    @authenticated
    def admin():
        if "csrf" not in session:
            session["csrf"] = secrets.token_urlsafe(32)
        notice = None
        if request.method == "POST":
            if not valid_csrf():
                abort(400)
            for key in FIELDS:
                value = request.form.get(key, "").strip()
                if len(value) > 5000:
                    abort(400)
                if key.startswith("gallery_url_") and value:
                    from urllib.parse import urlsplit
                    try:
                        parsed = urlsplit(value)
                        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
                            abort(400, "O link da imagem precisa começar com https:// e ser público.")
                    except ValueError:
                        abort(400, "Link de imagem inválido.")
                row = Setting.query.filter_by(key=key).first()
                if row is None:
                    db.session.add(Setting(key=key, value=value))
                else:
                    row.value = value
            db.session.add(AuditLog(action="Atualização das informações do espetáculo"))
            db.session.commit()
            notice = "Informações salvas."
        values = {**DEFAULT_FIELD_VALUES, **{s.key: s.value for s in Setting.query.all()}}
        return render_template("admin.html", login=False, csrf=session["csrf"], fields=FIELDS, values=values, notice=notice)

    @app.post("/admin/logout")
    @authenticated
    def logout():
        if not valid_csrf():
            abort(400)
        session.clear()
        return redirect(url_for("home"))

    return app

app = create_app()
