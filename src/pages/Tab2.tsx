import React, { useState, useRef, useEffect, useCallback } from 'react'; 
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
  IonSpinner,
} from '@ionic/react';
import { listOutline, cameraOutline, logOutOutline, lockClosed, closeOutline, checkmarkCircleOutline } from 'ionicons/icons'; 

// Importamos el archivo de estilos
import './Tab2.css'; 
import { useAuth } from '../AuthContext';

import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app'; 

const APP_NAME = "PcUpdate";
const LOGO_URL = "/PCUPDATE.jpg"; 

// --- INICIALIZACIÓN DE FIREBASE (Para el guardado futuro) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

let firestoreDb: any = null;

try {
    const app = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(app);
} catch (e: any) {
    if (e.code && e.code.includes('already-exists')) {
        firestoreDb = getFirestore();
    } else {
        console.error("Error durante la inicialización de Firebase:", e);
    }
}
const db = firestoreDb;
// ---------------------------------------------------------------


const Tab2: React.FC = () => {
  const { isAuthenticated, user, handleLogout } = useAuth();
  const [presentToast] = useIonToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const userId = user?.uid || 'anonymous';
  
  // Función para detener la cámara (usada en el cleanup y al parar el escaneo)
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  }, []);
  
  // Función que se llama al detectar un código (simulación de éxito)
  const handleScanSuccess = useCallback(async (data: string) => {
      
      // 1. Detener la cámara inmediatamente
      stopCamera();
      
      setIsSaving(true); // Indica que estamos procesando/guardando
      
      try {
          if (user && db) {
              const collectionPath = `artifacts/${appId}/users/${userId}/scanned_items`;
              await addDoc(collection(db, collectionPath), {
                  data: data,
                  scannedAt: serverTimestamp(),
                  userId: userId,
              });
              console.log("Document successfully written.");
              
              presentToast({
                  message: `¡Escaneo exitoso y guardado! Código: ${data.substring(0, 15)}...`,
                  duration: 3000,
                  color: 'success',
                  icon: checkmarkCircleOutline
              });
          } else {
              
              presentToast({
                  message: `¡Escaneo exitoso! Código: ${data.substring(0, 15)}...`,
                  duration: 3000,
                  color: 'success',
                  icon: checkmarkCircleOutline
              });
          }
      } catch (e) {
          console.error("Error adding document: ", e);
          presentToast({ message: 'Escaneo exitoso, pero falló al guardar en la nube.', duration: 4000, color: 'warning' });
      } finally {
          setIsSaving(false);
          setIsScanning(false); 
      }
  }, [user, presentToast, appId, userId, stopCamera, db]);


  // Efecto para gestionar el acceso a la cámara y el escaneo simulado
  useEffect(() => {
    
    // Función para iniciar la cámara (TU CÓDIGO ORIGINAL QUE FUNCIONA)
    const startCamera = async () => {
      if (!isScanning) return; 
      
      // Detener cualquier timeout pendiente al iniciar
      let mockScanTimeout: NodeJS.Timeout | null = null;
      
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
        
        
        return () => {
          if (mockScanTimeout) clearTimeout(mockScanTimeout);
        };
        
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        let errorMessage = 'Error al acceder a la cámara. Asegúrate de tener permisos.';
        if (err instanceof Error && (err.name === 'NotAllowedError' || err.message.includes('permission'))) {
             errorMessage = 'Permiso de cámara denegado. Debes permitir el acceso en la configuración del navegador.';
        }
        
        presentToast({
          message: errorMessage,
          duration: 4000,
          color: 'danger'
        });
        setIsScanning(false); // Regresar al menú si falla
      }
      return () => {}; // Retorna una función de limpieza
    };


    if (isScanning) {
      // Iniciar la cámara y el timeout de escaneo simulado
      const cleanupFn = startCamera();
      // Aseguramos que el cleanup del useEffect lo limpie
      return cleanupFn; 
    } else {
      // Detener la cámara al salir del modo escaneo
      stopCamera();
    }

    
    return () => {
      stopCamera();
    };
  }, [isScanning, stopCamera, presentToast, handleScanSuccess]); 


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
  
  // handleStopScan usa useCallback y stopCamera()
  const handleStopScan = useCallback(() => {
    console.log("handleStopScan llamado: Deteniendo cámara y volviendo al menú."); // LOG PARA DEPURACIÓN
    // Llama a la función de limpieza de cámara y actualiza el estado
    stopCamera();
    setIsScanning(false);
  }, [stopCamera]);

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
          <IonGrid className="tab2-content-wrapper"> 
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

  // --- Vista de Escáner (Cámara ACTIVA) ---
  if (isScanning) {
    const isCameraActive = !!videoRef.current?.srcObject;
    
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark"> 
            <IonButtons slot="start">
              {/* Botón para detener la cámara y volver al menú */}
              <IonButton onClick={handleStopScan} color="light" disabled={isSaving}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>{isSaving ? 'Procesando...' : 'Escáner de Código'}</IonTitle>
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
            
            {/* Overlay para el área de escaneo */}
            <div className="scanner-overlay">
                <IonText color="light">
                    <p>{isSaving ? 'Guardando datos...' : 'La cámara está activa. Pulsa X para salir.'}</p>
                </IonText>
            </div>
            
            {/* Indicador de estado */}
            {(!isCameraActive || isSaving) && (
               <div className="scanner-loading-message">
                   <IonText color="light">
                       {isSaving ? (
                           <>
                               <IonSpinner name="dots" color="light" />
                               <h3>Procesando Escaneo...</h3>
                           </>
                       ) : (
                           <>
                             <IonSpinner name="dots" color="light" />
                             <h3>Cargando Cámara...</h3>
                           </>
                       )}
                   </IonText>
               </div>
            )}
            
            {/* Botón de PRUEBA: Simular un escaneo exitoso manualmente */}
            {!isSaving && isCameraActive && (
                 <div className="ion-padding-vertical" style={{position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100}}>
                    <IonButton 
                        color="success" 
                        onClick={() => handleScanSuccess(`CODIGO_MANUAL_${Date.now()}`)}
                    >
                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                        Simular Escaneo Exitoso
                    </IonButton>
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
      <IonContent fullscreen className="ion-padding ion-text-center ion-justify-content-center ion-align-items-center ion-flex">
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

                  {/* 2. ESCANEAR QR / BARRA */}
                  <IonButton 
                    expand="block" 
                    color="dark" 
                    className="ion-text-wrap tab2-main-button"
                    onClick={handleScanClick} 
                  >
                    <IonIcon slot="start" icon={cameraOutline} />
                    ESCANEAR
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
