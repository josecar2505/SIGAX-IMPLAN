import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import NavBar from "./NavBar";
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
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
            const auditoriasData = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    let archivoURL = null;

                    // Intentar obtener el archivo desde Firebase Storage
                    try {
                        const archivoRef = ref(storage, `auditorias/${doc.id}/auditoria_${doc.id}.pdf`);
                        archivoURL = await getDownloadURL(archivoRef);
                    } catch (error) {
                        //console.warn(`No se encontró archivo para la auditoría ${doc.id}`);
                    }

                    return { id: doc.id, ...data, archivoURL };
                })
            );
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
        <div>
            <NavBar />
            <div className="plan-auditorias-container">
                <h2 className="plan-auditorias-title">Plan Anual de Auditorías {currentYear}</h2>
                {loading ? (
                    <div className="loading-spinner">Cargando auditorías...</div>
                ) : (
                    <div>
                        <table className='plan-auditorias-table'>
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
                                    <th>Archivos</th>
                                </tr>
                            </thead>
                            <tbody className="plan-auditorias-tbody">
                                {auditoriasData.map((auditoria, index) => (
                                    <tr key={auditoria.id}>
                                        <td className="center-align">{index + 1}</td>
                                        <td>{auditoria.nombre || "Sin nombre asignado"}</td>
                                        <td>{auditoria.dependenciaNombre || "Sin dependencia asignada"}</td>
                                        <td>{auditoria.tipoAuditoria || "Sin tipo asignado"}</td>
                                        <td className="center-align">{auditoria.fechaInicio || "Fecha no asignada"}</td>
                                        <td className="center-align">{auditoria.fechaFin || "Fecha no asignada"}</td>
                                        <td>{auditoria.supervisor || "Sin supervisor asignado"}</td>
                                        <td>{auditoria.auditores?.length ? auditoria.auditores.join(', ') : "Sin auditores asignados"}</td>
                                        <td className="center-align">
                                            <button
                                                className="plan-auditorias-button"
                                                onClick={() => handleEditClick(auditoria)}
                                                aria-label={`Editar auditoría ${auditoria.nombre}`}
                                            >
                                                <FaEdit />
                                            </button>
                                        </td>
                                        <td className="center-align">
                                            {auditoria.archivoURL ? (
                                                <a href={auditoria.archivoURL} target="_blank" rel="noopener noreferrer" aria-label={`Abrir archivo de ${auditoria.nombre}`}>
                                                    <FontAwesomeIcon icon={faFile} size='2x' color='black' title='Archivo en firebase...'/>
                                                </a>
                                            ) : (
                                                "Sin archivo"
                                            )}
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
