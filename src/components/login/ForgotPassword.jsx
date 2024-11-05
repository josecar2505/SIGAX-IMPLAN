import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUserLarge } from "react-icons/fa6";
import { AiOutlineArrowLeft } from 'react-icons/ai'; 
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config'; // Asegúrate de que este sea el camino correcto a tu configuración de Firebase
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import '../../CSS/login.css';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ForgotPassword = () => {
  const { register, handleSubmit } = useForm();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"
  const navigate = useNavigate();
  const auth = getAuth();

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit = async (data) => {
    const email = data.username;

    // Verificar si el correo está registrado en Firestore
    const usersRef = collection(db, 'usuarios');
    const q = query(usersRef, where("email", "==", email)); // Ajusta el campo "email" según tu colección

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSnackbarMessage("No se encontró un usuario con ese correo.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return; // Detener aquí si no se encuentra el usuario
      }

      // Si el usuario existe, enviar el correo de restablecimiento de contraseña
      await sendPasswordResetEmail(auth, email);
      setSnackbarMessage("Correo de restablecimiento enviado. Revisa tu bandeja de entrada.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setTimeout(() => navigate('/login'), 5000); // Redirige a la página de inicio de sesión después de 5 segundos
    } catch (error) {
      console.error("Error al enviar correo de restablecimiento:", error);
      setSnackbarSeverity("error");
      if (error.code === 'auth/invalid-email') {
        setSnackbarMessage("El correo electrónico no es válido.");
      } else {
        setSnackbarMessage("Hubo un error. Intenta de nuevo más tarde.");
      }
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="login-page">
      <div className="login-back-button-container">
        <Link to="/login" className="back-button">
          <AiOutlineArrowLeft size={22} /> 
        </Link>
      </div>
      <div className="login-container">
        <div className="image-forgotPass-container"></div>
        <div className="form-container">
          <h2>¿Olvidaste tu contraseña?</h2>
          <p>Escríbenos tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-container">
              <FaUserLarge className="icon" />
              <input
                type="email"
                className='login-input'
                placeholder="Correo electrónico"
                {...register("username", { required: true })}
              />
            </div>
            <button type="submit" className='login-button'>Enviar correo para restablecer contraseña</button>
          </form>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posicionar en el centro y arriba
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

export default ForgotPassword;
