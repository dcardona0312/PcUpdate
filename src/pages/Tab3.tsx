import React, { useState, useCallback } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonText, 
  IonLoading, 
  IonItem, 
  IonLabel,
  IonList,
} from '@ionic/react';
import { useAuth } from '../AuthContext';
// CORRECCIÓN: Se añade la extensión .js para que Vite encuentre el archivo
import { storage } from '../firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Tab3: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!user) {
    // Esto es un fallback, ya que el router debería proteger esta página
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonTitle>Archivos (Storage)</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding">
          <IonText color="danger">
            <p>Acceso Restringido. Inicia sesión para ver tus archivos.</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadMessage(null);
      setDownloadUrl(null);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadMessage(null);
    setDownloadUrl(null);
    
    // Ruta en Firebase Storage: /users/<userId>/<nombre_del_archivo>
    const storageRef = ref(storage, `users/${user.uid}/${file.name}`);

    try {
      // 1. Subir el archivo
      const snapshot = await uploadBytes(storageRef, file);
      
      // 2. Obtener el URL de descarga
      const url = await getDownloadURL(snapshot.ref);

      setDownloadUrl(url);
      setUploadMessage(`¡Archivo subido con éxito! Guardado como: ${file.name}`);
      setFile(null); // Limpiar la selección de archivo

    } catch (error) {
      console.error("Error al subir archivo:", error);
      setUploadMessage(`Error al subir el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  }, [file, user]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Subida de Archivos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonTitle size="large">Archivos</IonTitle>
        </IonHeader>

        <IonLoading isOpen={uploading} message="Subiendo archivo..." spinner="dots" />

        <IonList inset className="ion-margin-top">
          <IonItem lines="full">
            <IonLabel position="stacked">Seleccionar Archivo</IonLabel>
            <input 
              type="file" 
              onChange={handleFileChange} 
              style={{ padding: '10px 0', width: '100%' }}
            />
          </IonItem>
          
          {file && (
            <IonItem lines="none">
              <IonLabel className="ion-text-wrap" color="medium">
                Archivo seleccionado: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
              </IonLabel>
            </IonItem>
          )}

          <IonButton 
            expand="full" 
            color="success" 
            onClick={handleUpload} 
            disabled={!file || uploading} 
            className="ion-margin-top"
          >
            {uploading ? 'Subiendo...' : 'Subir a Firebase Storage'}
          </IonButton>
        </IonList>

        {uploadMessage && (
          <IonText color={uploadMessage.includes('Error') ? "danger" : "success"} className="ion-padding ion-text-center">
            <p className="ion-padding-top">{uploadMessage}</p>
          </IonText>
        )}

        {downloadUrl && (
          <IonList inset>
            <IonItem button href={downloadUrl} target="_blank" detail lines="none">
              <IonLabel color="primary" className="ion-text-wrap">
                <h2>Ver Archivo Subido</h2>
                <p>Click aquí para abrir el URL de descarga.</p>
              </IonLabel>
            </IonItem>
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;