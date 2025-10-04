import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText } from '@ionic/react';
import { useAuth } from '../AuthContext';

const Tab2: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Tareas (Firestore)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonTitle size="large">Tareas</IonTitle>
        </IonHeader>

        {!isAuthenticated ? (
          <div className="ion-text-center ion-padding-top">
            <IonText color="danger">
              <h2>Acceso Restringido</h2>
              <p>Por favor, ve a la pestaña **Auth** e inicia sesión para gestionar tus tareas.</p>
            </IonText>
          </div>
        ) : (
          <div className="ion-text-center ion-padding-top">
            <IonText color="dark">
              <h2>¡Bienvenido!</h2>
              <p>Aquí se implementará la lista de tareas con Firestore.</p>
          </IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
