
import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  getDoc
} from 'firebase/firestore';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [alertaMostrada, setAlertaMostrada] = useState(false);

  const obtenerProductos = async () => {
    const q = query(collection(db, 'empaques'));
    const snapshot = await getDocs(q);

    const lista = snapshot.docs.map(doc => {
      const data = doc.data();
      if (!data.fechaVencimiento || !data.fechaEnvasado) return null;

      const fechaVencimiento = data.fechaVencimiento.toDate();
      const diasRestantes = dayjs(fechaVencimiento).diff(dayjs(), 'day');

      return {
        id: doc.id,
        ...data,
        diasRestantes,
        fechaVencimiento: dayjs(fechaVencimiento).format('DD/MM/YYYY'),
        fechaEnvasado: dayjs(data.fechaEnvasado.toDate()).format('DD/MM/YYYY')
      };
    });

    setProductos(lista.filter(Boolean));
  };

  const actualizarVencidos = useCallback(async () => {
    const hoy = dayjs().startOf('day');

    for (let p of productos) {
      const vencimiento = dayjs(p._rawFechaVencimiento || p.fechaVencimiento, 'DD/MM/YYYY').startOf('day');
      if (p.estado === 'creado' && vencimiento.isBefore(hoy)) {
        await updateDoc(doc(db, 'empaques', p.id), { estado: 'vencido' });
      }
    }

    obtenerProductos();
  }, [productos]);

  const lanzarAlertas = useCallback(() => {
    const criticos = productos.filter(p => p.estado === 'creado' && p.diasRestantes <= 3);
    if (criticos.length > 0 && !alertaMostrada) {
      Swal.fire({
        icon: 'warning',
        title: '¡Productos por vencer!',
        html: `Tenés <b>${criticos.length}</b> productos que vencen en 3 días o menos.`,
        confirmButtonText: 'Ver ahora'
      });
      setAlertaMostrada(true);
    }
  }, [productos, alertaMostrada]);

  const marcarComoRevisado = async (id) => {
    const ref = doc(db, 'empaques', id);
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) {
      Swal.fire('Error', 'No se encontró el documento.', 'error');
      return;
    }

    await updateDoc(ref, { estado: 'revisado' });
    setProductos(prev => prev.filter(p => p.id !== id));
    Swal.fire('Revisado', 'Producto marcado como revisado.', 'success');
  };

  const cancelarEmpaque = async (id) => {
    const confirmar = await Swal.fire({
      title: '¿Cancelar empaque?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });

    if (confirmar.isConfirmed) {
      await updateDoc(doc(db, 'empaques', id), { estado: 'cancelado' });
      setProductos(prev => prev.filter(p => p.id !== id));
      Swal.fire('Cancelado', 'El empaque fue cancelado.', 'success');
    }
  };

  const getColorClass = (dias) => {
    if (dias <= 3) return 'bg-danger text-white';
    if (dias <= 7) return 'bg-warning text-dark';
    return 'bg-success text-white';
  };

  const productosFiltrados = productos.filter(p => {
    if (filtroEstado === 'todos') return p.estado !== 'cancelado' && p.estado !== 'revisado';
    return p.estado === filtroEstado;
  });

  useEffect(() => {
    obtenerProductos();
  }, []);

  useEffect(() => {
    if (productos.length > 0) {
      actualizarVencidos();
      lanzarAlertas();
    }
  }, [productos, actualizarVencidos, lanzarAlertas]);

  const isMobile = window.innerWidth < 576;

  return (
    <div className="container mt-4">
      <h2>Control de Productos Etiquetados</h2>

      <div className="mb-3">
        <label>Filtrar por estado:</label>
        <select
          className="form-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos (excepto cancelados y revisados)</option>
          <option value="creado">Creados</option>
          <option value="revisado">Revisados</option>
          <option value="vencido">Vencidos</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {!isMobile ? (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Descripción</th>
                <th>PLU</th>
                <th>Envasado</th>
                <th>Vencimiento</th>
                <th>Días restantes</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id} className={getColorClass(p.diasRestantes)}>
                  <td>{p.descripcion}</td>
                  <td>{p.ean}</td>
                  <td>{p.fechaEnvasado}</td>
                  <td>{p.fechaVencimiento}</td>
                  <td>{p.diasRestantes}</td>
                  <td>{p.estado}</td>
                  <td>
                    {p.estado === 'creado' && (
                      <>
                        {(p.diasVencimiento === 30 && p.diasRestantes <= 7) ||
                        (p.diasVencimiento === 14 && p.diasRestantes <= 4) ? (
                          <button className="btn btn-outline-light btn-sm me-2" onClick={() => marcarComoRevisado(p.id)}>
                            <FaEye /> Revisar
                          </button>
                        ) : null}
                        <button className="btn btn-outline-light btn-sm" onClick={() => cancelarEmpaque(p.id)}>
                          Cancelar
                        </button>
                      </>
                    )}
                    {p.estado === 'vencido' && (
                      <button className="btn btn-outline-light btn-sm" onClick={() => marcarComoRevisado(p.id)}>
                        <FaEye /> Revisar Vencido
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        productosFiltrados.map(p => (
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
                    <button className="btn btn-light btn-sm me-2" onClick={() => marcarComoRevisado(p.id)}>
                      <FaEye /> Revisar
                    </button>
                  ) : null}
                  <button className="btn btn-outline-light btn-sm" onClick={() => cancelarEmpaque(p.id)}>
                    Cancelar
                  </button>
                </>
              )}
              {p.estado === 'vencido' && (
                <button className="btn btn-light btn-sm" onClick={() => marcarComoRevisado(p.id)}>
                  <FaEye /> Revisar Vencido
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
