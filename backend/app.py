from flask import Flask
from routes.incidents import incidents_bp
from database.db import init_db

# Creamos la aplicación
app = Flask(__name__)


# Añadimos manualmente las cabeceras CORS
# para permitir peticiones desde React.
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


# Creamos la base de datos y la tabla si todavía no existen
init_db()

# Registramos las rutas relacionadas con incidencias
app.register_blueprint(incidents_bp)


# Ruta principal
@app.route("/")
def home():
    return {
        "message": "API de gestión de incidencias funcionando"
    }


# Sirve para comprobar que el servidor está activo
@app.route("/health")
def health():
    return {
        "status": "ok"
    }


if __name__ == "__main__":
    app.run(debug=True)