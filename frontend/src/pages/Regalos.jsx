import { Gift } from "lucide-react";

export default function Regalos() {
  return (
    <section className="bg-white border border-[#C5A059]/30 rounded-2xl shadow-sm p-8 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-[#7A1F33]/10 flex items-center justify-center mx-auto">
        <Gift className="w-6 h-6 text-[#7A1F33]" />
      </div>
      <h1 className="font-serif text-2xl text-[#7A1F33]">Lista de Regalos</h1>
      <p className="text-sm text-[#3A2E30]/75 leading-relaxed">
        Muy pronto podrás elegir uno o más deseos de nuestra lista y dejarnos
        una dedicatoria especial.
      </p>
    </section>
  );
}