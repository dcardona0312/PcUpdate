import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  useIonRouter,
  IonText,
  IonAlert,
  useIonViewWillEnter,
  IonList,  
  IonItem,  
  IonLabel, 
} from '@ionic/react';
// Importamos los íconos necesarios
import { camera, stopCircleOutline, navigate } from 'ionicons/icons'; 
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'; 
import './Tab2.css'; 

// Componente de la Pestaña 2: Vista de Escaneo de la Cámara (Minimalista)
const Tab2: React.FC = () => {
  const router = useIonRouter();
  const [scanActive, setScanActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'>('prompt');
  const [showAlert, setShowAlert] = useState(false); 
  const [message, setMessage] = useState(''); 
  // ESTADO CRÍTICO: Almacena el dato leído para mostrarlo y activar el botón
  const [scannedSerial, setScannedSerial] = useState<string | null>(null); 
  const [messageColor, setMessageColor] = useState<'medium' | 'success' | 'danger'>('medium');

  // CRÍTICO: Limpiar el entorno al salir de la vista
  useIonViewWillEnter(() => {
    // Limpiamos el estado del escáner si está activo
    if (scanActive) {
      stopScan();
    }
    // Reiniciamos los estados clave al volver a la pestaña
    setMessage('');
    setMessageColor('medium');
    setScannedSerial(null); // MUY IMPORTANTE: Limpiar el serial escaneado
  });

  // Función para pedir y verificar permisos de la cámara
  const checkPermission = async () => {
    try {
      let status = await BarcodeScanner.checkPermission({ force: false });
      setCameraPermission(status.camera);
      
      if (status.granted) return true;
      
      if (status.denied || status.prompt || status.promptWithRationale) {
        status = await BarcodeScanner.checkPermission({ force: true });
        setCameraPermission(status.camera);
        return status.granted;
      }
      return false;
      
    } catch (e) {
      console.error("Error al verificar/pedir permisos de cámara:", e);
      setMessage('Error de cámara. Intenta de nuevo.');
      setMessageColor('danger');
      return false;
    }
  };

  // Función para detener el escaneo
  const stopScan = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.body.classList.remove('scanner-active');
    setScanActive(false); 
    console.log('--- Escaneo Detenido y Limpiado ---');
  };


  // Función para iniciar el escaneo de código de barras
  const startScan = async () => {
    // Limpiar estados antes de escanear
    setMessage('');
    setMessageColor('medium');
    setScannedSerial(null);

    const permissionGranted = await checkPermission();

    if (!permissionGranted) {
      if (cameraPermission === 'denied') {
        setShowAlert(true);
      }
      return;
    }

    setScanActive(true);
    document.body.classList.add('scanner-active');
    BarcodeScanner.hideBackground();
    
    let result = null;

    try {
      result = await BarcodeScanner.startScan();
      
      // Detener escaneo y limpiar UI primero
      stopScan(); 
      
      console.log('Resultado Completo del Escaneo:', result);

      if (result.hasContent && result.content) { 
        const serial = result.content;
        
        // 1. Almacenar el dato para mostrarlo y activar el botón
        setScannedSerial(serial); 
        setMessage('Serial capturado exitosamente. Presiona CONTINUAR para registrar.');
        setMessageColor('success');
        
        console.log('Escaneo Exitoso. Serial Capturado:', serial);
        
      } else if (result.hasContent === false) {
        console.log('Escaneo cancelado por el usuario o sin contenido.');
        setMessage('Escaneo cancelado por el usuario. Vuelve a intentarlo.');
        setMessageColor('medium');
      } else {
        console.error('Fallo en la lectura del código de barras. El plugin devolvió un resultado inesperado:', result);
        setMessage('Error al leer el código. Intenta de nuevo.');
        setMessageColor('danger');
      }
      
    } catch (e) {
      console.error('Error durante el escaneo:', e);
      setMessage('Ocurrió un error inesperado durante el escaneo.');
      setMessageColor('danger');
      stopScan();
    }
  };
  
  // FUNCIÓN: Manejar la navegación a Tab3 una vez que el dato está listo
  const handleContinue = (serialToRegister: string) => {
    setMessage(`Navegando para registrar el serial: ${serialToRegister.substring(0, 20)}...`);
    
    // NAVEGACIÓN RETARDADA (Mejora la fiabilidad de la navegación)
    setTimeout(() => {
        router.push('/tab3', 'forward', 'push', { 
            state: { 
                scannedSerial: serialToRegister, 
                timestamp: Date.now() 
            } 
        });
        // Limpiamos la data después de iniciar la navegación
        setScannedSerial(null);
        setMessage('');
        setMessageColor('medium');

    }, 150); 
  };


  // --- Renderización del Escáner Activo ---
  if (scanActive) {
    return (
      <IonPage>
        <div className="scanner-container">
          {/* El video de la cámara se renderiza detrás del WebView */}
          <div className="scanner-overlay">
            <IonText color="light" className="scanner-loading-message ion-text-center">
                <h2>Escaneando Código...</h2>
                <p>Apunta la cámara a un código de barras o QR.</p>
            </IonText>
          </div>
          <IonButton 
            expand="block" 
            color="danger" 
            onClick={stopScan} 
            // Posicionamiento en la parte inferior de la pantalla para detener el escaneo
            style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 1000 }}
          >
            <IonIcon icon={stopCircleOutline} slot="start" />
            DETENER ESCANEO
          </IonButton>
        </div>
      </IonPage>
    );
  }

  // --- Renderización del Menú Principal (Escáner Inactivo) ---
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Escáner de Seriales</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          height: '100%', 
          paddingTop: '60px', 
          textAlign: 'center' 
        }}>
          
          <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
              
            {/* 1. SECCIÓN DE ESCANEO POR CÁMARA */}
            <h2 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '10px' }}>
              Captura Rápida de Seriales
            </h2>

            <p style={{ color: '#555', marginBottom: '20px' }}>
              Usa la cámara para escanear el serial de una etiqueta de código de barras o QR.
            </p>

            <IonButton 
              expand="full" 
              color="dark" 
              onClick={startScan} 
              // Deshabilitar si ya se escaneó un serial y estamos esperando la confirmación
              disabled={!!scannedSerial} 
              style={{ height: '55px', fontWeight: 'bold', marginBottom: '20px' }}
            >
              <IonIcon icon={camera} slot="start" />
              {scannedSerial ? 'SERIAL CAPTURADO' : 'EMPEZAR ESCANEO'}
            </IonButton>
            
            {/* VISTA DEL DATO ESCANEADO */}
            {scannedSerial && (
              <div 
                style={{ 
                  marginTop: '15px', 
                  marginBottom: '25px',
                  padding: '15px', 
                  backgroundColor: '#e6ffe6', // Fondo verde claro de éxito
                  borderRadius: '8px',
                  border: '1px solid #4CAF50',
                  textAlign: 'left',
                  wordBreak: 'break-all'
                }}
              >
                <IonText color="dark">
                  <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '0.9em' }}>Dato Capturado Correctamente:</p>
                  <p style={{ margin: 0, fontSize: '1.1em' }}>{scannedSerial}</p>
                </IonText>
              </div>
            )}
            
            {/* BOTÓN: CONTINUAR (Activado solo si hay un serial escaneado) */}
            {scannedSerial && (
                <IonButton 
                  expand="full" 
                  color="tertiary" // Color distintivo
                  onClick={() => handleContinue(scannedSerial)} 
                  style={{ height: '55px', fontWeight: 'bold', marginBottom: '40px' }}
                >
                  <IonIcon icon={navigate} slot="start" />
                  CONTINUAR Y REGISTRAR SERIAL
                </IonButton>
            )}
            
          </div>
          
          {/* Mensaje de error/guía */}
          {message && (
            <IonText color={messageColor} className="ion-text-center ion-padding-top">
                <p>{message}</p>
            </IonText>
          )}

        </div>

        {/* Alerta para guiar al usuario cuando el permiso es denegado permanentemente */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Permiso Requerido'}
          message={'Para usar el escáner de cámara, debes otorgar el permiso. Ve a la configuración de tu dispositivo y habilita el acceso a la cámara para esta aplicación.'}
          buttons={[
            {
              text: 'Entendido',
              role: 'cancel',
              cssClass: 'primary',
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;