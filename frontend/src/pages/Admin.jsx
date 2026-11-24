import { useState, useEffect, useCallback } from "react";
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Gift,
  Heart,
} from "lucide-react";
import { API_URL, formatCLP } from "../config";

export default function Admin() {
  const [password, setPassword] = useState(
    () => sessionStorage.getItem("admin_pwd") || ""
  );
  const [inputPwd, setInputPwd] = useState("");
  const [autenticado, setAutenticado] = useState(
    () => Boolean(sessionStorage.getItem("admin_pwd"))
  );
  const [errorLogin, setErrorLogin] = useState("");
  const [tab, setTab] = useState("aportes"); // "aportes" | "regalos"

  const [aportes, setAportes] = useState([]);
  const [regalos, setRegalos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Formulario de crear/editar regalo
  const [editandoId, setEditandoId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");

  const cargarDatos = useCallback(async (pwd) => {
    setCargando(true);
    try {
      const headers = { "x-admin-password": pwd };
      const [resAportes, resRegalos] = await Promise.all([
        fetch(`${API_URL}/api/admin/aportes`, { headers }),
        fetch(`${API_URL}/api/admin/regalos`, { headers }),
      ]);

      if (resAportes.status === 401 || resRegalos.status === 401) {
        sessionStorage.removeItem("admin_pwd");
        setAutenticado(false);
        return;
      }

      setAportes(await resAportes.json());
      setRegalos(await resRegalos.json());
    } catch (err) {
      console.error("Error cargando datos admin:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (autenticado && password) {
      cargarDatos(password);
    }
  }, [autenticado, password, cargarDatos]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorLogin("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: inputPwd }),
      });

      if (!res.ok) {
        setErrorLogin("Contraseña incorrecta.");
        return;
      }

      sessionStorage.setItem("admin_pwd", inputPwd);
      setPassword(inputPwd);
      setAutenticado(true);
      setInputPwd("");
    } catch {
      setErrorLogin("No se pudo conectar con el servidor.");
    }
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem("admin_pwd");
    setPassword("");
    setAutenticado(false);
  };

  const cambiarEstadoAporte = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "recibido" ? "pendiente" : "recibido";
    await fetch(`${API_URL}/api/admin/aportes/${id}/estado`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setAportes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: nuevoEstado } : a))
    );
  };

  const eliminarAporte = async (id, nombreInvitado) => {
    if (!confirm(`¿Seguro que deseas eliminar el aporte de "${nombreInvitado}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/aportes/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });

      if (res.ok) {
        setAportes((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Error eliminando aporte:", err);
    }
  };

  const guardarRegalo = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !precio) return;

    const url = editandoId
      ? `${API_URL}/api/admin/regalos/${editandoId}`
      : `${API_URL}/api/admin/regalos`;

    const res = await fetch(url, {
      method: editandoId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        precio: Number(precio),
        activo: true,
      }),
    });

    if (res.ok) {
      setEditandoId(null);
      setTitulo("");
      setDescripcion("");
      setPrecio("");
      cargarDatos(password);
    }
  };

  const empezarEdicion = (r) => {
    setEditandoId(r.id);
    setTitulo(r.titulo);
    setDescripcion(r.descripcion || "");
    setPrecio(String(r.precio));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarRegalo = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este regalo?")) return;
    await fetch(`${API_URL}/api/admin/regalos/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    cargarDatos(password);
  };

  // --- VISTA LOGIN ---
  if (!autenticado) {
    return (
      <section className="max-w-md mx-auto bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#7A1F33]/10 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-[#7A1F33]" />
          </div>
          <h1 className="font-serif text-2xl text-[#7A1F33]">Panel de Novios</h1>
          <p className="text-xs text-[#3A2E30]/70">
            Acceso exclusivo para administrar regalos y dedicatorias.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#3A2E30] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={inputPwd}
              onChange={(e) => {
                setInputPwd(e.target.value);
                setErrorLogin("");
              }}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33]"
            />
          </div>

          {errorLogin && <p className="text-xs text-[#7A1F33]">{errorLogin}</p>}

          <button
            type="submit"
            className="w-full bg-[#7A1F33] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#631829] transition-colors cursor-pointer"
          >
            Ingresar
          </button>
        </form>
      </section>
    );
  }

  // --- MÉTRICAS ---
  const totalRecibido = aportes
    .filter((a) => a.estado === "recibido")
    .reduce((acc, a) => acc + a.monto_total, 0);
  const totalPendiente = aportes
    .filter((a) => a.estado !== "recibido")
    .reduce((acc, a) => acc + a.monto_total, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl md:text-3xl text-[#7A1F33]">
          Panel de Novios
        </h1>
        <button
          onClick={cerrarSesion}
          className="inline-flex items-center gap-1.5 text-xs text-[#3A2E30]/70 hover:text-[#7A1F33] cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-[#C5A059]/30 rounded-2xl p-4">
          <span className="text-xs text-[#3A2E30]/60">Recibido confirmado</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {formatCLP(totalRecibido)}
          </p>
        </div>
        <div className="bg-white border border-[#C5A059]/30 rounded-2xl p-4">
          <span className="text-xs text-[#3A2E30]/60">Por confirmar</span>
          <p className="text-2xl font-bold text-[#7A1F33] mt-1">
            {formatCLP(totalPendiente)}
          </p>
        </div>
        <div className="bg-white border border-[#C5A059]/30 rounded-2xl p-4">
          <span className="text-xs text-[#3A2E30]/60">Total regalos recibidos</span>
          <p className="text-2xl font-bold text-[#3A2E30] mt-1">
            {aportes.length}
          </p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 border-b border-[#C5A059]/30 pb-2">
        <button
          onClick={() => setTab("aportes")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer ${
            tab === "aportes"
              ? "bg-[#7A1F33] text-white"
              : "text-[#3A2E30]/75 hover:bg-[#7A1F33]/10"
          }`}
        >
          <Heart className="w-4 h-4" /> Dedicatorias y Aportes
        </button>
        <button
          onClick={() => setTab("regalos")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer ${
            tab === "regalos"
              ? "bg-[#7A1F33] text-white"
              : "text-[#3A2E30]/75 hover:bg-[#7A1F33]/10"
          }`}
        >
          <Gift className="w-4 h-4" /> Gestionar Regalos
        </button>
      </div>

      {cargando && (
        <p className="text-xs text-[#3A2E30]/60">Actualizando datos...</p>
      )}

      {/* TAB 1: APORTES */}
      {tab === "aportes" && (
        <div className="space-y-4">
          {aportes.length === 0 ? (
            <div className="bg-white border border-[#C5A059]/30 rounded-2xl p-8 text-center text-sm text-[#3A2E30]/70">
              Aún no hay regalos registrados.
            </div>
          ) : (
            aportes.map((aporte) => (
              <div
                key={aporte.id}
                className="bg-white border border-[#C5A059]/30 rounded-2xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-base text-[#3A2E30]">
                      {aporte.nombre_invitado}
                    </h2>
                    <p className="text-xs text-[#3A2E30]/60">
                      {new Date(aporte.creado_en).toLocaleString("es-CL")}
                      {aporte.email_invitado ? ` · ${aporte.email_invitado}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-[#7A1F33]">
                      {formatCLP(aporte.monto_total)}
                    </span>
                    <button
                      onClick={() =>
                        cambiarEstadoAporte(aporte.id, aporte.estado)
                      }
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        aporte.estado === "recibido"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {aporte.estado === "recibido" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recibido
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Pendiente
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        eliminarAporte(aporte.id, aporte.nombre_invitado)
                      }
                      className="p-1.5 rounded-lg text-[#3A2E30]/50 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar aporte"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {aporte.mensaje && (
                  <blockquote className="bg-[#FDFBF7] border-l-2 border-[#C5A059] px-3.5 py-2 text-sm italic text-[#3A2E30]/85 rounded-r-lg">
                    "{aporte.mensaje}"
                  </blockquote>
                )}

                <ul className="text-xs text-[#3A2E30]/75 space-y-1 pt-1">
                  {aporte.items.map((item, idx) => (
                    <li key={idx}>
                      • {item.cantidad}× {item.titulo} (
                      {formatCLP(item.precio_unitario)})
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: GESTIONAR REGALOS */}
      {tab === "regalos" && (
        <div className="space-y-6">
          <form
            onSubmit={guardarRegalo}
            className="bg-white border border-[#C5A059]/30 rounded-2xl p-5 space-y-3"
          >
            <h2 className="font-serif text-lg text-[#7A1F33]">
              {editandoId ? "Editar regalo" : "Agregar nuevo regalo"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Título del regalo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33]"
              />
              <input
                type="number"
                required
                min="1000"
                step="100"
                placeholder="Precio (CLP)"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="px-3.5 py-2 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33]"
              />
            </div>
            <input
              type="text"
              placeholder="Descripción corta (opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33]"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#7A1F33] text-white px-5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {editandoId ? "Guardar cambios" : "Agregar regalo"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setTitulo("");
                    setDescripcion("");
                    setPrecio("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-[#3A2E30]/70 hover:bg-black/5 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2.5">
            {regalos
              .filter((r) => r.activo)
              .map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-[#C5A059]/30 rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#3A2E30]">
                      {r.titulo}
                    </p>
                    <p className="text-xs font-semibold text-[#7A1F33]">
                      {formatCLP(r.precio)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => empezarEdicion(r)}
                      className="p-2 rounded-lg text-[#3A2E30]/70 hover:text-[#7A1F33] hover:bg-[#7A1F33]/10 cursor-pointer"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarRegalo(r.id)}
                      className="p-2 rounded-lg text-[#3A2E30]/70 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}