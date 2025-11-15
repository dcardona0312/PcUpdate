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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonNote,
  IonFooter, // <-- Nuevo componente: Para el botón de limpiar historial (opcional)
} from '@ionic/react';
// Importamos los íconos necesarios
import { 
    camera, 
    stopCircleOutline, 
    navigate, 
    checkmarkCircleOutline, 
    warningOutline, 
    timeOutline, // <-- Nuevo ícono para el historial
    trashOutline // <-- Nuevo ícono para limpiar el historial
} from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import './Tab2.css'; 

// Definición de tipo para el historial
interface ScanHistoryItem {
    id: number;
    serial: string;
    timestamp: number;
}


// Componente de la Pestaña 2: Vista de Escaneo de la Cámara
const Tab2: React.FC = () => {
  const router = useIonRouter();
  const [scanActive, setScanActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'>('prompt');
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [scannedSerial, setScannedSerial] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<'medium' | 'success' | 'danger'>('medium');
  
  // --- NUEVO ESTADO: Historial de Escaneos ---
  // Inicializamos el historial vacío o cargamos de un almacenamiento local (como localStorage)
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]); 

  // CRÍTICO: Limpiar el entorno al salir de la vista (Mantenemos la lógica de limpieza)
  useIonViewWillEnter(() => {
    if (scanActive) {
      stopScan();
    }
    setMessage('');
    setMessageColor('medium');
    setScannedSerial(null);
  });

  // Función para pedir y verificar permisos de la cámara (SIN CAMBIOS)
  const checkPermission = async () => {
    // ... (lógica de checkPermission se mantiene) ...
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

  // Función para detener el escaneo (SIN CAMBIOS)
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

      if (result.hasContent && result.content) {
        const serial = result.content;

        // 1. Almacenar el dato para mostrarlo y activar el botón
        setScannedSerial(serial);
        setMessage('Serial capturado exitosamente. Presiona CONTINUAR para registrar.');
        setMessageColor('success');

        // 2. --- LÓGICA DE GUARDADO EN EL HISTORIAL (NUEVO) ---
        const newItem: ScanHistoryItem = {
            id: Date.now(),
            serial: serial,
            timestamp: Date.now()
        };
        // Añadir el nuevo serial al inicio de la lista
        setScanHistory(prevHistory => [newItem, ...prevHistory.slice(0, 4)]); // Limita a los últimos 5
        // --------------------------------------------------------

        console.log('Escaneo Exitoso. Serial Capturado y guardado en historial:', serial);

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

  // FUNCIÓN: Manejar la navegación a Tab3 una vez que el dato está listo (SIN CAMBIOS)
  const handleContinue = (serialToRegister: string) => {
    setMessage(`Navegando para registrar el serial: ${serialToRegister.substring(0, 20)}...`);

    // NAVEGACIÓN RETARDADA 
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
  
  // NUEVA FUNCIÓN: Limpiar el historial
  const clearHistory = () => {
      setScanHistory([]);
      setMessage('Historial de escaneos limpiado.');
      setMessageColor('medium');
  };
  
  // Función auxiliar para formatear la hora
  const formatTime = (timestamp: number) => {
      return new Date(timestamp).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
      });
  }


  // --- Renderización del Escáner Activo (SIN CAMBIOS) ---
  if (scanActive) {
    return (
      <IonPage>
        <div className="scanner-container">
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
            style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 1000 }}
          >
            <IonIcon icon={stopCircleOutline} slot="start" />
            DETENER ESCANEO
          </IonButton>
        </div>
      </IonPage>
    );
  }

  // --- Renderización del Menú Principal (Escáner Inactivo) con Historial ---
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Escáner de Seriales</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen> 
        <IonGrid className="ion-padding">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6"> 

              <IonCard className="ion-margin-top ion-padding-bottom">
                <IonCardHeader className="ion-text-center">
                  <IonIcon icon={camera} size="large" color="dark" className="ion-margin-bottom" />
                  <IonCardTitle>
                    Captura Rápida de Seriales
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent className="ion-padding-horizontal">
                  <p className="ion-text-center ion-margin-bottom">
                    Usa la cámara para escanear el serial de una etiqueta de código de barras o QR.
                  </p>

                  {/* 1. SECCIÓN DE ESCANEO POR CÁMARA */}
                  <IonButton
                    expand="full"
                    color="dark"
                    onClick={startScan}
                    disabled={!!scannedSerial}
                    className="ion-margin-top"
                    style={{ height: '55px', fontWeight: 'bold' }}
                  >
                    <IonIcon icon={camera} slot="start" />
                    {scannedSerial ? 'SERIAL CAPTURADO' : 'EMPEZAR ESCANEO'}
                  </IonButton>

                  {/* 2. VISTA DEL DATO ESCANEADO */}
                  {scannedSerial && (
                    <IonList lines="full" className="ion-margin-vertical ion-padding-vertical" style={{ borderRadius: '8px', border: '1px solid var(--ion-color-success)' }}>
                      <IonItem color="success" detail={false}>
                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                        <IonLabel className="ion-text-wrap">
                          <p style={{ fontWeight: 'bold' }}>Dato Capturado Correctamente:</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem color="light" detail={false}>
                        <IonLabel className="ion-text-wrap">
                          <h2 style={{ fontSize: '1.1em', fontWeight: 'normal', wordBreak: 'break-all' }}>
                            {scannedSerial}
                          </h2>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  )}

                  {/* 3. BOTÓN: CONTINUAR */}
                  {scannedSerial && (
                    <IonButton
                      expand="full"
                      color="tertiary" 
                      onClick={() => handleContinue(scannedSerial)}
                      className="ion-margin-top"
                      style={{ height: '55px', fontWeight: 'bold' }}
                    >
                      <IonIcon icon={navigate} slot="start" />
                      CONTINUAR Y REGISTRAR SERIAL
                    </IonButton>
                  )}

                  {/* 4. Mensaje de error/guía */}
                  {message && (
                    <IonNote color={messageColor} className="ion-text-center ion-padding-top ion-padding-bottom ion-margin-top" style={{ display: 'block' }}>
                      <p style={{ margin: 0 }}>
                        {messageColor === 'danger' && <IonIcon icon={warningOutline} />}
                        {' '}
                        {message}
                      </p>
                    </IonNote>
                  )}

                </IonCardContent>
              </IonCard>
              
              {/* 5. SECCIÓN DE HISTORIAL DE ESCANEOS (NUEVO) */}
              {scanHistory.length > 0 && (
                  <IonCard className="ion-margin-top">
                      <IonCardHeader>
                          <IonCardTitle className="ion-text-center">
                              <IonIcon icon={timeOutline} slot="start" color="medium" /> Historial Reciente ({scanHistory.length})
                          </IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent className="ion-padding-horizontal">
                          <IonList lines="full">
                              {scanHistory.map(item => (
                                  <IonItem 
                                      key={item.id} 
                                      button 
                                      detail={true}
                                      onClick={() => handleContinue(item.serial)}
                                  >
                                      <IonLabel className="ion-text-wrap">
                                          <p style={{ fontWeight: 'bold' }}>{item.serial}</p>
                                          <IonNote>{formatTime(item.timestamp)} - Toca para registrar</IonNote>
                                      </IonLabel>
                                  </IonItem>
                              ))}
                          </IonList>
                      </IonCardContent>
                      
                      {/* Botón para limpiar historial */}
                      <IonFooter className="ion-padding-horizontal ion-padding-bottom">
                          <IonButton
                              expand="block"
                              fill="clear"
                              color="danger"
                              onClick={clearHistory}
                          >
                              <IonIcon icon={trashOutline} slot="start" />
                              Limpiar Historial
                          </IonButton>
                      </IonFooter>

                  </IonCard>
              )}

            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Alerta para permisos (SIN CAMBIOS) */}
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