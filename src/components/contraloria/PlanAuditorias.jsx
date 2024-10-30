import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import NavBar from "./NavBar";
import "../../CSS/PlanAuditorias.css";

const PlanAuditorias = () => {
    const navigate = useNavigate();
    const [auditoriasData, setAuditoriasData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const currentYear = new Date().getFullYear();

    const verificarAuditorias = async () => {
        try {
            const auditoriasRef = collection(db, 'auditorias');
            const querySnapshot = await getDocs(auditoriasRef);
            const auditoriasData = querySnapshot.empty ? [] : querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAuditoriasData(auditoriasData);
        } catch (error) {
            console.error("Error al obtener auditorías: ", error);
            setAuditoriasData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verificarAuditorias();
    }, []);

    const handleEditClick = (auditoria) => {
        navigate(`/auditoria/${auditoria.id}`, { state: { auditoria } });
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sortedAuditorias = [...auditoriasData].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
            return 0;
        });

        setAuditoriasData(sortedAuditorias);
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key) => (sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽') : '');

    return (
        <div className="planAuditorias-page">
            <NavBar />
            <div className="plan-auditorias-container">
                <h2 className="plan-auditorias-title">Plan Anual de Auditorías {currentYear}</h2>
                {loading ? (
                    <div className="loading-spinner">Cargando auditorías...</div>
                ) : (
                    <div >
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th onClick={() => requestSort('nombre')}>Nombre {renderSortIcon('nombre')}</th>
                                    <th onClick={() => requestSort('dependenciaNombre')}>Dependencia {renderSortIcon('dependenciaNombre')}</th>
                                    <th onClick={() => requestSort('tipoAuditoria')}>Tipo {renderSortIcon('tipoAuditoria')}</th>
                                    <th onClick={() => requestSort('fechaInicio')}>Fecha Inicio {renderSortIcon('fechaInicio')}</th>
                                    <th onClick={() => requestSort('fechaFin')}>Fecha Fin {renderSortIcon('fechaFin')}</th>
                                    <th onClick={() => requestSort('supervisor')}>Supervisor {renderSortIcon('supervisor')}</th>
                                    <th onClick={() => requestSort('auditores')}>Auditores {renderSortIcon('auditores')}</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="plan-auditorias-tbody">
                                {auditoriasData.map((auditoria, index) => (
                                    <tr key={auditoria.id}>
                                        <td>{index + 1}</td>
                                        <td>{auditoria.nombre || "Sin nombre asignado"}</td>
                                        <td>{auditoria.dependenciaNombre || "Sin dependencia asignada"}</td>
                                        <td>{auditoria.tipoAuditoria || "Sin tipo asignado"}</td>
                                        <td>{auditoria.fechaInicio || "Fecha no asignada"}</td>
                                        <td>{auditoria.fechaFin || "Fecha no asignada"}</td>
                                        <td>{auditoria.supervisor || "Sin supervisor asignado"}</td>
                                        <td>{auditoria.auditores?.length ? auditoria.auditores.join(', ') : "Sin auditores asignados"}</td>
                                        <td>
                                            <button
                                                className="plan-auditorias-button"
                                                onClick={() => handleEditClick(auditoria)}
                                                aria-label={`Editar auditoría ${auditoria.nombre}`}
                                            >
                                                <FaEdit />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

};

export default PlanAuditorias;
