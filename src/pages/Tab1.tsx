import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import { mailOutline, lockClosedOutline, logInOutline, personAddOutline, alertCircleOutline } from 'ionicons/icons';
import { useAuth } from '../AuthContext';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Importa los estilos visuales desde el archivo CSS
import './Tab1.css';

// Asegúrate que esta ruta a la imagen es correcta después de copiarla a la carpeta 'public/'
const LOGO_URL = "/PCUPDATE.jpg";

const Tab1: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthAction = async () => {
    setError(null);
    const auth = getAuth();

    if (isRegister && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (!email || !password) {
      setError('Por favor, ingresa un correo electrónico y una contraseña.');
      return;
    }

    try {
      if (isRegister) {
        // Modo Registro
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Modo Login
        await signInWithEmailAndPassword(auth, email, password);
      }
      // La recarga de la página y la redirección son manejadas por AuthContext/App.tsx
    } catch (e: any) {
      // Manejo de errores de Firebase
      let errorMessage = 'Ocurrió un error desconocido.';
      if (e.code) {
        switch (e.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo ya está registrado.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico es inválido.';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Credenciales incorrectas.';
            break;
          default:
            errorMessage = `Error de autenticación: ${e.message}`;
        }
      }
      setError(errorMessage);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await auth.signOut();
      // La redirección es manejada por AuthContext/App.tsx
    } catch (e) {
      setError('No se pudo cerrar la sesión.');
    }
  };

  if (isAuthenticated && user) {
    // Vista de Perfil/Logout (cuando el usuario está logueado)
    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding ion-text-center auth-content-container">
          <IonCard className="auth-card">
            <IonCardHeader>
              <IonCardTitle>Bienvenido, {user.email || 'Usuario Anónimo'}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Tu ID de usuario (UID) es:</p>
              <p className="ion-margin-top ion-text-wrap">
                <IonIcon icon={alertCircleOutline} color="secondary" /> <strong>{user.uid}</strong>
              </p>
              <IonButton expand="block" color="danger" onClick={handleLogout} className="ion-margin-top primary-button large-button">
                CERRAR SESIÓN
              </IonButton>
            </IonCardContent>
          </IonCard>
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError(null)}
            header="Error"
            message={error || ''}
            buttons={['OK']}
          />
        </IonContent>
      </IonPage>
    );
  }

  // Vista de Login/Registro (cuando el usuario NO está logueado)
  return (
    <IonPage>
      {/* El IonHeader fue quitado para lograr la pantalla completa de login */}
      <IonContent fullscreen className="auth-content-container">
        {/* NUEVO CONTENEDOR FLEX: Centrado Absoluto */}
        <div className="full-center-container">
          <div className="auth-form-container">
            {/* Logo */}
            <img src={LOGO_URL} alt="PcUpdate Logo" className="auth-logo" />

            {/* Formulario */}
            <IonCard className="auth-card">
              <IonCardHeader>
                <IonCardTitle>{isRegister ? 'Registrarse' : 'Acceder'}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                  
                  {/* CAMPO CORREO ELECTRÓNICO */}
                  <IonLabel className="input-label-spacing">Correo Electrónico</IonLabel>
                  <IonItem lines="full" className="auth-input-item">
                    <IonIcon icon={mailOutline} slot="start" color="medium" />
                    <IonInput
                      type="email"
                      value={email}
                      onIonChange={(e) => setEmail(e.detail.value!)}
                      placeholder="ejemplo@pcupdate.com"
                    />
                  </IonItem>

                  {/* CAMPO CONTRASEÑA */}
                  <IonLabel className="input-label-spacing">Contraseña</IonLabel>
                  <IonItem lines="full" className="auth-input-item">
                    <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
                    <IonInput
                      type="password"
                      value={password}
                      onIonChange={(e) => setPassword(e.detail.value!)}
                    />
                  </IonItem>

                  {isRegister && (
                    <>
                      {/* CAMPO CONFIRMAR CONTRASEÑA */}
                      <IonLabel className="input-label-spacing">Confirmar Contraseña</IonLabel>
                      <IonItem lines="full" className="auth-input-item">
                        <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
                        <IonInput
                          type="password"
                          value={confirmPassword}
                          onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                        />
                      </IonItem>
                    </>
                  )}
                  <div className="ion-padding-top">
                    <IonButton
                      expand="block"
                      onClick={handleAuthAction}
                      disabled={isRegister ? (password !== confirmPassword) : false}
                      className="primary-button large-button ion-margin-top"
                    >
                      <IonIcon icon={isRegister ? personAddOutline : logInOutline} slot="start" />
                      {isRegister ? 'REGISTRARME' : 'INGRESAR'}
                    </IonButton>
                  </div>
                  <div className="ion-text-center ion-padding-top">
                    <IonButton
                      fill="clear"
                      color="dark"
                      onClick={() => setIsRegister(!isRegister)}
                      className="large-button text-button"
                    >
                      {isRegister ? '¿Ya tienes cuenta? Ingresar' : '¿No tienes cuenta? Registrarme'}
                    </IonButton>
                  </div>
              </IonCardContent>
            </IonCard>
            <IonAlert
              isOpen={!!error}
              onDidDismiss={() => setError(null)}
              header="Error"
              message={error || ''}
              buttons={['OK']}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;