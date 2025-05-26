import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import dayjs from 'dayjs';

const PackagingTable = () => {
  const [registros, setRegistros] = useState([]);
  const [alertaActiva, setAlertaActiva] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'envasados'));
      const hoy = new Date();

      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const vencimiento = data.vencimiento.toDate();
        const diasRestantes = dayjs(vencimiento).diff(dayjs(hoy), 'day');

        return {
          id: doc.id,
          ...data,
          vencimiento,
          envasado: data.envasado.toDate(),
          diasRestantes,
        };
      });

      const ordenados = items.sort((a, b) => a.diasRestantes - b.diasRestantes);
      setRegistros(ordenados);

      const hayAlerta = ordenados.some((r) => r.diasRestantes < 3);
      setAlertaActiva(hayAlerta);

      if (hayAlerta && audioRef.current) {
        audioRef.current.play().catch(() => {
          // Algunos navegadores bloquean audio automático sin interacción
        });
      }
    };

    fetchData();
  }, []);

  const getColor = (dias) => {
    if (dias < 3) return 'table-danger';
    if (dias <= 7) return 'table-warning';
    return 'table-success';
  };

  return (
    <div className="container mt-5">
      <h3>Productos Envasados</h3>

      {alertaActiva && (
        <div className="alert alert-danger" role="alert">
          ⚠️ ¡Hay productos que vencen en menos de 3 días! Revisar urgente.
        </div>
      )}

      <audio ref={audioRef}>
        <source src="/alerta.mp3" type="audio/mpeg" />
      </audio>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Producto</th>
            <th>PLU</th>
            <th>Envasado</th>
            <th>Vencimiento</th>
            <th>Días Restantes</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.id} className={getColor(r.diasRestantes)}>
              <td>{r.nombre}</td>
              <td>{r.ean}</td>
              <td>{dayjs(r.envasado).format('DD/MM/YYYY')}</td>
              <td>{dayjs(r.vencimiento).format('DD/MM/YYYY')}</td>
              <td>{r.diasRestantes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PackagingTable;
