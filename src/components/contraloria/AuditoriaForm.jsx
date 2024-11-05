import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { collection, getDocs, query, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase/config"; // Asegúrate de importar `storage` también
import { useLocation, useNavigate } from "react-router-dom";
import { ref, uploadBytes } from "firebase/storage"; // Importa funciones de almacenamiento
import jsPDF from "jspdf"; // Importa jsPDF para la generación del PDF
import "../../CSS/AuditoriaForm.css";

const AuditoriaForm = () => {
  const { state } = useLocation();
  const auditoriaInicial = state?.auditoria || {};
  const [auditoria, setAuditoria] = useState(auditoriaInicial);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auditoresSeleccionados, setAuditoresSeleccionados] = useState(auditoria.auditores || []);
  const navigate = useNavigate();
  const [tiposAuditoria] = useState([
    { value: "Desempeño", label: "Desempeño" },
    { value: "Financiera", label: "Financiera" },
    { value: "Obras", label: "Obras" }
  ]);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const usuariosRef = collection(db, "usuarios");
      const qAuditores = query(usuariosRef);
      const resp = await getDocs(qAuditores);
      const users = resp.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setUsuarios(users);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (selectedOptions) => {
    const nuevosAuditores = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setAuditoresSeleccionados(nuevosAuditores);
    setAuditoria({ ...auditoria, auditores: nuevosAuditores });
  };

  const handleUpdate = (campo, valor) => {
    setAuditoria({ ...auditoria, [campo]: valor });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Auditoría: ${auditoria.nombre || `Auditoría ${auditoria.id}`}`, 10, 10);
    doc.text(`Dependencia: ${auditoria.dependenciaNombre || "Sin dependencia"}`, 10, 20);
    doc.text(`Tipo de Auditoría: ${auditoria.tipoAuditoria || ""}`, 10, 30);
    doc.text(`Auditores: ${auditoresSeleccionados.join(", ")}`, 10, 40);
    doc.text(`Supervisor: ${auditoria.supervisor || ""}`, 10, 50);
    doc.text(`Fecha de Inicio: ${auditoria.fechaInicio || ""}`, 10, 60);
    doc.text(`Fecha de Fin: ${auditoria.fechaFin || ""}`, 10, 70);

    return doc;
  };

  const savePDFtoStorage = async (pdfDoc) => {
    const pdfBlob = pdfDoc.output("blob");

    const storageRef = ref(storage, `auditorias/${auditoria.id}/auditoria_${auditoria.id}.pdf`);
    try {
      await uploadBytes(storageRef, pdfBlob);
      console.log("PDF subido correctamente a Firestore Storage.");
    } catch (error) {
      console.error("Error al subir el PDF:", error);
    }
  };

  const handleSave = async () => {
    try {
      const auditoriaRef = doc(db, 'auditorias', auditoria.id);
      await updateDoc(auditoriaRef, auditoria);

      // Genera el PDF y súbelo a Firestore Storage
      const pdfDoc = generatePDF();
      await savePDFtoStorage(pdfDoc);

      // Redirige después de 3 segundos
      setTimeout(() => {
        navigate("/contraloria/PlanAuditorias");
      }, 3000);
    } catch (error) {
      console.error('Error al actualizar la auditoría:', error);
    }
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;

  const auditores = usuarios.filter((user) => user.rol === "AUDITOR");
  const supervisores = usuarios.filter((user) => user.rol === "SUPERVISOR");
  const options = auditores.map(auditor => ({ value: auditor.nombre, label: auditor.nombre }));

  return (
    <div className="background-container">
      <div className="auditoria-form">
        <h3 className="auditoria-title">{auditoria.nombre || `Auditoría ${auditoria.id}`}</h3>

        <label htmlFor="dependencia">Dependencia</label>
        <input
          id="dependencia"
          type="text"
          value={auditoria.dependenciaNombre || "Sin dependencia"}
          disabled
        />

        <label htmlFor="tipo-auditoria">Tipo de Auditoría</label>
        <select
          disabled
          id="tipo-auditoria"
          value={auditoria.tipoAuditoria || ""}
          onChange={(e) => handleUpdate("tipoAuditoria", e.target.value)}
          required
        >
          <option value="" disabled hidden>Seleccionar</option>
          {tiposAuditoria.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
          ))}
        </select>

        <label htmlFor="auditor">Auditor(es)</label>
        <Select
          id="auditor"
          isMulti
          options={options}
          value={auditoresSeleccionados.map(auditor => ({ value: auditor, label: auditor }))}
          onChange={handleChange}
          isClearable
          placeholder="Selecciona auditores..."
        />

        <label htmlFor="supervisor">Supervisor</label>
        <select
          id="supervisor"
          value={auditoria.supervisor || ""}
          onChange={(e) => handleUpdate("supervisor", e.target.value)}
        >
          <option value="" disabled hidden>Seleccionar</option>
          {supervisores.map((s) => (
            <option key={s.id} value={s.nombre}>{s.nombre}</option>
          ))}
        </select>

        <div className="fecha-container">
          <div>
            <label htmlFor="fecha-inicio">Fecha de Inicio</label>
            <input
              type="date"
              id="fecha-inicio"
              value={auditoria.fechaInicio || ""}
              onChange={(e) => handleUpdate("fechaInicio", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="fecha-fin">Fecha de Fin</label>
            <input
              type="date"
              id="fecha-fin"
              value={auditoria.fechaFin || ""}
              onChange={(e) => handleUpdate("fechaFin", e.target.value)}
            />
          </div>
        </div>

        <div className="button-container">
          <button className="buttonBack" onClick={() => navigate("/contraloria/PlanAuditorias")}>
            Cancelar y volver
          </button>
          <button className="buttonAuditoriaForm" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default AuditoriaForm;
