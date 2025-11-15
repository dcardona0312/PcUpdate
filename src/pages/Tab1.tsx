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
  IonList,
  IonNote,
  IonGrid,
  IonRow,
  IonCol,
  // --- Importaciones del Modal ---
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonTextarea 
} from '@ionic/react';
import { 
    mailOutline, 
    lockClosedOutline, 
    logInOutline, 
    personAddOutline, 
    alertCircleOutline, 
    personCircleOutline,
    cameraOutline,     
    logOutOutline,     
    callOutline,       
    ribbonOutline,     
    createOutline,     
    saveOutline,        // Ícono para Guardar
    closeOutline        // Ícono para Cerrar Modal
} from 'ionicons/icons';
import { useAuth } from '../AuthContext';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Importa los estilos visuales desde el archivo CSS
import './Tab1.css';

// Asegúrate que esta ruta a la imagen es correcta después de copiarla a la carpeta 'public/'
const LOGO_URL = "/PCUPDATE.jpg";

// Definición de tipos para los datos del perfil
interface ProfileData {
    photoUrl: string;
    rank: string;
    phoneNumber: string;
}

const Tab1: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESTADO para controlar el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);

  // ESTADO para los datos simulados del perfil (¡CONECTAR A FIRESTORE!)
  const [profileData, setProfileData] = useState<ProfileData>({
    photoUrl: 'https://ionicframework.com/docs/img/demos/avatar.svg', // URL de ejemplo
    rank: 'Cliente Estándar',
    phoneNumber: '+57 300 123 4567',
  });
  
  // ESTADO temporal para manejar los cambios en el modal
  const [tempProfileData, setTempProfileData] = useState<ProfileData>(profileData);

  // --- Lógica de Autenticación ---

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
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      let errorMessage = 'Ocurrió un error desconocido.';
      if (e.code) {
        switch (e.code) {
          case 'auth/email-already-in-use': errorMessage = 'Este correo ya está registrado.'; break;
          case 'auth/invalid-email': errorMessage = 'El formato del correo electrónico es inválido.'; break;
          case 'auth/weak-password': errorMessage = 'La contraseña debe tener al menos 6 caracteres.'; break;
          case 'auth/user-not-found':
          case 'auth/wrong-password': errorMessage = 'Credenciales incorrectas.'; break;
          default: errorMessage = `Error de autenticación: ${e.message}`;
        }
      }
      setError(errorMessage);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await auth.signOut();
    } catch (e) {
      setError('No se pudo cerrar la sesión.');
    }
  };

  // --- Lógica de Edición del Perfil ---

  const handleEditProfile = () => {
    // Carga los datos actuales al estado temporal antes de abrir
    setTempProfileData(profileData);
    setShowEditModal(true);
  };
  
  const handleCancelEdit = () => {
    // Descartamos los cambios y cerramos
    setShowEditModal(false);
  };

  const handleSaveProfile = () => {
    // ----------------------------------------------------------------------------------
    // ¡IMPORTANTE! Aquí debes implementar la lógica para actualizar Firebase Firestore.
    // ----------------------------------------------------------------------------------
    
    // Simulación de guardado exitoso:
    console.log("Datos para guardar en Firestore:", tempProfileData);
    setProfileData(tempProfileData); // Actualiza el estado principal
    setShowEditModal(false);
    // Puedes añadir un toast o notificación de éxito aquí.
  };

  const handleChangePhoto = () => {
      alert('Implementar lógica para subir foto a Firebase Storage y actualizar photoUrl en el perfil.');
  };


  // --- INICIO: VISTA DE PERFIL (LOGUEADO) ---
  if (isAuthenticated && user) {
    return (
      <IonPage>
        <IonContent fullscreen className="auth-content-container"> 
          <div className="full-center-container profile-view-container">
            <IonCard className="auth-card profile-card">
              <IonCardContent className="ion-text-center">
                
                {/* 1. SECCIÓN DE FOTO DE PERFIL */}
                <div className="profile-photo-container">
                    <img 
                        src={profileData.photoUrl} 
                        alt="Foto de Perfil" 
                        className="profile-photo"
                    />
                    <IonButton 
                        size="small" 
                        fill="solid" 
                        className="change-photo-button"
                        onClick={handleChangePhoto}
                    >
                        <IonIcon icon={cameraOutline} slot="icon-only" />
                    </IonButton>
                </div>

                {/* Título de Bienvenida */}
                <IonCardTitle className="ion-margin-vertical">
                  {user.email ? user.email.split('@')[0].toUpperCase() : 'USUARIO'}
                </IonCardTitle>

                {/* 2. LISTA DE INFORMACIÓN (RANGO, CORREO, TELÉFONO) */}
                <IonList lines="full" className="ion-margin-top profile-list">
                    
                    {/* Detalle del Rango/Nivel */}
                    <IonItem>
                        <IonIcon icon={ribbonOutline} slot="start" color="primary" />
                        <IonLabel>
                            <h3>Rango</h3>
                            <p>{profileData.rank}</p>
                        </IonLabel>
                    </IonItem>

                    {/* Detalle del Correo Electrónico */}
                    <IonItem>
                        <IonIcon icon={mailOutline} slot="start" color="medium" />
                        <IonLabel>
                            <h3>Correo Electrónico</h3>
                            <p>{user.email || 'N/A'}</p>
                        </IonLabel>
                    </IonItem>
                    
                    {/* Detalle del Número de Teléfono */}
                    <IonItem>
                        <IonIcon icon={callOutline} slot="start" color="medium" />
                        <IonLabel>
                            <h3>Teléfono</h3>
                            <p>{profileData.phoneNumber}</p>
                        </IonLabel>
                    </IonItem>

                    {/* Detalle del UID (Identificador único de Firebase) */}
                    <IonItem>
                        <IonIcon icon={alertCircleOutline} slot="start" color="medium" />
                        <IonLabel>
                            <h3>UID</h3>
                            <IonNote className="ion-text-wrap uid-text">{user.uid}</IonNote>
                        </IonLabel>
                    </IonItem>
                </IonList>

                {/* 3. BOTONES DE ACCIÓN */}
                <IonGrid className="ion-margin-top">
                    <IonRow>
                        {/* Botón de Editar Perfil */}
                        <IonCol size="6">
                            <IonButton 
                                expand="block" 
                                fill="outline"
                                color="primary"
                                onClick={handleEditProfile} // Abre el Modal
                            >
                                <IonIcon icon={createOutline} slot="start" />
                                Editar
                            </IonButton>
                        </IonCol>
                        
                        {/* Botón de Cerrar Sesión */}
                        <IonCol size="6">
                            <IonButton 
                                expand="block" 
                                color="danger" 
                                onClick={handleLogout}
                            >
                                <IonIcon icon={logOutOutline} slot="start" />
                                Salir
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

              </IonCardContent>
            </IonCard>
          </div>
          
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError(null)}
            header="Error"
            message={error || ''}
            buttons={['OK']}
          />
        </IonContent>

        {/* ---------------------------------------------------- */}
        {/* COMPONENTE MODAL DE EDICIÓN DE PERFIL */}
        {/* ---------------------------------------------------- */}
        <IonModal 
            isOpen={showEditModal} 
            onDidDismiss={handleCancelEdit} 
            swipeToClose={true}
            initialBreakpoint={0.9} 
            breakpoints={[0, 0.9]}
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Editar Perfil</IonTitle>
                    <IonButton slot="end" onClick={handleCancelEdit} fill="clear">
                        <IonIcon icon={closeOutline} slot="icon-only" />
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList lines="full">
                    
                    {/* CAMPO RANGO */}
                    <IonItem>
                        <IonIcon icon={ribbonOutline} slot="start" color="primary" />
                        <IonLabel position="floating">Rango</IonLabel>
                        <IonInput 
                            value={tempProfileData.rank}
                            onIonChange={e => setTempProfileData({...tempProfileData, rank: e.detail.value!})}
                            placeholder="Administrador, Cliente, etc."
                        />
                    </IonItem>

                    {/* CAMPO TELÉFONO */}
                    <IonItem>
                        <IonIcon icon={callOutline} slot="start" color="medium" />
                        <IonLabel position="floating">Número de Teléfono</IonLabel>
                        <IonInput 
                            type="tel"
                            value={tempProfileData.phoneNumber}
                            onIonChange={e => setTempProfileData({...tempProfileData, phoneNumber: e.detail.value!})}
                            placeholder="+57 300 123 4567"
                        />
                    </IonItem>
                    
                    {/* CAMPO DE FOTO (Nota) */}
                    <IonItem className="ion-margin-top" detail={false}>
                        <IonIcon icon={cameraOutline} slot="start" color="medium" />
                        <IonLabel className="ion-text-wrap">
                            <h2>Foto de Perfil</h2>
                            <p>Usa el botón en la vista principal para cambiar la foto (requiere Firebase Storage).</p>
                        </IonLabel>
                    </IonItem>

                </IonList>

                {/* BOTÓN DE GUARDAR */}
                <IonButton 
                    expand="block" 
                    color="success" 
                    className="ion-margin-top"
                    onClick={handleSaveProfile}
                >
                    <IonIcon icon={saveOutline} slot="start" />
                    Guardar Cambios
                </IonButton>
                
            </IonContent>
        </IonModal>
        
      </IonPage>
    );
  }
  // --- FIN: VISTA DE PERFIL (LOGUEADO) ---


  // --- INICIO: VISTA DE LOGIN/REGISTRO (NO LOGUEADO) ---
  return (
    <IonPage>
      <IonContent fullscreen className="auth-content-container">
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
  // --- FIN: VISTA DE LOGIN/REGISTRO (NO LOGUEADO) ---
};

export default Tab1;