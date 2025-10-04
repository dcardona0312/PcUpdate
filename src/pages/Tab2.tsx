import React, { useState, useEffect } from 'react';
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
  IonFab,
  IonFabButton,
  IonText
} from '@ionic/react';
import { add, trash } from 'ionicons/icons';

// Importa el servicio de base de datos (db) y las funciones de Firestore
// RUTA CORREGIDA: Apuntando a '../firebase'
import { db } from '../firebase'; 
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'; 

interface Tarea {
  id: string;
  texto: string;
  timestamp: any; // Usaremos 'any' para la compatibilidad con el objeto Timestamp de Firestore
}

const TareaListPage: React.FC = () => {
    const [nuevaTarea, setNuevaTarea] = useState('');
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [cargando, setCargando] = useState(true);

    // 1. OBTENER DATOS EN TIEMPO REAL (onSnapshot)
    useEffect(() => {
        // Referencia a la colección 'tareas'
        const tareasRef = collection(db, 'tareas');
        
        // Consulta para ordenar por fecha de creación (timestamp)
        // Nota: Firestore requiere un índice para consultas con orderBy
        const q = query(tareasRef, orderBy('timestamp', 'desc'));
        
        // onSnapshot escucha los cambios en tiempo real
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tareasData: Tarea[] = [];
            snapshot.forEach((doc) => {
                tareasData.push({
                    id: doc.id,
                    texto: doc.data().texto,
                    timestamp: doc.data().timestamp // Guardamos el timestamp para ordenar
                });
            });
            setTareas(tareasData);
            setCargando(false);
        }, (error) => {
            console.error("Error al escuchar Firestore:", error);
            // Reemplazando alert() por un mensaje en consola
            console.log("Error al cargar tareas. Revisa la consola.");
            setCargando(false);
        });

        // La función de limpieza se ejecuta cuando el componente se desmonta
        return () => unsubscribe();
    }, []);

    // 2. AÑADIR NUEVA TAREA (addDoc)
    const handleAddTarea = async () => {
        if (nuevaTarea.trim() === '') return;

        try {
            // Añade un nuevo documento a la colección 'tareas'
            await addDoc(collection(db, 'tareas'), {
                texto: nuevaTarea.trim(),
                timestamp: new Date() // Agrega la fecha actual para ordenar
            });
            setNuevaTarea('');
        } catch (error) {
            console.error("Error al añadir documento:", error);
            // Reemplazando alert() por un mensaje en consola
            console.log("Error al añadir la tarea. Revisa la consola.");
        }
    };

    // 3. ELIMINAR TAREA (deleteDoc)
    const handleDeleteTarea = async (id: string) => {
        try {
            // Referencia al documento específico por su ID
            const tareaDocRef = doc(db, 'tareas', id);
            // Elimina el documento
            await deleteDoc(tareaDocRef);
        } catch (error) {
            console.error("Error al eliminar documento:", error);
            // Reemplazando alert() por un mensaje en consola
            console.log("Error al eliminar la tarea. Revisa la consola.");
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Tareas - Firestore</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                
                <IonItem lines="full" className="ion-padding-top">
                    <IonInput
                        placeholder="Escribe una nueva tarea"
                        value={nuevaTarea}
                        onIonChange={(e) => setNuevaTarea(e.detail.value!)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleAddTarea();
                        }}
                    />
                    <IonButton slot="end" onClick={handleAddTarea}>
                        <IonIcon icon={add} />
                    </IonButton>
                </IonItem>

                {cargando && 
                    <IonItem>
                        <IonLabel>Cargando tareas...</IonLabel>
                    </IonItem>
                }

                {!cargando && tareas.length === 0 &&
                    <div className="ion-text-center ion-padding-top">
                        <IonText color="medium">
                           <p>¡No hay tareas pendientes! Añade una arriba.</p>
                        </IonText>
                    </div>
                }

                <IonList>
                    {tareas.map((tarea) => (
                        <IonItem key={tarea.id} lines="full">
                            <IonLabel className="ion-text-wrap">
                                <h2>{tarea.texto}</h2>
                                <p>ID: {tarea.id.substring(0, 8)}...</p>
                            </IonLabel>
                            <IonButton 
                                slot="end" 
                                color="danger" 
                                fill="clear"
                                onClick={() => handleDeleteTarea(tarea.id)}
                            >
                                <IonIcon icon={trash} />
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default TareaListPage;
