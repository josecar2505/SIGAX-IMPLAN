import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebase/config';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../CSS/DashBoardContralor.css';
import NavBar from './NavBar';

const DashboardContralor = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [planAnualExistente, setPlanAnualExistente] = useState(false);
  const [calendarDates, setCalendarDates] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedAuditoria, setSelectedAuditoria] = useState(null);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  const verificarPlanAnual = async () => {
    const auditoriasRef = collection(db, 'auditorias');
    const nombrePlanAnual = `PAA${selectedYear}`;
    const q = query(auditoriasRef, where("programaId", "==", nombrePlanAnual));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setPlanAnualExistente(true);
      const auditoriasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAuditorias(auditoriasData);

      const dates = auditoriasData.map(auditoria => ({
        start: new Date(auditoria.fechaInicio),
        end: new Date(auditoria.fechaFin),
      }));
      setCalendarDates(dates);
    } else {
      setPlanAnualExistente(false);
    }
  };

  useEffect(() => {
    verificarPlanAnual();
  }, [selectedYear]);

  const iniciarNuevoPlanAnual = () => {
    const nombrePlanAnual = `PAA${selectedYear}`;
    navigate(`/contraloria/planificar-auditorias/${nombrePlanAnual}`);
  };

  const marcarFechas = ({ date, view }) => {
    if (view === 'month') {
      return calendarDates.some(({ start, end }) => date >= start && date <= end)
        ? 'highlight' : null;
    }
  };

  const handleDateClick = (date) => {
    const auditoria = auditorias.find(a => {
      const start = new Date(a.fechaInicio);
      const end = new Date(a.fechaFin);
      return date >= start && date <= end;
    });
    setSelectedAuditoria(auditoria || null);
  };

  const handleMouseOver = (date, e) => {
    const auditoria = auditorias.find(a => {
      const start = new Date(a.fechaInicio);
      const end = new Date(a.fechaFin);
      return date >= start && date <= end;
    });
    
    if (auditoria) {
      setTooltipText(auditoria.nombre);
      setTooltipPosition({
        top: e.clientY + 10, // Offset for tooltip
        left: e.clientX + 10
      });
    } else {
      setTooltipText('');
    }
  };

  const handleMouseOut = () => {
    setTooltipText('');
  };

  return (
    <div className="dashboard-contralor">
      <NavBar />
      <div className="dashboard-content">
        <h2>Programa Anual de Auditorias {selectedYear}</h2>

        <div className="calendar-section">
          {planAnualExistente ? (
            <>
              <Calendar
                onClickDay={handleDateClick}
                tileClassName={marcarFechas}
                onMouseOver={(date, e) => handleMouseOver(date, e)}
                onMouseOut={handleMouseOut}
              />
              {selectedAuditoria && (
                <div className="auditoria-details">
                  <h4>Detalles de la Auditoría:</h4>
                  <p><strong>Nombre:</strong> {selectedAuditoria.nombre}</p>
                  <p><strong>Fecha Inicio:</strong> {selectedAuditoria.fechaInicio}</p>
                  <p><strong>Fecha Fin:</strong> {selectedAuditoria.fechaFin}</p>
                </div>
              )}
              {tooltipText && (
                <div className="tooltip" style={{ position: 'absolute', top: tooltipPosition.top, left: tooltipPosition.left }}>
                  {tooltipText}
                </div>
              )}
            </>
          ) : (
            <div className="no-plan-message">
              <button className="btn" onClick={iniciarNuevoPlanAnual}>
                No hay un Plan Anual de Auditorías para el {selectedYear}. Haz clic aquí para crear uno.
              </button>
            </div>
          )}
        </div>

        <div className="year-selector">
          <label htmlFor="year-selector">Selecciona el Año:</label>
          <select
            id="year-selector"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {/* Permitir solo el año actual y los próximos 4 */}
            {[...Array(5).keys()].map(i => {
              const year = new Date().getFullYear() + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DashboardContralor;
