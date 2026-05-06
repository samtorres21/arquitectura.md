const API_URL = 'http://localhost:3000/api';

// Verificar estado de sesión al cargar página
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const authNavArea = document.getElementById('authNavArea');
    
    // Manejar visibilidad de elementos protegidos
    const authRequiredElements = document.querySelectorAll('.auth-required');

    if (authNavArea) {
        if (token && user) {
            authNavArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-primary btn-sm mt-1 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fa-solid fa-user me-1"></i> ${user.name}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><span class="dropdown-item-text text-muted">${user.role.toUpperCase()}</span></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="logout()">Cerrar Sesión</a></li>
                    </ul>
                </div>
            `;
            // Mostrar botones que requieren auth
            authRequiredElements.forEach(el => el.style.display = 'block');
        } else {
            // Check if we are in pages/ nested folder
            const isNested = window.location.pathname.includes('/pages/');
            const loginPath = isNested ? 'login.html' : 'pages/login.html';
            authNavArea.innerHTML = `<a href="${loginPath}" class="btn btn-primary btn-sm mt-1">Iniciar Sesión</a>`;
            
            // Ocultar botones que requieren auth
            authRequiredElements.forEach(el => el.style.display = 'none');
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Helper func para Fetch con Auth
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    let headers = {
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    } else {
        // Fetch automaticaly sets boundary for multipart/form-data
        delete headers['Content-Type'];
    }

    return fetch(url, { ...options, headers });
}
