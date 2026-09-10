const USERS_KEY = 'lanhua_users';
const SESSION_KEY = 'lanhua_session';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const setSession = (user) => {
    const { password, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
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
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginCorreo').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            const spinner = document.getElementById('loginSpinner');

            spinner.classList.remove('d-none');
            btn.disabled = true;

            setTimeout(() => {
                spinner.classList.add('d-none');
                btn.disabled = false;

                const users = getUsers();
                const foundUser = users.find(u => u.email === email && u.password === password);

                if (!foundUser) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Credenciales incorrectas',
                        text: 'El correo o contraseña no coinciden.',
                        confirmButtonColor: '#ffc107',
                        background: '#212529',
                        color: '#fff'
                    });
                    return;
                }

                setSession(foundUser);
                window.location.href = 'index.html'; // Redirige a la Agenda
            }, 1000);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('regNombre').value.trim();
            const apellido = document.getElementById('regApellido').value.trim();
            const correo = document.getElementById('regCorreo').value.trim().toLowerCase();
            const password = document.getElementById('regPassword').value;

            if (password.length < 6) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Contraseña muy corta',
                    text: 'Mínimo 6 caracteres requeridos.',
                    confirmButtonColor: '#ffc107',
                    background: '#212529',
                    color: '#fff'
                });
                return;
            }

            const users = getUsers();
            if (users.some(u => u.email === correo)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Correo ya registrado',
                    text: 'Intenta iniciar sesión.',
                    confirmButtonColor: '#ffc107',
                    background: '#212529',
                    color: '#fff'
                });
                return;
            }

            const btn = registerForm.querySelector('button[type="submit"]');
            const spinner = document.getElementById('registerSpinner');
            spinner.classList.remove('d-none');
            btn.disabled = true;

            setTimeout(() => {
                spinner.classList.add('d-none');
                btn.disabled = false;

                const newUser = {
                    id: Date.now().toString(),
                    nombre,
                    apellido,
                    email: correo,
                    password,
                    role: 'trainer'
                };

                users.push(newUser);
                saveUsers(users);

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
            }, 1000);
        });
    }
});