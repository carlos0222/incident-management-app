import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  // Lista de incidencias recibidas desde Flask.
  const [incidencias, setIncidencias] = useState([])

  // Controla si se muestra el formulario.
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  // Datos del formulario.
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState('Media')
  const [estado, setEstado] = useState('Abierta')

  // Guarda el ID de la incidencia que estamos editando.
  // null significa que estamos creando una nueva.
  const [incidenciaEditando, setIncidenciaEditando] = useState(null)

  // Buscador y filtros.
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas')

  // Mensaje visual para informar al usuario.
  // Puede ser de tipo "exito" o "error".
  const [mensaje, setMensaje] = useState(null)

  // Guarda el ID de la incidencia que queremos eliminar.
  // null significa que no hay ninguna pendiente de confirmación.
  const [incidenciaAEliminar, setIncidenciaAEliminar] = useState(null)

  // URL base del backend Flask.
  const API_URL = 'http://127.0.0.1:5000'

  // ---------------------------------------------------------
  // Al cargar la aplicación pedimos las incidencias a Flask.
  // ---------------------------------------------------------
  useEffect(() => {
    cargarIncidencias()
  }, [])

  // ---------------------------------------------------------
  // GET /incidents
  // Obtiene las incidencias almacenadas en PostgreSQL.
  // ---------------------------------------------------------
  const cargarIncidencias = async () => {
    try {
      const response = await fetch(`${API_URL}/incidents`)

      if (!response.ok) {
        throw new Error('No se han podido cargar las incidencias')
      }

      const data = await response.json()

      setIncidencias(data.incidents)
    } catch (error) {
      console.error('Error al cargar las incidencias:', error)

      setMensaje({
        tipo: 'error',
        texto: 'No se han podido cargar las incidencias'
      })
    }
  }

  // ---------------------------------------------------------
  // Crear o editar una incidencia.
  // ---------------------------------------------------------
  const guardarIncidencia = async (event) => {
    // Evita que el formulario recargue la página.
    event.preventDefault()

    // Datos que enviaremos al backend.
    const datosIncidencia = {
      title: titulo,
      description: descripcion,
      priority: prioridad,
      status: estado
    }

    try {
      let response

      // Si hay un ID guardado, estamos editando.
      if (incidenciaEditando !== null) {
        response = await fetch(
          `${API_URL}/incidents/${incidenciaEditando}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosIncidencia)
          }
        )
      } else {
        // Si no hay ID, creamos una nueva incidencia.
        response = await fetch(`${API_URL}/incidents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datosIncidencia)
        })
      }

      // Si Flask devuelve un error HTTP,
      // lo tratamos como un error.
      if (!response.ok) {
        throw new Error('No se ha podido guardar la incidencia')
      }

      // Volvemos a cargar los datos reales desde PostgreSQL.
      await cargarIncidencias()

      // Mostramos un mensaje distinto según crear o editar.
      setMensaje({
        tipo: 'exito',
        texto:
          incidenciaEditando !== null
            ? 'Incidencia actualizada correctamente'
            : 'Incidencia creada correctamente'
      })

      // Cerramos y limpiamos el formulario.
      limpiarFormulario()
    } catch (error) {
      console.error('Error al guardar la incidencia:', error)

      setMensaje({
        tipo: 'error',
        texto: 'Ha ocurrido un error al guardar la incidencia'
      })
    }
  }

  // ---------------------------------------------------------
  // Prepara una incidencia para editarla.
  // ---------------------------------------------------------
  const editarIncidencia = (incidencia) => {
    // Colocamos sus datos actuales dentro del formulario.
    setTitulo(incidencia.title)
    setDescripcion(incidencia.description)
    setPrioridad(incidencia.priority)
    setEstado(incidencia.status)

    // Guardamos qué incidencia estamos editando.
    setIncidenciaEditando(incidencia.id)

    // Mostramos el formulario.
    setMostrarFormulario(true)
  }

  // ---------------------------------------------------------
  // DELETE /incidents/<id>
  // Elimina definitivamente una incidencia.
  // ---------------------------------------------------------
  const eliminarIncidencia = async (id) => {
    try {
      const response = await fetch(`${API_URL}/incidents/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('No se ha podido eliminar la incidencia')
      }

      // Volvemos a cargar los datos desde PostgreSQL.
      await cargarIncidencias()

      // Mostramos mensaje de éxito.
      setMensaje({
        tipo: 'exito',
        texto: 'Incidencia eliminada correctamente'
      })

      // Cerramos el modal de confirmación.
      setIncidenciaAEliminar(null)
    } catch (error) {
      console.error('Error al eliminar la incidencia:', error)

      setMensaje({
        tipo: 'error',
        texto: 'Ha ocurrido un error al eliminar la incidencia'
      })
    }
  }

  // ---------------------------------------------------------
  // Limpia y cierra el formulario.
  // ---------------------------------------------------------
  const limpiarFormulario = () => {
    setTitulo('')
    setDescripcion('')
    setPrioridad('Media')
    setEstado('Abierta')
    setIncidenciaEditando(null)
    setMostrarFormulario(false)
  }

  // ---------------------------------------------------------
  // ESTADÍSTICAS
  // ---------------------------------------------------------

  const totalIncidencias = incidencias.length

  const abiertas = incidencias.filter(
    (incidencia) => incidencia.status === 'Abierta'
  ).length

  const cerradas = incidencias.filter(
    (incidencia) => incidencia.status === 'Cerrada'
  ).length

  // ---------------------------------------------------------
  // FILTROS
  //
  // useMemo recalcula esta lista solo cuando cambia alguno
  // de los datos utilizados.
  // ---------------------------------------------------------
  const incidenciasFiltradas = useMemo(() => {
    return incidencias.filter((incidencia) => {
      // Buscamos tanto en el título como en la descripción.
      const coincideBusqueda =
        incidencia.title
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||
        incidencia.description
          .toLowerCase()
          .includes(busqueda.toLowerCase())

      // Comprobamos el filtro de estado.
      const coincideEstado =
        filtroEstado === 'Todos' ||
        incidencia.status === filtroEstado

      // Comprobamos el filtro de prioridad.
      const coincidePrioridad =
        filtroPrioridad === 'Todas' ||
        incidencia.priority === filtroPrioridad

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincidePrioridad
      )
    })
  }, [
    incidencias,
    busqueda,
    filtroEstado,
    filtroPrioridad
  ])

  return (
    <div className="page">

      {/* =====================================================
          CABECERA
          ===================================================== */}
      <header className="topbar">
        <div>
          <p className="eyebrow">
            Panel de gestión
          </p>

          <h1>
            Gestor de incidencias
          </h1>

          <p className="subtitle">
            Administra y realiza seguimiento de las incidencias registradas.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            // Nos aseguramos de que el formulario esté limpio.
            limpiarFormulario()

            // Abrimos el formulario.
            setMostrarFormulario(true)
          }}
        >
          + Nueva incidencia
        </button>
      </header>

      {/* =====================================================
          MENSAJES
          ===================================================== */}

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`}>
          <span>
            {mensaje.texto}
          </span>

          <button
            type="button"
            onClick={() => setMensaje(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          ESTADÍSTICAS
          ===================================================== */}

      <section className="stats-grid">

        <article className="stat-card">
          <span className="stat-label">
            Total
          </span>

          <strong>
            {totalIncidencias}
          </strong>
        </article>

        <article className="stat-card">
          <span className="stat-label">
            Abiertas
          </span>

          <strong>
            {abiertas}
          </strong>
        </article>

        <article className="stat-card">
          <span className="stat-label">
            Cerradas
          </span>

          <strong>
            {cerradas}
          </strong>
        </article>

      </section>

      {/* =====================================================
          FORMULARIO
          ===================================================== */}

      {mostrarFormulario && (
        <section className="form-card">

          <div className="form-header">

            <div>
              <h2>
                {incidenciaEditando !== null
                  ? 'Editar incidencia'
                  : 'Nueva incidencia'}
              </h2>

              <p>
                Completa los datos de la incidencia.
              </p>
            </div>

            {/* Botón para cerrar el formulario */}
            <button
              className="close-button"
              type="button"
              onClick={limpiarFormulario}
            >
              ×
            </button>

          </div>

          <form onSubmit={guardarIncidencia}>

            {/* Título */}
            <div className="form-group form-group-wide">
              <label>
                Título
              </label>

              <input
                type="text"
                placeholder="Ej. Error al iniciar sesión"
                value={titulo}
                onChange={(event) =>
                  setTitulo(event.target.value)
                }
                required
              />
            </div>

            {/* Descripción */}
            <div className="form-group form-group-wide">
              <label>
                Descripción
              </label>

              <input
                type="text"
                placeholder="Describe brevemente el problema"
                value={descripcion}
                onChange={(event) =>
                  setDescripcion(event.target.value)
                }
                required
              />
            </div>

            {/* Prioridad */}
            <div className="form-group">
              <label>
                Prioridad
              </label>

              <select
                value={prioridad}
                onChange={(event) =>
                  setPrioridad(event.target.value)
                }
              >
                <option value="Baja">
                  Baja
                </option>

                <option value="Media">
                  Media
                </option>

                <option value="Alta">
                  Alta
                </option>
              </select>
            </div>

            {/* Estado */}
            <div className="form-group">
              <label>
                Estado
              </label>

              <select
                value={estado}
                onChange={(event) =>
                  setEstado(event.target.value)
                }
              >
                <option value="Abierta">
                  Abierta
                </option>

                <option value="Cerrada">
                  Cerrada
                </option>
              </select>
            </div>

            {/* Acciones del formulario */}
            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={limpiarFormulario}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {incidenciaEditando !== null
                  ? 'Guardar cambios'
                  : 'Crear incidencia'}
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =====================================================
          PANEL DE INCIDENCIAS
          ===================================================== */}

      <section className="table-card">

        {/* Buscador y filtros */}
        <div className="table-toolbar">

          <div>
            <h2>
              Incidencias
            </h2>

            <p>
              {incidenciasFiltradas.length} resultados
            </p>
          </div>

          <div className="filters">

            {/* Buscador */}
            <input
              className="search-input"
              type="text"
              placeholder="Buscar incidencia..."
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
            />

            {/* Filtro de estado */}
            <select
              value={filtroEstado}
              onChange={(event) =>
                setFiltroEstado(event.target.value)
              }
            >
              <option value="Todos">
                Todos los estados
              </option>

              <option value="Abierta">
                Abiertas
              </option>

              <option value="Cerrada">
                Cerradas
              </option>
            </select>

            {/* Filtro de prioridad */}
            <select
              value={filtroPrioridad}
              onChange={(event) =>
                setFiltroPrioridad(event.target.value)
              }
            >
              <option value="Todas">
                Todas las prioridades
              </option>

              <option value="Baja">
                Baja
              </option>

              <option value="Media">
                Media
              </option>

              <option value="Alta">
                Alta
              </option>
            </select>

          </div>

        </div>

        {/* ===================================================
            TABLA
            =================================================== */}

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {/* Recorremos las incidencias filtradas */}
              {incidenciasFiltradas.map((incidencia) => (
                <tr key={incidencia.id}>

                  <td className="id-cell">
                    #{incidencia.id}
                  </td>

                  <td className="title-cell">
                    {incidencia.title}
                  </td>

                  <td>
                    {incidencia.description}
                  </td>

                  {/* Badge de prioridad */}
                  <td>
                    <span
                      className={
                        `badge priority-${incidencia.priority.toLowerCase()}`
                      }
                    >
                      {incidencia.priority}
                    </span>
                  </td>

                  {/* Badge de estado */}
                  <td>
                    <span
                      className={
                        `badge status-${incidencia.status.toLowerCase()}`
                      }
                    >
                      {incidencia.status}
                    </span>
                  </td>

                  {/* Botones de acciones */}
                  <td>
                    <div className="actions">

                      <button
                        className="edit-button"
                        onClick={() =>
                          editarIncidencia(incidencia)
                        }
                      >
                        Editar
                      </button>

                      {/* Este botón ya no elimina directamente.
                          Primero abre el modal de confirmación. */}
                      <button
                        className="delete-button"
                        onClick={() =>
                          setIncidenciaAEliminar(incidencia.id)
                        }
                      >
                        Eliminar
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

              {/* Mensaje cuando no hay resultados */}
              {incidenciasFiltradas.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    No hay incidencias que coincidan con los filtros.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
          ===================================================== */}

      {incidenciaAEliminar !== null && (
        <div className="modal-overlay">

          <div className="modal-card">

            <h2>
              Eliminar incidencia
            </h2>

            <p>
              ¿Seguro que quieres eliminar esta incidencia?
              Esta acción no se puede deshacer.
            </p>

            <div className="modal-actions">

              {/* Cerramos el modal sin eliminar */}
              <button
                className="secondary-button"
                onClick={() =>
                  setIncidenciaAEliminar(null)
                }
              >
                Cancelar
              </button>

              {/* Confirmamos la eliminación */}
              <button
                className="confirm-delete-button"
                onClick={() =>
                  eliminarIncidencia(incidenciaAEliminar)
                }
              >
                Eliminar
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default App