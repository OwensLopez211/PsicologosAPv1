``` mermaid
flowchart TD
    Start([Inicio]) --> A[Cliente selecciona horario]
    A --> B[Sistema bloquea temporalmente el horario]
    B --> C[Sistema genera orden de pago]
    C --> D[Sistema muestra datos de transferencia]
    
    D --> E[Cliente realiza transferencia bancaria]
    E --> F[Cliente accede a sección 'Mis Citas Pendientes']
    F --> G[Cliente selecciona cita para confirmar pago]
    
    G --> H[Cliente sube comprobante de transferencia]
    H --> I[Cliente completa información de pago]
    I --> J[Cliente confirma pago]
    
    J --> K[Sistema cambia estado a 'Pago Confirmado por Cliente']
    K --> L[Sistema notifica al administrador]
    L --> M[Administrador recibe notificación]
    
    M --> N[Administrador verifica comprobante de pago]
    N --> O[Administrador verifica estado de cuenta]
    O --> P{"¿Pago correcto?"}
    
    P -- No --> Q[Administrador rechaza pago]
    Q --> R[Sistema cambia estado a 'Pago Rechazado']
    R --> S[Sistema notifica al cliente]
    S --> T[Cliente recibe notificación de rechazo]
    T --> U{"¿Cliente reintenta?"}
    
    U -- Sí --> V[Cliente proporciona nuevo comprobante]
    V --> H
    
    U -- No --> W[Sistema libera horario]
    W --> X[Sistema cancela reserva]
    X --> End1([Fin - Cancelado])
    
    P -- Sí --> Y[Administrador confirma pago]
    Y --> Z[Sistema cambia estado a 'Pago Validado']
    Z --> AA[Sistema confirma cita definitivamente]
    
    AA --> AB[Sistema crea evento en Google Calendar]
    AB --> AC[Sistema genera link de Google Meet]
    AC --> AD[Sistema envía confirmaciones por email]
    
    AD --> AE[Sistema notifica al psicólogo]
    AE --> AF[Sistema notifica al cliente]
    AF --> End2([Fin - Confirmado])
    
    %% Tiempos límite
    subgraph "Límites de Tiempo"
        TA["Bloqueo temporal: 30 minutos"]
        TB["Validación admin: 12 horas máximo"]
        TC["Reintento cliente: 24 horas máximo"]
    end
    
    ```