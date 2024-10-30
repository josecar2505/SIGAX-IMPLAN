import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaLock,  } from "react-icons/fa6";
import { AiOutlineArrowLeft } from 'react-icons/ai'; 
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../firebase/config';
import { AuthContext } from '../auth/AuthContext'; // Importar AuthContext
import '../../CSS/login.css';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Obtener la función de login desde el contexto
  const [auditorias, setAuditorias] = useState(null);
  const verificarAuditorias = async () => {
    const auditoriasRef = collection(db, 'auditorias');
    const querySnapshot = await getDocs(auditoriasRef);

    if (!querySnapshot.empty) {
      const auditoriasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAuditorias(auditoriasData);
    } else {
      setAuditorias([]);
    }
  };

    // Ejecuta verificarAuditorias cuando se monta el componente
    useEffect(() => {
      verificarAuditorias();
    }, []);
  
  const onSubmit = async (data) => {
    try {
      // Consulta a Firestore buscando el usuario
      const q = query(collection(db, "usuarios"), where("usuario", "==", data.username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data(); 

        if (userData.password === data.password) {
          
          // Llamamos a la función login con el rol del usuario
          login(userData.rol);

          // Guarda el token y el rol en localStorage
          localStorage.setItem("userName", userData.name); // Aquí puedes cambiar "your-auth-token" por un token real si tienes uno
          localStorage.setItem("userRole", userData.rol); // Guarda el rol del usuario
          // Redirigir según el rol
          if (userData.rol === "AUDITOR") {
            navigate("/auditoria");
          } else if (userData.rol === "CONTRALOR") {
            if(auditorias && auditorias.length> 0){
              navigate("/contraloria/PlanAuditorias")
            }else{
              navigate("/contraloria/PlanificarAuditorias")
            }
          } else {
            alert("Rol desconocido. Contacta al administrador.");
          }
        } else {
          alert("Contraseña incorrecta.");
        }
      } else {
        alert("Usuario no encontrado.");
      }
    } catch (error) {
      alert("Ocurrió un error al iniciar sesión.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-back-button-container">
        <Link to="/" className="back-button">
          <AiOutlineArrowLeft size={22} /> 
        </Link>
      </div>
      <div className="login-container">
        <div className="image-container"></div>
        <div className="form-container">
          <h2>Ingresar</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-container">
              <FaLock className="icon" />
              <input
              className='login-input'
                type="text"
                placeholder="Usuario"
                {...register("username")}
                required
              />
            </div>


            <div className="input-container">
              <FaLock className="icon" />
              <input
              className='login-input'
                type="password"
                placeholder="Contraseña"
                {...register("password")}
                required 
              />
            </div>

            <button type="submit" className='login-button'>Ingresar</button>
            <br />
            <a href="/forgotPassword">¿Olvidaste tu contraseña?</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
