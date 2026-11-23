import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Gift } from "lucide-react";

const WEDDING_DATE = new Date("2027-02-12T16:00:00-03:00").getTime();

function getTimeLeft() {
  const diff = Math.max(0, WEDDING_DATE - Date.now());
  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    min: Math.floor((diff / (1000 * 60)) % 60),
    seg: Math.floor((diff / 1000) % 60),
  };
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Banner Principal + Nombres y Fecha */}
      <header className="bg-white border border-[#C5A059]/35 rounded-2xl shadow-sm overflow-hidden">
        <img
          src="/banner.png"
          alt="Nos casamos Bárbara y Daniel"
          className="w-full h-auto object-cover"
        />
        <div className="py-5 md:py-7 px-4 text-center border-t border-[#C5A059]/20">
          <h1 className="font-script text-4xl md:text-6xl text-[#7A1F33]">
            Bárbara y Daniel
          </h1>
          <p className="font-serif text-sm md:text-base tracking-[0.25em] text-[#3A2E30]/75 mt-1">
            12 · 02 · 2027
          </p>
        </div>
      </header>

      {/* Cuenta Regresiva */}
      <section className="max-w-lg mx-auto text-center space-y-4">
        <p className="font-serif italic text-lg md:text-xl text-[#7A1F33]">
          ¡Estamos contando los días!
        </p>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[
            { label: "Días", value: timeLeft.dias },
            { label: "Horas", value: timeLeft.horas },
            { label: "Min", value: timeLeft.min },
            { label: "Seg", value: timeLeft.seg },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#C5A059]/30 rounded-xl py-3 md:py-4 shadow-xs"
            >
              <span className="block text-2xl md:text-4xl font-semibold text-[#7A1F33] tabular-nums">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-[#3A2E30]/70">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Mensaje de Bienvenida */}
      <section className="max-w-2xl mx-auto text-center px-2 space-y-3">
        <h2 className="font-serif italic text-lg md:text-xl text-[#7A1F33]">
          Queridos familiares y amigos:
        </h2>
        <p className="text-sm md:text-base text-[#3A2E30]/80 leading-relaxed">
          Con mucha ilusión queremos compartir este sueño tan especial con
          ustedes. Hemos preparado una lista de deseos para que puedan ser parte
          de esta aventura única. Cada gesto tendrá un significado muy especial
          para nosotros.
        </p>
        <p className="text-sm md:text-base font-medium italic text-[#7A1F33]/90">
          ¡Estamos felices de que nos hagan compañía en este importante momento!
        </p>
      </section>

      {/* Acceso a Lista de Deseos */}
      <section className="bg-[#7A1F33] text-white rounded-2xl shadow-md p-6 md:p-8 text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto">
          <Gift className="w-6 h-6 text-[#FDFBF7]" />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl">Lista de Deseos</h2>
        <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-md mx-auto">
          Explora nuestra lista de regalos y déjanos una dedicatoria especial
          para recordar siempre este día.
        </p>
        <Link
          to="/regalos"
          className="inline-block bg-white text-[#7A1F33] font-medium rounded-full px-6 py-2.5 text-xs md:text-sm uppercase tracking-widest hover:bg-[#FDFBF7] transition-colors"
        >
          Ver lista de regalos
        </Link>
      </section>

      {/* Detalles del Evento (1 columna en celular, 2 columnas en PC) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-6 space-y-2">
          <h3 className="font-script text-3xl md:text-4xl text-[#7A1F33]">
            Ceremonia
          </h3>
          <p className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C5A059] shrink-0" />
            12 de febrero de 2027
          </p>
          <p className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
            16:00 hrs
          </p>
          <p className="text-sm flex items-start gap-2 text-[#3A2E30]/80">
            <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <span>
              Iglesia Evangélica Pentecostal — Calle Santo Domingo 1880, La
              Serena
            </span>
          </p>
        </div>

        <div className="bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-6 space-y-2">
          <h3 className="font-script text-3xl md:text-4xl text-[#7A1F33]">
            Celebración
          </h3>
          <p className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C5A059] shrink-0" />
            12 de febrero de 2027
          </p>
          <p className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
            Desde las 18:30 hrs
          </p>
          <p className="text-sm flex items-start gap-2 text-[#3A2E30]/80">
            <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
            <span>
              Centro de Eventos Altos de Monardez — Ruta 41 N° 8901, Parcela 3,
              Lote 3E, Quebrada de Monardez, La Serena
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}