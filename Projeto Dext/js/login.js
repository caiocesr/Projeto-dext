const auth = window.firebaseAuth;

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const formContainer = document.getElementById('formContainer');
const formTitle = document.getElementById('formTitle');
const form = document.getElementById('form');

let isLogin = true;

function toggleForm() {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? 'Login' : 'Cadastro';
    form.innerHTML = isLogin
        ? `
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Senha" required>
            <button type="submit">Entrar</button>
            <div class="toggle">
                Não tem conta? <a href="#" onclick="toggleForm()">Cadastre-se</a>
            </div>
          `
        : `
            <input type="text" id="name" placeholder="Nome" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Senha" required>
            <button type="submit">Cadastrar</button>
            <div class="toggle">
                Já tem conta? <a href="#" onclick="toggleForm()">Entrar</a>
            </div>
          `;

    attachSubmitHandler();
}

function attachSubmitHandler() {
    form.removeEventListener('submit', handleFormSubmit);
    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login realizado com sucesso!");
            window.location.href = 'meu-produto.html';
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Cadastro realizado com sucesso! Faça login agora.");
            isLogin = true; 
            toggleForm(); 
        }
    } catch (error) {
        console.error("Erro de autenticação:", error.code, error.message);
        let errorMessage = "Ocorreu um erro.";
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este e-mail já está em uso.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Formato de e-mail inválido.';
                break;
            case 'auth/weak-password':
                errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'E-mail ou senha inválidos.';
                break;
            default:
                errorMessage = 'Erro de autenticação: ' + error.message;
        }
        alert(errorMessage);
    }
}

window.toggleForm = toggleForm;

document.addEventListener('DOMContentLoaded', toggleForm);
