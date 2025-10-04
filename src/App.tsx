import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonLoading, 
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { square, triangle, lockClosed } from 'ionicons/icons';

// Importación de las Pestañas
import Tab1 from './pages/Tab1'; // Auth/Login
import Tab2 from './pages/Tab2'; // Tareas (Firestore)
import Tab3 from './pages/Tab3'; // Archivos (Storage)

// Autenticación
import { AuthProvider, useAuth } from './AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
// ... (Otros imports de CSS)

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

/**
 * Componente Wrapper para manejar las rutas protegidas y la navegación por pestañas.
 * Este componente SOLO se renderiza si el usuario está autenticado.
 */
const AuthenticatedTabs: React.FC = () => (
  <IonTabs>
    {/* Contenido de las pestañas */}
    <IonRouterOutlet>
      {/* Route de redirección por defecto: si el usuario va a /tabs, lo mandamos a /tabs/tab2 */}
      <Route exact path="/tabs">
        <Redirect to="/tabs/tab2" />
      </Route>
      {/* La Pestaña 1 (Auth) se convierte en la pantalla de Perfil/Logout cuando está logueado */}
      <Route exact path="/tabs/tab1" component={Tab1} />
      {/* Pestaña de Tareas (Protegida) */}
      <Route exact path="/tabs/tab2" component={Tab2} />
      {/* Pestaña de Archivos (Protegida) */}
      <Route path="/tabs/tab3" component={Tab3} />
    </IonRouterOutlet>

    {/* Barra de Navegación Inferior (IonTabBar) */}
    <IonTabBar slot="bottom">
      <IonTabButton tab="tab1" href="/tabs/tab1">
        <IonIcon icon={lockClosed} />
        <IonLabel>Auth</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab2" href="/tabs/tab2">
        <IonIcon icon={square} />
        <IonLabel>Tareas</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab3" href="/tabs/tab3">
        <IonIcon icon={triangle} />
        <IonLabel>Archivos</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

/**
 * Componente que decide si mostrar Login, Carga o Tabs.
 */
const LoginOrTabs: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Pantalla de carga mientras AuthContext inicializa Firebase */}
        <IonLoading isOpen={isLoading} message="Cargando autenticación..." spinner="crescent" />
        
        {/* La lógica de redirección forzosa se maneja aquí */}
        {isAuthenticated ? (
          <>
            {/* Si está autenticado, siempre puede acceder a las pestañas y redirigir a /tabs */}
            <Route path="/tabs" component={AuthenticatedTabs} />
            <Redirect exact from="/" to="/tabs" />
            <Route render={() => <Redirect to="/tabs" />} />
          </>
        ) : (
          <>
            {/* Si NO está autenticado, solo puede acceder al Login (Tab1) en la raíz */}
            <Route exact path="/" component={Tab1} />
            <Route render={() => <Redirect to="/" />} />
          </>
        )}
      </IonRouterOutlet>
    </IonReactRouter>
  );
};


/**
 * Componente Principal de la Aplicación
 */
const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <LoginOrTabs />
      </AuthProvider>
    </IonApp>
  );
};

export default App;

