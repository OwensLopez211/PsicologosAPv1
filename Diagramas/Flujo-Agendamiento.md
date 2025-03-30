``` mermaid

flowchart TD
    Start([Inicio]) --> A[Cliente accede a la plataforma]
    A --> B[Cliente busca psicólogo]
    B --> C[Cliente filtra por especialidad/disponibilidad/precio]
    
    C --> D[Cliente selecciona psicólogo]
    D --> E[Cliente visualiza perfil del psicólogo]
    E --> F[Cliente consulta disponibilidad]
    
    F --> G{"¿Hay horarios disponibles?"}
    G -- No --> H[Cliente regresa a búsqueda]
    H --> C
    
    G -- Sí --> I[Cliente selecciona fecha y hora]
    I --> J[Sistema reserva temporalmente el horario]
    J --> K[Cliente confirma intención de agendar]
    
    K --> L[Sistema genera orden de pago]
    L --> M[Cliente visualiza instrucciones de pago]
    M --> N[Cliente realiza transferencia]
    
    N --> O[Cliente sube comprobante de pago]
    O --> P[Cliente confirma pago en plataforma]
    P --> Q[Sistema notifica al administrador]
    
    Q --> R[Administrador revisa comprobante]
    R --> S{"¿Pago válido?"}
    
    S -- No --> T[Administrador rechaza comprobante]
    T --> U[Cliente recibe notificación de rechazo]
    U --> V[Cliente puede subir nuevo comprobante]
    V --> O
    
    S -- Sí --> W[Administrador confirma pago]
    W --> X[Sistema confirma cita en la plataforma]
    X --> Y[Sistema agenda reunión en Google Calendar]
    Y --> Z[Sistema genera link de Google Meet]
    
    Z --> AA[Sistema envía confirmación por email a cliente y psicólogo]
    AA --> AB[Sistema bloquea horario en agenda del psicólogo]
    AB --> AC[Cliente recibe recordatorio 24h antes]
    AC --> AD[Psicólogo recibe recordatorio 24h antes]
    
    AD --> End([Fin])
    
    %% Eventos alternativos
    K -- Cancela --> H
    M -- Cancela --> H
    
    %% Crear un subproceso para cancelación simplificado
    subgraph Cancelación
        CA[Cliente solicita cancelación]
        CB[Sistema registra cancelación]
        CC[Sistema libera horario]
        CD[Cliente y psicólogo reciben notificación]
        CE[No se realiza reembolso]
        
        CA --> CB
        CB --> CE
        CB --> CC
        CC --> CD
    end
    
    %% Conectar el subproceso
    AB -.-> CA
    
 ```