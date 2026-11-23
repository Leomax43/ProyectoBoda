import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Regalos from "./pages/Regalos";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#FDFBF7] text-[#3A2E30] flex flex-col">
        <Navbar />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/regalos" element={<Regalos />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="text-center text-xs text-[#3A2E30]/60 py-6">
          ¡Te esperamos para celebrar juntos!
        </footer>
      </div>
    </BrowserRouter>
  );
}