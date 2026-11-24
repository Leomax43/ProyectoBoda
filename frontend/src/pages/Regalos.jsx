import { useState, useEffect } from "react";
import {
  Gift,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Check,
  Copy,
  Heart,
  Loader2,
} from "lucide-react";
import { API_URL, DATOS_TRANSFERENCIA, formatCLP } from "../config";

export default function Regalos() {
  const [regalos, setRegalos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carrito: { [regaloId]: cantidad }
  const [carrito, setCarrito] = useState({});
  // Pasos: "lista" | "checkout" | "confirmacion"
  const [paso, setPaso] = useState("lista");

  // Datos del formulario de dedicatoria
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  // Resultado guardado en Neon
  const [aporteConfirmado, setAporteConfirmado] = useState(null);
  const [copiado, setCopiado] = useState("");

  useEffect(() => {
    async function cargarRegalos() {
      try {
        const res = await fetch(`${API_URL}/api/regalos`);
        if (!res.ok) throw new Error("Error al cargar");
        const data = await res.json();
        setRegalos(data);
      } catch {
        setError(
          "No pudimos cargar la lista de regalos. Intenta recargar en unos segundos."
        );
      } finally {
        setLoading(false);
      }
    }
    cargarRegalos();
  }, []);

  const agregar = (id) => {
    setCarrito((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const quitar = (id) => {
    setCarrito((prev) => {
      const actual = prev[id] || 0;
      if (actual <= 1) {
        const copia = { ...prev };
        delete copia[id];
        return copia;
      }
      return { ...prev, [id]: actual - 1 };
    });
  };

  const itemsSeleccionados = regalos
    .filter((r) => carrito[r.id] > 0)
    .map((r) => ({ ...r, cantidad: carrito[r.id] }));

  const total = itemsSeleccionados.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const copiarTexto = (clave, valor) => {
    navigator.clipboard.writeText(String(valor));
    setCopiado(clave);
    setTimeout(() => setCopiado(""), 2000);
  };

  const confirmarRegalo = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorForm("Por favor escribe tu nombre para que los novios sepan quién regala.");
      return;
    }

    setEnviando(true);
    setErrorForm("");

    try {
      const res = await fetch(`${API_URL}/api/aportes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_invitado: nombre.trim(),
          email_invitado: email.trim() || null,
          mensaje: mensaje.trim() || null,
          items: itemsSeleccionados.map((i) => ({
            regalo_id: i.id,
            cantidad: i.cantidad,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setAporteConfirmado(data.aporte);
      setCarrito({});
      setPaso("confirmacion");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorForm(err.message || "Ocurrió un error. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  // --- ESTADO: CARGANDO ---
  if (loading) {
    return (
      <div className="bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-10 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#7A1F33] animate-spin mx-auto" />
        <p className="font-serif text-lg text-[#7A1F33]">
          Cargando lista de deseos...
        </p>
        <p className="text-xs text-[#3A2E30]/60">
          Esto puede tomar unos segundos la primera vez.
        </p>
      </div>
    );
  }

  // --- ESTADO: ERROR ---
  if (error) {
    return (
      <div className="bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-8 text-center space-y-4">
        <p className="text-sm text-[#7A1F33]">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#7A1F33] text-white px-5 py-2 rounded-full text-xs uppercase tracking-wider cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // --- PASO 3: CONFIRMACIÓN Y DATOS DE TRANSFERENCIA ---
  if (paso === "confirmacion" && aporteConfirmado) {
    const camposBanco = [
      { key: "titular", label: "Titular", value: DATOS_TRANSFERENCIA.titular },
      { key: "rut", label: "RUT", value: DATOS_TRANSFERENCIA.rut },
      { key: "banco", label: "Banco", value: DATOS_TRANSFERENCIA.banco },
      {
        key: "tipo",
        label: "Tipo de cuenta",
        value: DATOS_TRANSFERENCIA.tipoCuenta,
      },
      {
        key: "cuenta",
        label: "N° de cuenta",
        value: DATOS_TRANSFERENCIA.numeroCuenta,
      },
      { key: "correo", label: "Correo", value: DATOS_TRANSFERENCIA.correo },
    ];

    const textoCompleto = `Datos de transferencia - Boda Bárbara y Daniel\nTitular: ${DATOS_TRANSFERENCIA.titular}\nRUT: ${DATOS_TRANSFERENCIA.rut}\nBanco: ${DATOS_TRANSFERENCIA.banco}\nTipo: ${DATOS_TRANSFERENCIA.tipoCuenta}\nCuenta: ${DATOS_TRANSFERENCIA.numeroCuenta}\nCorreo: ${DATOS_TRANSFERENCIA.correo}\nMonto: ${formatCLP(aporteConfirmado.monto_total)}`;

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <section className="bg-white border border-[#C5A059]/40 rounded-2xl shadow-sm p-6 md:p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#7A1F33]/10 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-[#7A1F33] fill-[#D9888F]" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-[#7A1F33]">
            ¡Muchas gracias, {aporteConfirmado.nombre_invitado}!
          </h1>
          <p className="text-sm text-[#3A2E30]/80 leading-relaxed">
            Tu dedicatoria ya quedó guardada para Bárbara y Daniel. Para
            completar tu regalo, realiza la transferencia con los siguientes
            datos:
          </p>

          <div className="bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl p-4 flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[11px] uppercase tracking-wider text-[#3A2E30]/60">
                Monto total a transferir
              </span>
              <span className="text-2xl font-semibold text-[#7A1F33]">
                {formatCLP(aporteConfirmado.monto_total)}
              </span>
            </div>
            <button
              onClick={() => copiarTexto("monto", aporteConfirmado.monto_total)}
              className="flex items-center gap-1.5 bg-[#7A1F33] text-white px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
            >
              {copiado === "monto" ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar monto
                </>
              )}
            </button>
          </div>
        </section>

        <section className="bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-6 space-y-3">
          <h2 className="font-serif text-lg text-[#7A1F33]">
            Datos para Transferencia
          </h2>

          <div className="divide-y divide-[#C5A059]/20">
            {camposBanco.map((campo) => (
              <div
                key={campo.key}
                className="py-2.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="block text-[11px] text-[#3A2E30]/60">
                    {campo.label}
                  </span>
                  <span className="block text-sm font-medium text-[#3A2E30] break-all">
                    {campo.value}
                  </span>
                </div>
                <button
                  onClick={() => copiarTexto(campo.key, campo.value)}
                  className="shrink-0 p-2 rounded-lg bg-[#FDFBF7] border border-[#C5A059]/30 text-[#7A1F33] hover:bg-[#7A1F33]/10 transition-colors cursor-pointer"
                  title={`Copiar ${campo.label}`}
                >
                  {copiado === campo.key ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => copiarTexto("todo", textoCompleto)}
            className="w-full mt-2 py-2.5 rounded-xl border border-[#7A1F33] text-[#7A1F33] text-xs font-medium uppercase tracking-wider hover:bg-[#7A1F33]/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiado === "todo" ? (
              <>
                <Check className="w-4 h-4" /> Todos los datos copiados
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar todos los datos
              </>
            )}
          </button>
        </section>

        <div className="text-center">
          <button
            onClick={() => {
              setAporteConfirmado(null);
              setNombre("");
              setEmail("");
              setMensaje("");
              setPaso("lista");
            }}
            className="text-xs text-[#7A1F33] underline underline-offset-4 cursor-pointer"
          >
            Volver a la lista de regalos
          </button>
        </div>
      </div>
    );
  }

  // --- PASO 2: FORMULARIO DE DEDICATORIA Y RESUMEN ---
  if (paso === "checkout") {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setPaso("lista")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A1F33] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a editar regalos
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Formulario */}
          <form
            onSubmit={confirmarRegalo}
            className="md:col-span-3 bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-6 space-y-4"
          >
            <div className="space-y-1">
              <h1 className="font-serif text-2xl text-[#7A1F33]">
                Tu regalo es más que un gesto, es un recuerdo
              </h1>
              <p className="text-xs text-[#3A2E30]/70">
                Déjanos tu nombre y un mensaje especial para los novios.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#3A2E30] mb-1">
                ¿Quién regala? *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Familia Pastén / Juan y María"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#3A2E30] mb-1">
                Correo electrónico (opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#3A2E30] mb-1">
                Mensaje de recuerdo
              </label>
              <textarea
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escríbele unas palabras a Bárbara y Daniel..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33] resize-none"
              />
            </div>

            {errorForm && <p className="text-xs text-[#7A1F33]">{errorForm}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-[#7A1F33] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#631829] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {enviando
                ? "Guardando dedicatoria..."
                : "Confirmar regalo y ver datos de transferencia"}
            </button>
          </form>

          {/* Detalle del carrito */}
          <aside className="md:col-span-2 bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-6 h-fit space-y-4">
            <h2 className="font-serif text-xl text-[#7A1F33]">
              Detalle de tu regalo
            </h2>

            <ul className="divide-y divide-[#C5A059]/20">
              {itemsSeleccionados.map((item) => (
                <li
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-[#3A2E30]">{item.titulo}</p>
                    <p className="text-xs text-[#3A2E30]/60">
                      {formatCLP(item.precio)} × {item.cantidad}
                    </p>
                  </div>
                  <span className="font-semibold text-[#7A1F33] shrink-0">
                    {formatCLP(item.precio * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-[#C5A059]/30 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#3A2E30]/70">
                Total
              </span>
              <span className="text-xl font-bold text-[#7A1F33]">
                {formatCLP(total)}
              </span>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // --- PASO 1: CATÁLOGO DE REGALOS ---
  return (
    <div className="space-y-6 pb-24">
      <header className="text-center space-y-2">
        <div className="w-11 h-11 rounded-full bg-[#7A1F33]/10 flex items-center justify-center mx-auto">
          <Gift className="w-5 h-5 text-[#7A1F33]" />
        </div>
        <h1 className="font-serif text-3xl text-[#7A1F33]">Lista de Deseos</h1>
        <p className="text-xs md:text-sm text-[#3A2E30]/75 max-w-lg mx-auto">
          Elige uno o más regalos según lo que quieras aportar. Al confirmar, te
          mostraremos los datos para realizar la transferencia.
        </p>
      </header>

      <div className="space-y-3">
        {regalos.map((regalo) => {
          const cantidad = carrito[regalo.id] || 0;
          return (
            <div
              key={regalo.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${
                cantidad > 0
                  ? "border-[#7A1F33]/60 shadow-sm"
                  : "border-[#C5A059]/30"
              }`}
            >
              <div className="min-w-0">
                <h2 className="font-medium text-sm sm:text-base text-[#3A2E30]">
                  {regalo.titulo}
                </h2>
                {regalo.descripcion && (
                  <p className="text-xs text-[#3A2E30]/65 mt-0.5">
                    {regalo.descripcion}
                  </p>
                )}
                <p className="text-sm font-semibold text-[#7A1F33] mt-1">
                  Valor: {formatCLP(regalo.precio)}
                </p>
              </div>

              {cantidad === 0 ? (
                <button
                  onClick={() => agregar(regalo.id)}
                  className="shrink-0 bg-[#D9888F] hover:bg-[#7A1F33] text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Regalar
                </button>
              ) : (
                <div className="shrink-0 flex items-center gap-2 bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl p-1">
                  <button
                    onClick={() => quitar(regalo.id)}
                    className="w-8 h-8 rounded-lg bg-[#D9888F]/25 text-[#7A1F33] hover:bg-[#7A1F33] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Quitar uno"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-[#7A1F33] tabular-nums">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => agregar(regalo.id)}
                    className="w-8 h-8 rounded-lg bg-[#7A1F33] text-white hover:bg-[#631829] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Agregar otro"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Barra fija inferior cuando hay regalos en el carrito */}
      {itemsSeleccionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#C5A059]/40 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div>
              <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-[#3A2E30]/60">
                Total a regalar ({itemsSeleccionados.reduce((a, b) => a + b.cantidad, 0)}{" "}
                {itemsSeleccionados.reduce((a, b) => a + b.cantidad, 0) === 1
                  ? "ítem"
                  : "ítems"}
                )
              </span>
              <span className="text-lg sm:text-xl font-bold text-[#7A1F33]">
                {formatCLP(total)}
              </span>
            </div>

            <button
              onClick={() => {
                setPaso("checkout");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-[#7A1F33] hover:bg-[#631829] text-white px-5 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}