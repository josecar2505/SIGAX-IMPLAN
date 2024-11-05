import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaLock } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { AiOutlineArrowLeft } from 'react-icons/ai'; 
import { Link, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from '../firebase/config';
import { AuthContext } from '../auth/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import '../../CSS/login.css';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [auditorias, setAuditorias] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const auth = getAuth();

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

  useEffect(() => {
    verificarAuditorias();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      let email = data.emailOrUsername;
      let password = data.password;

      if (!email.includes('@')) {
        const usersRef = collection(db, 'usuarios');
        const q = query(usersRef, where("usuario", "==", email));
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          email = userDoc.data().email;
        } else {
          setSnackbarMessage("Nombre de usuario no encontrado.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        login(userData.rol, user.uid);
        localStorage.setItem("authToken", user.uid);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userRole", userData.rol);
        //Navegación dependiendo del rol del usuario
        if (userData.rol === "AUDITOR") {
          navigate("/auditoria");
        } else if (userData.rol === "CONTRALOR") {
          //Condición si hay o nel auditorias
          //navigate(auditorias && auditorias.length > 0 ? "/contraloria/PlanAuditorias" : "/contraloria/PlanificarAuditorias");
          navigate("/contraloria/DashboardContralor");
        } else {
          setSnackbarMessage("Rol desconocido. Contacta al administrador.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } else {
        setSnackbarMessage("No se encontró información adicional del usuario.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("Error al iniciar sesión. Revisa tu usuario/correo y contraseña.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
              <FaUser className="icon" />
              <input
                className='login-input'
                type="text"
                placeholder="Correo o nombre de Usuario"
                {...register("emailOrUsername")}
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
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default Login;
