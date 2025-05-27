import React, { useState } from 'react';

import { getDocs, query, where, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const CargarEmpaqueViejo = () => {
  const [ean, setEan] = useState('');
  const [fechaEnvasado, setFechaEnvasado] = useState('');

  const guardarEmpaque = async () => {
  if (!ean || !fechaEnvasado) {
    Swal.fire('Error', 'Completá el EAN y la fecha de envasado.', 'warning');
    return;
  }

 

  try {
    const q = query(collection(db, 'productos'), where('ean', '==', ean));
    const snapshot = await getDocs(q);
    Swal.close();

    if (snapshot.empty) {
      Swal.fire('No encontrado', 'No se encontró un producto con ese EAN.', 'error');
      return;
    }

    const producto = snapshot.docs[0].data();

    const fechaBase = dayjs(fechaEnvasado, 'YYYY-MM-DD');
    if (!fechaBase.isValid()) {
      Swal.fire('Fecha inválida', 'Revisá el formato de la fecha.', 'error');
      return;
    }

    const vencimiento = fechaBase.add(producto.diasVencimiento, 'day');

    const empaque = {
      descripcion: producto.descripcion,
      ean: producto.ean,
      fechaEnvasado: fechaBase.toDate(),
      fechaVencimiento: vencimiento.toDate(),
      estado: 'creado',
      diasVencimiento: producto.diasVencimiento
    };

    await addDoc(collection(db, 'empaques'), empaque);

    Swal.fire('Guardado', 'Empaque antiguo registrado correctamente.', 'success');
    setEan('');
    setFechaEnvasado('');
  } catch (error) {
    console.error(error);
    Swal.close();
    Swal.fire('Error', 'Ocurrió un error al guardar el empaque.', 'error');
  }
};

  return (
    <div className="container mt-4">
      <h3>Cargar empaque antiguo</h3>

      <div className="mb-3">
        <label className="form-label">Código EAN</label>
        <input
          type="text"
          className="form-control"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha de envasado</label>
        <input
          type="date"
          className="form-control"
          value={fechaEnvasado}
          onChange={(e) => setFechaEnvasado(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={guardarEmpaque}>
        Guardar empaque
      </button>
    </div>
  );
};

export default CargarEmpaqueViejo;
