``` mermaid
flowchart TD
    Start([Inicio]) --> A[Sistema inicia proceso de liquidación]
    A --> B[Sistema identifica fin de mes]
    B --> C[Sistema recopila todas las citas completadas del mes]
    
    C --> D[Sistema calcula montos totales por psicólogo]
    D --> E[Sistema calcula comisión de la plataforma]
    E --> F[Sistema genera liquidación preliminar]
    
    F --> G[Administrador revisa liquidaciones]
    G --> H{"¿Liquidaciones correctas?"}
    
    H -- No --> I[Administrador ajusta liquidaciones]
    I --> G
    
    H -- Sí --> J[Administrador aprueba liquidaciones]
    J --> K[Sistema cambia estado a 'Pendiente de Pago']
    K --> L[Sistema genera informe detallado por psicólogo]
    
    L --> M[Sistema envía liquidación a cada psicólogo]
    M --> N[Psicólogo revisa liquidación]
    N --> O{"¿Psicólogo conforme?"}
    
    O -- No --> P[Psicólogo reporta discrepancia]
    P --> Q[Administrador revisa reclamo]
    Q --> R{"¿Reclamo válido?"}
    
    R -- Sí --> S[Administrador ajusta liquidación]
    S --> L
    
    R -- No --> T[Administrador mantiene liquidación original]
    T --> U[Administrador notifica al psicólogo]
    U --> V[Psicólogo recibe notificación]
    
    O -- Sí --> W[Psicólogo confirma conformidad]
    V --> W
    
    W --> X[Administrador realiza transferencia bancaria]
    X --> Y[Administrador registra pago en sistema]
    Y --> Z[Sistema cambia estado a 'Pagado']
    
    Z --> AA[Sistema envía comprobante de pago al psicólogo]
    AA --> AB[Sistema archiva liquidación en historial]
    AB --> End([Fin])
    
    %% Recordatorios y plazos
    subgraph Plazos
        PA[1er día del mes: Inicio de proceso]
        PB[1-3 días: Revisión administrativa]
        PC[3-5 días: Revisión por psicólogos]
        PD[Hasta día 5: Pago a psicólogos]
    end
    
    ```