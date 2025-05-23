import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';

const CargarJSON = () => {
  const [archivo, setArchivo] = useState(null);

  const manejarArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);

        if (!Array.isArray(json)) {
          Swal.fire('Error', 'El archivo debe contener un array de objetos', 'error');
          return;
        }

        const confirmacion = await Swal.fire({
          title: '¿Confirmar carga?',
          text: `Se cargarán ${json.length} documentos a Firestore`,
          showCancelButton: true,
          confirmButtonText: 'Cargar',
          cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return;

        for (const docData of json) {
          // convertir fechas si vienen como string
          if (docData.fechaVencimiento)
            docData.fechaVencimiento = Timestamp.fromDate(new Date(docData.fechaVencimiento));
          if (docData.fechaEnvasado)
            docData.fechaEnvasado = Timestamp.fromDate(new Date(docData.fechaEnvasado));

          await addDoc(collection(db, 'productos'), docData);
        }

        Swal.fire('Carga completa', 'Todos los documentos fueron cargados.', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo leer el archivo', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mt-5">
      <h4>Cargar archivo JSON a la BD</h4>
      <input type="file" accept=".json" onChange={manejarArchivo} className="form-control" />
    </div>
  );
};

export default CargarJSON;
