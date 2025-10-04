import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
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
import Tab1 from './pages/Tab1'; // Auth/Login/Profile
import Tab2 from './pages/Tab2'; // Tareas (Firestore)
import Tab3 from './pages/Tab3'; // Archivos (Storage)

// Autenticación
import { AuthProvider, useAuth } from './AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

/**
 * Define las rutas de las pestañas que SÍ llevan la barra inferior.
 * Se renderiza SIEMPRE. La redirección protege el contenido.
 */
const TabsRouter: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      {/* Redirección por defecto: /tabs -> /tabs/tab2 (Tareas) */}
      <Route exact path="/tabs" render={() => <Redirect to="/tabs/tab2" />} />

      {/* Rutas internas de las pestañas */}
      <Route exact path="/tabs/tab1" component={Tab1} />
      <Route exact path="/tabs/tab2" component={Tab2} />
      <Route exact path="/tabs/tab3" component={Tab3} />

      {/* Si se intenta acceder a una ruta desconocida dentro de /tabs, redirecciona a Tab2 */}
      <Route render={() => <Redirect to="/tabs/tab2" />} />
    </IonRouterOutlet>

    {/* Barra de Navegación Inferior (Visible solo aquí) */}
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
 * Define la ruta para el Login/Registro, que NO lleva la barra inferior.
 */
const AuthRouter: React.FC = () => (
  <IonRouterOutlet>
    {/* La Pestaña 1 se usa como pantalla de Login/Registro */}
    <Route exact path="/auth" component={Tab1} />
    {/* Cualquier otra ruta no conocida o la raíz, redirige al Login */}
    <Route render={() => <Redirect to="/auth" />} />
  </IonRouterOutlet>
);

/**
 * Componente que maneja la lógica de autenticación y las redirecciones de alto nivel.
 */
const RootRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <IonLoading isOpen={true} message="Cargando autenticación..." spinner="crescent" />
    );
  }

  return (
    <Switch>
      {/* 1. La ruta /tabs siempre existe, la protección se hace con redirección:
          Si está logueado, se queda en /tabs. Si no, lo mandamos a /auth. */}
      <Route path="/tabs" render={() => (
        isAuthenticated ? <TabsRouter /> : <Redirect to="/auth" />
      )} />

      {/* 2. Ruta de Login/Auth: Solo para no autenticados */}
      <Route path="/auth" render={() => (
        isAuthenticated ? <Redirect to="/tabs" /> : <AuthRouter />
      )} />

      {/* 3. Redirección de la raíz / */}
      <Route 
        exact 
        path="/" 
        render={() => (
          isAuthenticated ? <Redirect to="/tabs" /> : <Redirect to="/auth" />
        )} 
      />
      
      {/* 4. Ruta fallback para cualquier cosa que falle */}
      <Route render={() => <Redirect to="/auth" />} />
    </Switch>
  );
};


/**
 * Componente Principal de la Aplicación
 */
const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <RootRouter />
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
