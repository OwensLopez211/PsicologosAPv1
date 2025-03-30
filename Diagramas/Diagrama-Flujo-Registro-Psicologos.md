```mermaid
flowchart TD
    Start([Inicio]) --> A[Psicólogo accede a la plataforma]
    A --> B[Psicólogo completa formulario de registro básico]
    B --> C[Sistema crea cuenta con estado 'Pendiente']
    C --> D[Psicólogo recibe email de confirmación]
    D --> E[Psicólogo confirma email]
    
    E --> F[Psicólogo completa perfil profesional]
    F --> G[Psicólogo sube documentos requeridos]
    G --> H{"¿Todos los documentos requeridos subidos?"}
    H -- No --> G
    H -- Sí --> I[Sistema cambia estado a 'Documentos Pendientes']
    
    I --> J[Administrador recibe notificación]
    J --> K[Administrador revisa documentos]
    K --> L{"¿Documentos válidos?"}
    
    L -- No --> M[Administrador rechaza con comentarios]
    M --> N[Psicólogo recibe notificación de rechazo]
    N --> O[Psicólogo corrige/reenvía documentos]
    O --> K
    
    L -- Sí --> P[Administrador valida documentos]
    P --> Q[Sistema cambia estado a 'Verificando información']
    Q --> R[Administrador verifica datos en fuentes oficiales]
    
    R --> S{"¿Información verificada?"}
    S -- No --> T[Administrador rechaza perfil]
    T --> U[Psicólogo recibe notificación de rechazo final]
    U --> V[Cuenta permanece inactiva]
    V --> End1([Fin])
    
    S -- Sí --> W[Administrador aprueba perfil]
    W --> X[Sistema cambia estado a 'Activo']
    X --> Y[Psicólogo recibe notificación de aprobación]
    Y --> Z[Psicólogo configura horarios disponibles]
    Z --> AA[Psicólogo configura tarifas]
    AA --> AB[Perfil aparece en búsquedas de clientes]
    AB --> End2([Fin])
    ```