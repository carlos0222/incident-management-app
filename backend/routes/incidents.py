from flask import Blueprint, request
from database.db import get_connection


# Blueprint que agrupa todas las rutas relacionadas con incidencias.
incidents_bp = Blueprint("incidents", __name__)


# ---------------------------------------------------------
# GET /incidents
# Devuelve todas las incidencias almacenadas en PostgreSQL.
# ---------------------------------------------------------
@incidents_bp.route("/incidents", methods=["GET"])
def get_incidents():

    # Abrimos una conexión con PostgreSQL.
    connection = get_connection()

    # Recuperamos todas las incidencias ordenadas por su identificador.
    incidents = connection.execute(
        "SELECT * FROM incidents ORDER BY id"
    ).fetchall()

    # Cerramos la conexión cuando terminamos.
    connection.close()

    return {
        "incidents": incidents
    }


# ---------------------------------------------------------
# GET /incidents/<id>
# Devuelve una incidencia concreta mediante su identificador.
# ---------------------------------------------------------
@incidents_bp.route("/incidents/<int:incident_id>", methods=["GET"])
def get_incident(incident_id):

    connection = get_connection()

    # En psycopg utilizamos %s para insertar parámetros
    # en las consultas SQL de forma segura.
    incident = connection.execute(
        "SELECT * FROM incidents WHERE id = %s",
        (incident_id,)
    ).fetchone()

    connection.close()

    # Si no existe ninguna incidencia con ese ID,
    # devolvemos un error HTTP 404.
    if incident is None:
        return {
            "error": "Incidencia no encontrada"
        }, 404

    return incident


# ---------------------------------------------------------
# POST /incidents
# Crea una nueva incidencia.
# ---------------------------------------------------------
@incidents_bp.route("/incidents", methods=["POST"])
def create_incident():

    # Obtenemos los datos JSON enviados por el cliente.
    data = request.get_json()

    if not data:
        return {
            "error": "No se han enviado datos"
        }, 400

    # Campos obligatorios para crear una incidencia.
    required_fields = ["title", "description", "priority"]

    # Comprobamos que todos los campos necesarios estén presentes.
    for field in required_fields:
        if field not in data:
            return {
                "error": f"Falta el campo {field}"
            }, 400

    # Si no se indica un estado, la incidencia comienza como "Abierta".
    status = data.get("status", "Abierta")

    connection = get_connection()

    # PostgreSQL permite utilizar RETURNING para obtener
    # directamente la fila que acabamos de insertar.
    incident = connection.execute(
        """
        INSERT INTO incidents (title, description, priority, status)
        VALUES (%s, %s, %s, %s)
        RETURNING *
        """,
        (
            data["title"],
            data["description"],
            data["priority"],
            status
        )
    ).fetchone()

    # Confirmamos la inserción en la base de datos.
    connection.commit()

    connection.close()

    # HTTP 201 indica que el recurso se ha creado correctamente.
    return incident, 201


# ---------------------------------------------------------
# PUT /incidents/<id>
# Actualiza completamente una incidencia existente.
# ---------------------------------------------------------
@incidents_bp.route("/incidents/<int:incident_id>", methods=["PUT"])
def update_incident(incident_id):

    data = request.get_json()

    if not data:
        return {
            "error": "No se han enviado datos"
        }, 400

    connection = get_connection()

    # Primero comprobamos que la incidencia exista.
    incident = connection.execute(
        "SELECT * FROM incidents WHERE id = %s",
        (incident_id,)
    ).fetchone()

    if incident is None:
        connection.close()

        return {
            "error": "Incidencia no encontrada"
        }, 404

    # Actualizamos los campos de la incidencia.
    # RETURNING * devuelve directamente la fila ya actualizada.
    updated_incident = connection.execute(
        """
        UPDATE incidents
        SET title = %s,
            description = %s,
            priority = %s,
            status = %s
        WHERE id = %s
        RETURNING *
        """,
        (
            data["title"],
            data["description"],
            data["priority"],
            data["status"],
            incident_id
        )
    ).fetchone()

    connection.commit()
    connection.close()

    return updated_incident


# ---------------------------------------------------------
# DELETE /incidents/<id>
# Elimina una incidencia existente.
# ---------------------------------------------------------
@incidents_bp.route("/incidents/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id):

    connection = get_connection()

    # Comprobamos primero que exista.
    incident = connection.execute(
        "SELECT * FROM incidents WHERE id = %s",
        (incident_id,)
    ).fetchone()

    if incident is None:
        connection.close()

        return {
            "error": "Incidencia no encontrada"
        }, 404

    # Eliminamos la incidencia.
    connection.execute(
        "DELETE FROM incidents WHERE id = %s",
        (incident_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Incidencia eliminada correctamente"
    }