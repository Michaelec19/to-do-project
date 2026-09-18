const API_URL = 'https://to-do-agenda.onrender.com/api/auth';
const SESSION_KEY = 'lanhua_session';
const TOKEN_KEY = 'lanhua_token';

const setSession = (user, token) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
};

document.getElementById('btnLoginThemeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('lanhua_theme', isLight ? 'light' : 'dark');
});

if (localStorage.getItem('lanhua_theme') === 'light') {
    document.body.classList.add('light-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    loginTab?.addEventListener('click', () => {
        loginTab.classList.replace('text-muted', 'text-white');
        registerTab.classList.replace('text-white', 'text-muted');
    });

    registerTab?.addEventListener('click', () => {
        registerTab.classList.replace('text-muted', 'text-white');
        loginTab.classList.replace('text-white', 'text-muted');
    });

    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const inputElement = document.getElementById(targetId);
            const icon = this.querySelector('i');
            if (inputElement.type === 'password') {
                inputElement.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                inputElement.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginCorreo').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            const spinner = document.getElementById('loginSpinner');

            spinner.classList.remove('d-none');
            btn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) throw new Error('Credenciales incorrectas');

                const data = await response.json();
                setSession(data.user, data.token);
                window.location.href = 'index.html';

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Credenciales incorrectas',
                    text: 'El correo o contraseña no coinciden en la base de datos.',
                    confirmButtonColor: '#ffc107',
                    background: '#212529',
                    color: '#fff'
                });
            } finally {
                spinner.classList.add('d-none');
                btn.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('regNombre').value.trim();
            const apellido = document.getElementById('regApellido').value.trim();
            const email = document.getElementById('regCorreo').value.trim().toLowerCase();
            const password = document.getElementById('regPassword').value;

            if (password.length < 6) {
                Swal.fire({ icon: 'warning', title: 'Contraseña muy corta', text: 'Mínimo 6 caracteres requeridos.', confirmButtonColor: '#ffc107', background: '#212529', color: '#fff' });
                return;
            }

            const btn = registerForm.querySelector('button[type="submit"]');
            const spinner = document.getElementById('registerSpinner');
            spinner.classList.remove('d-none');
            btn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, apellido, email, password })
                });

                if (!response.ok) throw new Error('Error al registrar. Verifica si el correo ya existe.');

                Swal.fire({
                    icon: 'success',
                    title: '¡Registro exitoso!',
                    text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                    confirmButtonColor: '#ffc107',
                    background: '#212529',
                    color: '#fff'
                }).then(() => {
                    registerForm.reset();
                    document.getElementById('login-tab').click();
                });

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de registro',
                    text: error.message,
                    confirmButtonColor: '#ffc107',
                    background: '#212529',
                    color: '#fff'
                });
            } finally {
                spinner.classList.add('d-none');
                btn.disabled = false;
            }
        });
    }
});