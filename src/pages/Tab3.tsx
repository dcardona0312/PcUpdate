import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  useIonToast,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonNote,
  IonChip,
} from '@ionic/react';
import { 
  addCircleOutline, 
  trashOutline, 
  saveOutline, 
  pricetagsOutline, 
  listOutline, 
  personOutline, 
  calendarOutline, 
  laptopOutline
} from 'ionicons/icons';
import { useAuth } from '../AuthContext';
import { db } from '../firebase.ts'; // Importamos la instancia de Firestore
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

// Definición de tipos para los datos del equipo
interface Equipo {
  id: string;
  serial: string;
  nombre: string; // Nuevo campo: Nombre
  infoAdicional: string;
  fechaCreacion: any; // Usaremos 'any' para Firestore Timestamp
  userId: string;
}

const Tab3: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth(); 
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [serial, setSerial] = useState('');
  const [nombre, setNombre] = useState(''); // Nuevo estado
  const [infoAdicional, setInfoAdicional] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true); 
  const [presentToast] = useIonToast();

  const userId = user?.uid;

  // Ruta de la colección: /artifacts/{appId}/users/{userId}/equipos
  const getEquiposCollectionPath = (uid: string) => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    return `artifacts/${appId}/users/${uid}/equipos`;
  };

  // ----------------------------------------------------
  // Lógica de Lectura y Sincronización (Firestore)
  // ----------------------------------------------------
  useEffect(() => {
    if (isLoading) {
      return; 
    }

    if (!isAuthenticated || !userId) {
      setEquipos([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    const equiposCollectionRef = collection(db, getEquiposCollectionPath(userId));
    const q = query(equiposCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEquipos: Equipo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Equipo));
      setEquipos(fetchedEquipos);
      setIsDataLoading(false);
      console.log(`[Tab3] Datos sincronizados: ${fetchedEquipos.length} equipos.`);
    }, (error) => {
      console.error("Error al escuchar los equipos:", error);
      setIsDataLoading(false);
      presentToast({
        message: 'Error al cargar los datos. Verifique la conexión a Firebase.',
        duration: 3000,
        color: 'danger',
      });
    });

    return () => unsubscribe();
    
  }, [isAuthenticated, userId, isLoading]);

  // ----------------------------------------------------
  // Lógica de Guardar Nuevo Equipo (Serial/Info)
  // ----------------------------------------------------
  const handleSave = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      presentToast({ message: 'Debe iniciar sesión para guardar datos.', duration: 2000, color: 'danger' });
      return;
    }
    if (!serial.trim() || !nombre.trim()) { // Validar ambos campos
      presentToast({ message: 'El Serial y el Nombre son obligatorios.', duration: 2000, color: 'warning' });
      return;
    }

    try {
      const equiposCollectionRef = collection(db, getEquiposCollectionPath(userId));
      
      await addDoc(equiposCollectionRef, {
        serial: serial.trim(),
        nombre: nombre.trim(), // Guardar el nuevo campo
        infoAdicional: infoAdicional.trim(),
        userId: userId,
        fechaCreacion: serverTimestamp(),
      });

      presentToast({ message: '¡Equipo guardado con éxito!', duration: 1500, color: 'success' });
      // Limpiar el formulario
      setSerial('');
      setNombre('');
      setInfoAdicional('');
    } catch (e) {
      console.error("Error adding document: ", e);
      presentToast({ message: 'Error al guardar el equipo.', duration: 3000, color: 'danger' });
    }
  }, [isAuthenticated, userId, serial, nombre, infoAdicional]); // Agregar nombre a dependencias

  // ----------------------------------------------------
  // Lógica de Eliminación
  // ----------------------------------------------------
  const handleDelete = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const docRef = doc(db, getEquiposCollectionPath(userId), id);
      await deleteDoc(docRef);
      presentToast({ message: 'Equipo eliminado.', duration: 1000, color: 'medium' });
    } catch (e) {
      console.error("Error deleting document: ", e);
      presentToast({ message: 'Error al eliminar el equipo.', duration: 3000, color: 'danger' });
    }
  }, [userId]);


  // --- Vista de Carga ---
  if (isLoading || isDataLoading) {
    return (
      <IonPage>
        <IonHeader><IonToolbar color="dark"><IonTitle>Registro de Equipos</IonTitle></IonToolbar></IonHeader>
        <IonContent fullscreen className="ion-padding ion-text-center ion-flex ion-justify-content-center ion-align-items-center">
          <div className="ion-text-center">
            <IonSpinner name="dots" color="dark"></IonSpinner>
            <IonLabel className="ion-padding-top">Cargando historial...</IonLabel>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // --- Vista No Autenticado ---
  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader><IonToolbar color="dark"><IonTitle>Historial</IonTitle></IonToolbar></IonHeader>
        <IonContent fullscreen className="ion-padding ion-text-center ion-justify-content-center ion-align-items-center ion-flex">
            <p>Inicia sesión para ver tu historial de equipos.</p>
        </IonContent>
      </IonPage>
    );
  }

  // --- Vista Principal (Formulario y Lista) ---
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Registro de Equipos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        
        {/* 1. Formulario de Ingreso */}
        <IonCard className="ion-margin-bottom ion-padding" color="light" style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }}>
          <IonCardHeader className="ion-no-padding">
            <IonCardTitle className="ion-text-start ion-padding-bottom">
              <IonIcon icon={addCircleOutline} slot="start" color="primary" className="ion-margin-end" />
              <span style={{color: '#333'}}>Nuevo Registro Manual</span>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="ion-padding-vertical">
            <IonGrid className="ion-no-padding">
              
              <IonRow>
                <IonCol size="12">
                  <IonItem fill="outline" className="ion-margin-bottom" color="white" lines="none">
                    <IonIcon icon={personOutline} slot="start" color="medium" />
                    <IonLabel position="floating">NOMBRE</IonLabel>
                    <IonInput 
                      value={nombre} 
                      onIonChange={(e) => setNombre(e.detail.value!)} 
                      placeholder="Ej: DIEGO CARDONA"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
              
              {/* Campo Serial */}
              <IonRow>
                <IonCol size="12">
                  <IonItem fill="outline" className="ion-margin-bottom" color="white" lines="none">
                    <IonIcon icon={pricetagsOutline} slot="start" color="medium" />
                    <IonLabel position="floating">SERIAL</IonLabel>
                    <IonInput 
                      value={serial} 
                      onIonChange={(e) => setSerial(e.detail.value!)} 
                      placeholder="Ej: ABC123456789"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol size="12">
                  <IonItem fill="outline" className="ion-margin-bottom" color="white" lines="none">
                    <IonIcon icon={laptopOutline} slot="start" color="medium" />
                    <IonLabel position="floating"> MODELO </IonLabel>
                    <IonTextarea 
                      value={infoAdicional} 
                      onIonChange={(e) => setInfoAdicional(e.detail.value!)}
                      rows={3}
                      placeholder="Ej: Dell Optiplex"
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
              
              {/* Botón Guardar */}
              <IonRow>
                <IonCol size="12">
                  <IonButton 
                    expand="block" 
                    color="primary" 
                    onClick={handleSave}
                    style={{ '--border-radius': '10px', height: '45px' }}
                  >
                    <IonIcon icon={saveOutline} slot="start" />
                    GUARDAR REGISTRO
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* 2. Listado de Equipos Guardados */}
        <IonCard className="ion-margin-top ion-padding" color="white" style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <IonCardHeader className="ion-no-padding">
            <IonCardTitle className="ion-text-start ion-padding-bottom" style={{ borderBottom: '1px solid #ddd' }}>
              <IonIcon icon={listOutline} slot="start" color="dark" className="ion-margin-end" />
              <span style={{color: '#333'}}>Historial de Equipos ({equipos.length})</span>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="ion-no-padding">
            {equipos.length === 0 ? (
              <p className="ion-text-center ion-padding-vertical ion-text-medium" style={{ color: '#999' }}>
                No hay registros aún.
              </p>
            ) : (
              <IonList lines="full" className="ion-no-padding ion-margin-top">
                {[...equipos].reverse().map((equipo) => ( 
                  <IonItem key={equipo.id} detail={false} className="ion-padding-vertical" style={{ '--inner-padding-end': '0', '--padding-start': '0' }}>
                    <IonLabel class="ion-text-wrap">
                      <h2 style={{ fontWeight: '600', color: '#1f2937' }}>
                        <IonIcon icon={personOutline} color="primary" className="ion-margin-end" />
                        {equipo.nombre}
                      </h2>
                      <IonChip color="dark" outline={true} className="ion-margin-top ion-margin-bottom" style={{ fontWeight: 'bold' }}>
                          <IonIcon icon={pricetagsOutline} />
                          <IonLabel>{equipo.serial}</IonLabel>
                      </IonChip>
                      <IonNote className="ion-text-wrap" style={{ display: 'block', paddingBottom: '5px' }}>
                        Notas: {equipo.infoAdicional || 'Sin notas adicionales'}
                      </IonNote>
                      <IonNote color="medium" className="ion-text-small" style={{ display: 'flex', alignItems: 'center' }}>
                        <IonIcon icon={calendarOutline} slot="start" className="ion-margin-end" />
                        Guardado: {equipo.fechaCreacion?.toDate()?.toLocaleString()}
                      </IonNote>
                    </IonLabel>
                    <IonButton 
                      slot="end" 
                      color="danger" 
                      onClick={() => handleDelete(equipo.id)}
                      style={{ '--border-radius': '8px' }}
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
        
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
