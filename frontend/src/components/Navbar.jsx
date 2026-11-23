import { NavLink } from "react-router-dom";
import { Lock } from "lucide-react";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors ${
      isActive
        ? "bg-[#7A1F33] text-white"
        : "text-[#3A2E30]/80 hover:text-[#7A1F33] hover:bg-[#7A1F33]/10"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#C5A059]/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Logo / Iniciales */}
        <NavLink
          to="/"
          className="font-script text-2xl text-[#7A1F33] leading-none"
        >
          B &amp; D
        </NavLink>

        {/* Enlaces */}
        <div className="flex items-center gap-1.5">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/regalos" className={linkClass}>
            Regalos
          </NavLink>
          <NavLink
            to="/admin"
            title="Acceso Novios"
            className={({ isActive }) =>
              `p-2 rounded-full transition-colors ${
                isActive
                  ? "bg-[#7A1F33] text-white"
                  : "text-[#3A2E30]/50 hover:text-[#7A1F33] hover:bg-[#7A1F33]/10"
              }`
            }
          >
            <Lock className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </nav>
  );
}