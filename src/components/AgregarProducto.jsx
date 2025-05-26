import React, { useState } from "react";
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const AgregarProducto = () => {
  const [ean, setEan] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
 

  const buscarProducto = async () => {
    try {
      const q = query(collection(db, "productos"), where("ean", "==", ean));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setProductoSeleccionado(null);
        MySwal.fire("No encontrado", "No se encontró el producto con ese PLU", "warning");
        return;
      }

      const doc = querySnapshot.docs[0];
      setProductoSeleccionado(doc.data());
    } catch (error) {
      console.error("Error al buscar producto:", error);
      MySwal.fire("Error", "Hubo un error al buscar el producto", "error");
    }
  };

  const agregarEmpaque = async () => {
    if (!productoSeleccionado) {
      MySwal.fire("Faltan datos", "Debes completar todos los campos", "warning");
      return;
    }

    const fechaEnvasado = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaEnvasado.getDate() + productoSeleccionado.diasVencimiento);

    try {
      await addDoc(collection(db, "empaques"), {
        ean: productoSeleccionado.ean,
        descripcion: productoSeleccionado.descripcion,
        fechaEnvasado: Timestamp.fromDate(fechaEnvasado),
        fechaVencimiento: Timestamp.fromDate(fechaVencimiento),
        estado: "creado"
      });

      MySwal.fire("Registrado", "El producto fue envasado exitosamente", "success");
      setEan("");
      setProductoSeleccionado(null);
      
    } catch (error) {
      console.error("Error al agregar empaque:", error);
      MySwal.fire("Error", "No se pudo registrar el producto", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Agregar Producto Envasado</h3>

      <div className="mb-3">
        <label htmlFor="ean" className="form-label">PLU</label>
        <input
          type="text"
          className="form-control"
          id="ean"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
        />
        <button onClick={buscarProducto} className="btn btn-primary mt-2">Buscar</button>
      </div>

      {productoSeleccionado && (
        <div className="mb-3">
          <p><strong>Descripción:</strong> {productoSeleccionado.descripcion}</p>
          <p><strong>Días hasta vencimiento:</strong> {productoSeleccionado.diasVencimiento}</p>

          

          <button onClick={agregarEmpaque} className="btn btn-success mt-3">Registrar Empaque</button>
        </div>
      )}
    </div>
  );
};

export default AgregarProducto;
