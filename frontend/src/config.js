export const API_URL =
  import.meta.env.VITE_API_URL || "https://barbara-y-daniel-api.onrender.com";

// Reemplaza estos datos por la cuenta real donde recibirán las transferencias
export const DATOS_TRANSFERENCIA = {
  titular: "Bárbara Piñones / Daniel Herrera",
  rut: "12.345.678-9",
  banco: "Banco Estado",
  tipoCuenta: "Cuenta RUT / Vista",
  numeroCuenta: "12345678",
  correo: "boda.barbaraydaniel@gmail.com",
};

export function formatCLP(monto) {
  return "$" + Number(monto || 0).toLocaleString("es-CL");
}