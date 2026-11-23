import { useState } from "react";
import { Lock } from "lucide-react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Ingresa la contraseña de los novios.");
      return;
    }
    // Más adelante validaremos esta contraseña contra el backend
    setError("Conexión con el servidor en preparación.");
  };

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#3A2E30] mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 text-sm bg-[#FDFBF7] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#7A1F33]"
          />
        </div>

        {error && <p className="text-xs text-[#7A1F33]">{error}</p>}

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