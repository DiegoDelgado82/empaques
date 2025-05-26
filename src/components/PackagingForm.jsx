import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const PackagingForm = () => {
  const [ean, setEan] = useState('');
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('');

  const handleSearch = async () => {
    if (!ean) return;

    try {
      const docRef = doc(db, 'productos', ean);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
        setStatus('');
      } else {
        setProduct(null);

        setStatus(`Producto no encontrado: ${ean}`);
      }
    } catch (error) {
      console.error(error);
      setStatus('Error al buscar el producto.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    const today = dayjs();
    const vencimiento = today.add(product.dias_vencimiento, 'day');

    try {
      await addDoc(collection(db, 'envasados'), {
        ean,
        nombre: product.nombre,
        envasado: Timestamp.fromDate(today.toDate()),
        vencimiento: Timestamp.fromDate(vencimiento.toDate()),
        dias_vencimiento: product.dias_vencimiento,
      });
      setStatus('✅ Registro guardado correctamente.');
      setEan('');
      setProduct(null);
    } catch (error) {
      console.error(error);
      setStatus('❌ Error al guardar el registro.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Registrar Envasado</h2>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">PLU</label>
          <input
            type="text"
            className="form-control"
            value={ean}
            
            onChange={(e) => setEan(e.target.value)}
            onBlur={handleSearch}
            placeholder="Escribí el PLU"
          />
    
        </div>

        {product && (
          <>
            <div className="col-md-6">
              <label className="form-label">Producto</label>
              <input
                type="text"
                className="form-control"
                value={product.nombre}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Días hasta vencimiento</label>
              <input
                type="number"
                className="form-control"
                value={product.dias_vencimiento}
                readOnly
              />
            </div>
          </>
        )}

        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={!product}>
            Registrar Envasado
          </button>
        </div>

        {status && (
          <div className="col-12">
            <div className="alert alert-info">{status}</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PackagingForm;
