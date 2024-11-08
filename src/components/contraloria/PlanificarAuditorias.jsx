import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import AsignarAuditorias from './AsignarAuditorias';
import { collection, getDocs } from 'firebase/firestore';
import NavBar from './NavBar';
import '../../CSS/PlanificacionInicial.css'; // Asegúrate de importar el archivo CSS
import { db } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';

const PlanificarAuditorias = () => {
    const [dependencias, setDependencias] = useState([]);
    const [selectedDependencias, setSelectedDependencias] = useState([]);
    const [totalAuditorias, setTotalAuditorias] = useState(0);
    const [mostrarAsignarAuditorias, setMostrarAsignarAuditorias] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la visibilidad del modal
    const [modalMessage, setModalMessage] = useState(''); // Mensaje del modal
    const {nombrePlanAnual} = useParams();
    useEffect(() => {
        cargarDependencias();
    }, []);

    const cargarDependencias = async () => {
        //Obtener las dependencias de la base de datos
        const dependenciasSnapshot = await getDocs(collection(db, 'dependencias'));
        //Recorre las dependencias y busca los departamentos
        const dependenciasList = await Promise.all(dependenciasSnapshot.docs.map(async (doc) => {
            const departamentosSnapshot = await getDocs(collection(db, 'dependencias', doc.id, 'departamentos'));
            const departamentosList = departamentosSnapshot.docs.map((departamentoDoc) => ({
                value: departamentoDoc.id, //Departamento id 
                label: departamentoDoc.data().nombreDepartamento, //Nombre del departamento
                titular: departamentoDoc.data().titular, // Titular
                type: 'departamento', // Para identificar como departamento
                dependenciaNombre: doc.data().nombre // Agregar nombre de la dependencia
            }));

            return [
                {
                    //Aqui sale la info de las dependencias
                    value: doc.id, //Dependencia id
                    label: doc.data().nombre, //Nombre de la dependencia
                    titular: doc.data().titular, //Titular de la dependencia
                    type: 'dependencia', // Para identificar como dependencia
                },
                ...departamentosList,
            ];
        }));

        // Unir todas las dependencias y departamentos en un solo array y eliminar duplicados
        const uniqueDependencias = Array.from(new Set(dependenciasList.flat().map(item => item.value)))
            .map(value => dependenciasList.flat().find(item => item.value === value));

        setDependencias(uniqueDependencias.sort((a, b) => a.label.localeCompare(b.label))); // Ordenar alfabéticamente
    };

    const handleSelectChange = (option) => {
        if (!selectedDependencias.some(dep => dep.value === option.value)) {
            //Agrega la dependencia a la lista de dependencias seleccionadas
            setSelectedDependencias([...selectedDependencias, option]);
            //Actualiza la lista de dependencias para no mostrar en el select la dependencia que se acaba de agregar
            setDependencias(dependencias.filter(dep => dep.value !== option.value));
        }
        console.log(selectedDependencias);
    };

    const handleRemoveDependencia = (dependencia) => {
        // Asegurarse de que la dependencia se elimine correctamente
        setSelectedDependencias(selectedDependencias.filter(dep => dep.value !== dependencia.value));
        
        // Reagregar la dependencia a la lista
        setDependencias(prevDependencias => {
            // Comprobar si la dependencia ya está en la lista
            if (!prevDependencias.some(dep => dep.value === dependencia.value)) {
                return [...prevDependencias, dependencia].sort((a, b) => a.label.localeCompare(b.label));
            }
            return prevDependencias;
        });
    };

    const handleSiguiente = () => {
        if (selectedDependencias.length === 0 || totalAuditorias === 0) {
            setModalMessage('Por favor seleccione al menos una dependencia y defina el total de auditorías.');
            setIsModalOpen(true)
            return;
        }
        setMostrarAsignarAuditorias(true);
    };

    const handleVolver = () => {
        setMostrarAsignarAuditorias(false);
    };

    return (
        <div>
            <NavBar />
            {mostrarAsignarAuditorias ? (
                <AsignarAuditorias
                    selectedDependencias={selectedDependencias}
                    totalAuditorias={totalAuditorias}
                    onBack={handleVolver}
                    programaId={nombrePlanAnual}
                />
            ) : (
                <div className='plan-container'>
                    <h2>Planificar Auditorías - {nombrePlanAnual}</h2>
                    <label>Sujetos Fiscalizables</label>
                    <Select
                        options={dependencias}
                        onChange={handleSelectChange}
                        placeholder="Selecciona una dependencia o departamento"
                        className='select-dependencias'
                    />

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Dependencia/Departamento</th>
                                    <th>Titular</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedDependencias.map((dependencia) => (
                                    <tr key={dependencia.value}>
                                        <td className='left-align'> 
                                            {dependencia.type === 'dependencia' 
                                                ? dependencia.label 
                                                : <div>
                                                    {dependencia.label} <br />
                                                    <span style={{ fontSize: '0.8em', color: 'gray' }}>{dependencia.dependenciaNombre}</span>
                                                  </div>
                                            }
                                        </td>
                                        <td>{dependencia.type === 'dependencia' ? dependencia.titular : dependencia.titular}</td>
                                        <td>
                                            <button onClick={() => handleRemoveDependencia(dependencia)} className='button-eliminar'>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <label>Total de Auditorías:</label>
                        <input
                            type="number"
                            value={totalAuditorias}
                            onChange={(e) => setTotalAuditorias(Number(e.target.value))}
                            min="0"
                            className='input-total-auditorias'
                        />
                    </div>

                    <button onClick={handleSiguiente} className='button-siguiente'>Siguiente</button>
                </div>
            )}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                    <FontAwesomeIcon icon={faInfoCircle} size="5x" color='red'/>     
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

export default PlanificarAuditorias;
