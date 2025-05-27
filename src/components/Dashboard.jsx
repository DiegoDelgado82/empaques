
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const obtenerProductos = async () => {
    const snapshot = await getDocs(collection(db, 'empaques'));
    const lista = snapshot.docs.map(doc => {
      const data = doc.data();
      const fechaVencimiento = dayjs(data.fechaVencimiento.toDate());
      const fechaEnvasado = dayjs(data.fechaEnvasado.toDate());
      const diasRestantes = fechaVencimiento.diff(dayjs(), 'day');
      return {
        id: doc.id,
        ...data,
        fechaVencimiento: fechaVencimiento.format('DD/MM/YYYY'),
        fechaEnvasado: fechaEnvasado.format('DD/MM/YYYY'),
        diasRestantes
      };
    });
    setProductos(lista.sort((a, b) => dayjs(a.fechaEnvasado, 'DD/MM/YYYY').unix() - dayjs(b.fechaEnvasado, 'DD/MM/YYYY').unix()));
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const getColorClass = (dias) => {
    if (dias <= 3) return 'bg-danger text-white';
    if (dias <= 7) return 'bg-warning text-dark';
    return 'bg-success text-white';
  };

  const marcarComoRevisado = async (id) => {
    await updateDoc(doc(db, 'empaques', id), { estado: 'revisado' });
    Swal.fire('Revisado', 'Producto marcado como revisado.', 'success');
    obtenerProductos();
  };

  const cancelarEmpaque = async (id) => {
    const confirmar = await Swal.fire({
      title: '¿Cancelar empaque?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });
    if (confirmar.isConfirmed) {
      await updateDoc(doc(db, 'empaques', id), { estado: 'cancelado' });
      Swal.fire('Cancelado', 'El empaque fue cancelado.', 'success');
      obtenerProductos();
    }
  };

  const productosFiltrados = productos.filter(p => {
    if (filtroEstado === 'todos') return p.estado !== 'cancelado';
    return p.estado === filtroEstado;
  });

  return (
    <div className="container mt-3">
      <h3 className="mb-3">Control de Productos Etiquetados</h3>

      <div className="mb-3">
        <label>Filtrar por estado:</label>
        <select
          className="form-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos (excepto cancelados)</option>
          <option value="creado">Creados</option>
          <option value="vencido">Vencidos</option>
          <option value="revisado">Revisados</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {productosFiltrados.map(p => (
        <div key={p.id} className={`card mb-3 ${getColorClass(p.diasRestantes)}`}>
          <div className="card-body">
            <h5 className="card-title">{p.descripcion}</h5>
            <p className="card-text"><b>PLU:</b> {p.ean}</p>
            <p className="card-text"><b>Envasado:</b> {p.fechaEnvasado}</p>
            <p className="card-text"><b>Vencimiento:</b> {p.fechaVencimiento}</p>
            <p className="card-text"><b>Días restantes:</b> {p.diasRestantes}</p>
            <p className="card-text"><b>Estado:</b> {p.estado}</p>
            {p.estado === 'creado' && (
              <>
                {(p.diasVencimiento === 30 && p.diasRestantes <= 7) ||
                (p.diasVencimiento === 14 && p.diasRestantes <= 4) ? (
                  <button className="btn btn-outline-light btn-sm me-2" onClick={() => marcarComoRevisado(p.id)}>
                    Revisar
                  </button>
                ) : null}
                <button className="btn btn-outline-light btn-sm" onClick={() => cancelarEmpaque(p.id)}>
                  Cancelar
                </button>
              </>
            )}
            {p.estado === 'vencido' && (
              <button className="btn btn-outline-light btn-sm" onClick={() => marcarComoRevisado(p.id)}>
                Revisar Vencido
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
