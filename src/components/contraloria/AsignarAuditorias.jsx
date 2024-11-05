import { useState } from 'react';
import { db } from '../firebase/config';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../../CSS/PlanificacionInicial.css';
import '../../CSS/Modal.css'; // Importa el archivo CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
const AsignarAuditorias = ({ selectedDependencias, totalAuditorias, onBack, programaId }) => {

    const navigate = useNavigate();
    const currentYear = new Date().getFullYear(); //Obtener el año actual
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
    const [modalMessage, setModalMessage] = useState(''); // Mensaje del modal
    const [snackbarVisible, setSnackbarVisible] = useState(false);

    // Variable para contar auditorías por dependencia
    const auditoriaCounts = {};

    // Función para generar el nombre de la auditoría
    const generarNombreAuditoria = (dependencia, tipoAuditoria, numeroAuditoria, año) => {
        const inicialesDependencia = dependencia.label
            .split(' ')  // Dividir el nombre por espacios
            .map(word => word.charAt(0).toUpperCase()) // Obtener la primera letra y convertir a mayúscula
            .join('');  // Unir las letras en una cadena
        const inicialesTipo = tipoAuditoria
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
        return `${inicialesDependencia}.${inicialesTipo}.${numeroAuditoria}.${año}`;
    };

    const [auditorias, setAuditorias] = useState(
        selectedDependencias.map(() => ({ financiera: 0, obraPublica: 0, evaluacion: 0 }))
    );
    console.log(selectedDependencias);
    const [auditoriasAsignadas, setAuditoriasAsignadas] = useState({
        financiera: 0,
        obraPublica: 0,
        evaluacion: 0,
    });

    // Función para manejar cambios en las auditorías totales
    const handleTotalChange = (field, value) => {
        const newValue = Number(value);
        const updatedTotals = {
            ...auditoriasAsignadas,
            [field]: newValue,
        };

        // Asegúrate de que la suma total no exceda el totalAuditorias
        const totalSum = updatedTotals.financiera + updatedTotals.obraPublica + updatedTotals.evaluacion;
        if (totalSum <= totalAuditorias) {
            setAuditoriasAsignadas(updatedTotals);
        } else {
            setModalMessage(`La suma total de auditorías no puede exceder ${totalAuditorias}.`);
            setIsModalOpen(true)
        }
    };

    const handleAuditoriaChange = (index, field, value) => {
        const newValue = Number(value);
        const updatedAuditorias = [...auditorias];

        // Validar que la suma de las auditorías no exceda el total asignado
        const totalFinanciera = updatedAuditorias.reduce((sum, audit) => sum + audit.financiera, 0);
        const totalObraPublica = updatedAuditorias.reduce((sum, audit) => sum + audit.obraPublica, 0);
        const totalEvaluacion = updatedAuditorias.reduce((sum, audit) => sum + audit.evaluacion, 0);

        if (field === 'financiera' && totalFinanciera + newValue - updatedAuditorias[index].financiera > auditoriasAsignadas.financiera) {
            setModalMessage(`La suma de auditorías financieras no puede exceder ${auditoriasAsignadas.financiera}.`);
            setIsModalOpen(true)
            return; // No actualizar si se excede
        }

        if (field === 'obraPublica' && totalObraPublica + newValue - updatedAuditorias[index].obraPublica > auditoriasAsignadas.obraPublica) {
            setModalMessage(`La suma de auditorías de obra pública no puede exceder ${auditoriasAsignadas.obraPublica}.`);
            setIsModalOpen(true)
            return; // No actualizar si se excede
        }

        if (field === 'evaluacion' && totalEvaluacion + newValue - updatedAuditorias[index].evaluacion > auditoriasAsignadas.evaluacion) {
            setModalMessage(`La suma de auditorías de evaluación no puede exceder ${auditoriasAsignadas.evaluacion}.`);
            setIsModalOpen(true)
            return; // No actualizar si se excede
        }

        // Actualiza la auditoría del índice correspondiente
        updatedAuditorias[index][field] = newValue;

        // Actualiza el estado de auditorías
        setAuditorias(updatedAuditorias);
    };

    const validateSums = () => {
        // Sumar las auditorías de cada columna
        const totalFinanciera = auditorias.reduce((sum, audit) => sum + audit.financiera, 0);
        const totalObraPublica = auditorias.reduce((sum, audit) => sum + audit.obraPublica, 0);
        const totalEvaluacion = auditorias.reduce((sum, audit) => sum + audit.evaluacion, 0);

        // Validar que no excedan los totales asignados
        if (totalFinanciera > auditoriasAsignadas.financiera) {
            setModalMessage(`La suma de auditorías financieras no puede exceder ${auditoriasAsignadas.financiera}. Actualmente es ${totalFinanciera}.`);
            setIsModalOpen(true)
            return false;
        }

        if (totalObraPublica > auditoriasAsignadas.obraPublica) {
            setModalMessage(`La suma de auditorías de obra pública no puede exceder ${auditoriasAsignadas.obraPublica}. Actualmente es ${totalObraPublica}.`);
            setIsModalOpen(true)
            return false;
        }

        if (totalEvaluacion > auditoriasAsignadas.evaluacion) {
            setModalMessage(`La suma de auditorías de evaluación no puede exceder ${auditoriasAsignadas.evaluacion}. Actualmente es ${totalEvaluacion}.`);
            setIsModalOpen(true)
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        // Sumar las auditorías de cada dependencia
        const totalFinanciera = auditorias.reduce((sum, audit) => sum + audit.financiera, 0);
        const totalObraPublica = auditorias.reduce((sum, audit) => sum + audit.obraPublica, 0);
        const totalEvaluacion = auditorias.reduce((sum, audit) => sum + audit.evaluacion, 0);

        // Suma total de todas las auditorías
        const totalAsignado = totalFinanciera + totalObraPublica + totalEvaluacion;

        // Validar que la suma total asignada sea igual al totalAuditorias
        const totalTipos = auditoriasAsignadas.financiera + auditoriasAsignadas.obraPublica + auditoriasAsignadas.evaluacion;

        if (totalTipos !== totalAuditorias) {
            setModalMessage(`El total de tipos de auditoría debe ser igual a(${totalAuditorias}).`);
            setIsModalOpen(true)
            return;
        }

        if (totalAsignado !== totalAuditorias) {
            setModalMessage(`La suma de auditorías asignadas (${totalAsignado}) debe ser igual al total (${totalAuditorias}).`);
            setIsModalOpen(true)
            return;
        }

        // Validar que las sumas parciales no excedan los límites
        if (!validateSums()) {
            return;
        }

        // Guardar auditorías
        try {
            for (let i = 0; i < selectedDependencias.length; i++) {
                const dependencia = selectedDependencias[i];
                const tiposAuditoria = [
                    { tipo: 'Financiera', cantidad: auditorias[i].financiera },
                    { tipo: 'Obra Pública', cantidad: auditorias[i].obraPublica },
                    { tipo: 'Evaluación', cantidad: auditorias[i].evaluacion }
                ];

                // Inicializar contador para la dependencia si no existe
                if (!auditoriaCounts[dependencia.label]) {
                    auditoriaCounts[dependencia.label] = {};
                }

                for (const tipoAuditoria of tiposAuditoria) {
                    const añoPrograma = new Date().getFullYear(); // Suponiendo que el programa es del año actual

                    for (let j = 0; j < tipoAuditoria.cantidad; j++) {
                        if (tipoAuditoria.cantidad > 0) {
                            // Incrementar el contador para el tipo de auditoría de la dependencia
                            if (!auditoriaCounts[dependencia.label][tipoAuditoria.tipo]) {
                                auditoriaCounts[dependencia.label][tipoAuditoria.tipo] = 0;
                            }
                            auditoriaCounts[dependencia.label][tipoAuditoria.tipo]++;

                            // Generar el nombre
                            const numeroAuditoria = auditoriaCounts[dependencia.label][tipoAuditoria.tipo];
                            const auditoriaNombre = generarNombreAuditoria(dependencia, tipoAuditoria.tipo, numeroAuditoria, añoPrograma);

                            await addDoc(collection(db, 'auditorias'), {
                                auditores: [],
                                dependenciaId: dependencia.value,
                                fechaFin: "",
                                fechaInicio: "",
                                nombre: auditoriaNombre, // Guardar el nombre generado
                                supervisor: "",
                                tipoAuditoria: tipoAuditoria.tipo,
                                dependenciaNombre: dependencia.label,
                                programaId: programaId,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error al guardar las auditorías: ', error);
            setModalMessage('Hubo un error al guardar las auditorías.');
            setIsModalOpen(true);
        }
    };


    return (
        <div className="asignar-auditorias-container">
            <h2>Programa anual de auditorias {currentYear}</h2>
            {snackbarVisible && (
                <div className="snackbar">Datos guardados correctamente</div>
            )}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th rowSpan="2">No.</th>
                            <th rowSpan="2">Sujetos Fiscalizables</th>
                            <th colSpan="4">Tipos de Auditoría</th> {/* Agrupamos las auditorías en una columna */}
                        </tr>
                        <tr>
                            <th>Financiera</th>
                            <th>Obra Pública</th>
                            <th>Evaluación al Desempeño</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>-</td>
                            <td>Total</td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={auditoriasAsignadas.financiera}
                                    onChange={(e) => handleTotalChange('financiera', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={auditoriasAsignadas.obraPublica}
                                    onChange={(e) => handleTotalChange('obraPublica', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    min="0"
                                    value={auditoriasAsignadas.evaluacion}
                                    onChange={(e) => handleTotalChange('evaluacion', e.target.value)}
                                />
                            </td>
                            <td>
                                {totalAuditorias}
                            </td>
                        </tr>
                        {selectedDependencias.map((dependencia, index) => (
                            <tr key={dependencia.value}>
                                <td>{index + 1}</td>
                                <td className='left-align'>

                                    {dependencia.type === 'dependencia'
                                        ? dependencia.label
                                        : <div>
                                            {dependencia.label} <br />
                                            <span style={{ fontSize: '0.8em', color: 'gray' }}>{dependencia.dependenciaNombre}</span>
                                        </div>
                                    }
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Financiera"
                                        min="0"
                                        value={auditorias[index].financiera}
                                        onChange={(e) => handleAuditoriaChange(index, 'financiera', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Obra Pública"
                                        min="0"
                                        value={auditorias[index].obraPublica}
                                        onChange={(e) => handleAuditoriaChange(index, 'obraPublica', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Evaluación"
                                        min="0"
                                        value={auditorias[index].evaluacion}
                                        onChange={(e) => handleAuditoriaChange(index, 'evaluacion', e.target.value)}
                                    />
                                </td>
                                <td>
                                    {auditorias[index].financiera + auditorias[index].obraPublica + auditorias[index].evaluacion}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='button-container'>
                <button className='button-volver' onClick={onBack}>
                    Volver
                </button>
                <button className='button-guardar' onClick={handleSave}>
                    Guardar
                </button>
            </div>


            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <FontAwesomeIcon icon={faTriangleExclamation} size="5x" color='red' beat />
                        <h2 className="modal-title">Alerta</h2>
                        <p>{modalMessage}</p>
                        <div className="modal-actions">
                            <button onClick={() => setIsModalOpen(false)} className="btn btn-sai">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignarAuditorias;
