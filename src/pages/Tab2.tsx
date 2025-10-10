import React, { useState, useRef, useEffect } from 'react'; 
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  useIonToast,
  IonButtons,
} from '@ionic/react';
import { listOutline, cameraOutline, logOutOutline, lockClosed, closeOutline } from 'ionicons/icons'; 

// Importamos el archivo de estilos
import './Tab2.css'; 
import { useAuth } from '../AuthContext';

const APP_NAME = "PcUpdate";
// URL de tu logo
const LOGO_URL = "/PCUPDATE.jpg"; 

const Tab2: React.FC = () => {
  // Asegúrate de que useAuth incluya handleLogout (asumimos que lo tiene por Tab1)
  const { isAuthenticated, user, handleLogout } = useAuth();
  const [presentToast] = useIonToast();
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Efecto para gestionar el acceso a la cámara
  useEffect(() => {
    // Función para iniciar la cámara
    const startCamera = async () => {
      if (!isScanning) return; 
      
      try {
        // Detener stream anterior si existe
        stopCamera();

        // Solicitar acceso a la cámara trasera (preferentemente)
        const constraints: MediaStreamConstraints = {
          video: { 
            facingMode: 'environment', // Preferir la cámara trasera (en móviles)
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        streamRef.current = stream; // Guardar la referencia del stream
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        presentToast({
          message: 'Error al acceder a la cámara. Asegúrate de tener permisos.',
          duration: 3000,
          color: 'danger'
        });
        setIsScanning(false); // Regresar al menú si falla
      }
    };

    // Función para detener la cámara
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };

    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    // Limpieza al desmontar o al cambiar el estado
    return () => {
      stopCamera();
    };
  }, [isScanning]); 

  const handleAction = (message: string) => {
    presentToast({
      message: message,
      duration: 1500,
      color: 'dark'
    });
  };
  
  const handleScanClick = () => {
    setIsScanning(true);
  };
  
  const handleStopScan = () => {
    setIsScanning(false);
  };

  // --- Vista de Acceso Restringido ---
  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="light">
            <IonTitle>Tareas</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding ion-text-center">
          <IonGrid className="tab2-content-wrapper"> {/* Usamos la clase de centrado en el Grid */}
            <IonRow className="ion-justify-content-center ion-align-items-center">
              <IonCol size="12" size-md="6" size-lg="4">
                <IonIcon icon={lockClosed} style={{ fontSize: '72px' }} color="medium" />
                <IonText color="dark">
                  <h2 className="ion-padding-top">Acceso Restringido</h2>
                </IonText>
                <p>Por favor, inicia sesión en la pestaña **Auth** para acceder a tus tareas.</p>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }

  // --- Vista de Escáner (Cámara) ---
  if (isScanning) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark"> {/* Toolbar oscura para la vista de escáner */}
            <IonButtons slot="start">
              <IonButton onClick={handleStopScan} color="light">
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>Escáner de Código</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="ion-padding-0 ion-text-center">
          <div className="scanner-container">
            {/* Elemento de video para mostrar el stream de la cámara */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="scanner-video"
            />
            
            {/* Overlay para el área de escaneo (simulación de enfoque) */}
            <div className="scanner-overlay">
                <IonText color="light">
                    <p>Enfoca el código QR</p>
                </IonText>
            </div>
            
            {/* Mensaje de estado (opcional) */}
            {!videoRef.current?.srcObject && (
               <div className="scanner-loading-message">
                   <IonText color="light">
                       <h3>Cargando Cámara...</h3>
                   </IonText>
               </div>
            )}
            
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // --- Vista de Menú Principal (Autenticado) ---
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Tareas / Principal</IonTitle>
        </IonToolbar>
      </IonHeader>
      {/* CRÍTICO: Aplicamos clases de flexbox directamente al IonContent 
        para forzar el centrado vertical y horizontal 
      */}
      <IonContent fullscreen className="ion-padding ion-text-center ion-justify-content-center ion-align-items-center ion-flex">
        {/* Usamos el Grid solo para limitar el ancho en pantallas grandes */}
        <IonGrid style={{ width: '100%', maxWidth: '400px' }}>
          <IonRow className="ion-align-items-center ion-justify-content-center">
            <IonCol size="12">
              <IonCard className="ion-no-margin tab2-menu-card">
                <IonCardContent className="ion-text-center">
                  
                  {/* Logo/Nombre */}
                  <div className="ion-text-center ion-padding-bottom">
                     <img src={LOGO_URL} alt="Logo PcUpdate" style={{ maxWidth: '150px', margin: '10px 0', filter: 'grayscale(100%)' }} /> 
                  </div>

                  {/* 1. VER LISTADO */}
                  <IonButton 
                    expand="block" 
                    color="dark" 
                    className="ion-text-wrap tab2-main-button"
                    onClick={() => handleAction("Navegando a la Lista de Tareas (Próximamente con Firestore)")}
                  >
                    <IonIcon slot="start" icon={listOutline} />
                    VER LISTADO
                  </IonButton>

                  {/* 2. ESCANEAR */}
                  <IonButton 
                    expand="block" 
                    color="dark" 
                    className="ion-text-wrap tab2-main-button"
                    onClick={handleScanClick} 
                  >
                    <IonIcon slot="start" icon={cameraOutline} />
                    ESCANEAR
                  </IonButton>

                  {/* 3. SALIR (Cerrar Sesión) */}
                  <IonButton 
                    expand="block" 
                    color="dark" // Usamos dark para seguir el monocromático
                    className="ion-text-wrap tab2-main-button"
                    onClick={() => handleLogout()} // Asumimos que SALIR es cerrar sesión
                  >
                    <IonIcon slot="start" icon={logOutOutline} />
                    SALIR
                  </IonButton>
                  
                </IonCardContent>
              </IonCard>
              
              <div className="ion-text-center ion-padding-top">
                <IonText color="medium">
                  <p>Sesión iniciada como: {user?.email}</p>
                </IonText>
              </div>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
