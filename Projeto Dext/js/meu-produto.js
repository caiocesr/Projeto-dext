const db = window.firebaseDb;
const auth = window.firebaseAuth;

import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

let colmeias = [];

const dashboard = document.getElementById("dashboard");
const details = document.getElementById("details");

async function adicionarColmeia() {
    const input = document.getElementById("colmeiaId");
    const novoId = parseInt(input.value);

    if (!novoId || isNaN(novoId)) {
        alert("Por favor, insira um ID válido.");
        return;
    }

    const existe = colmeias.some(c => c.id === novoId);
    if (existe) {
        alert("Já existe uma colmeia com esse ID.");
        return;
    }

    try {
        await setDoc(doc(db, "colmeias", String(novoId)), {
            id: novoId,
        });
        alert(`Colmeia ${novoId} adicionada com sucesso!`);
        input.value = "";
    } catch (e) {
        console.error("Erro ao adicionar colmeia: ", e);
        alert("Erro ao adicionar colmeia. Tente novamente.");
    }
}

function ouvirColmeiasFirestore() {
    const q = query(collection(db, "colmeias"), orderBy("id"));
    onSnapshot(q, (snapshot) => {
        colmeias = [];
        snapshot.forEach((doc) => {
            colmeias.push(doc.data());
        });
        criarCardsColmeias();
    }, (error) => {
        console.error("Erro ao ouvir colmeias:", error);
        alert("Erro ao carregar colmeias.");
    });
}

async function buscarDetalhesColmeia(colmeiaId) {
    const colmeiaRef = doc(db, "colmeias", String(colmeiaId));
    const colmeiaDoc = await getDoc(colmeiaRef);

    let umidade = '--';
    let temperatura = '--';
    let co2 = '--';

    if (colmeiaDoc.exists()) {
        const data = colmeiaDoc.data();
        umidade = data.umidade || '--';
        temperatura = data.temperatura || '--';
        co2 = data.co2 || '--';

    } else {
        console.log(`Dados para Colmeia ${colmeiaId} não encontrados no Firestore.`);
    }

    return { umidade, temperatura, co2 };
}

function criarCardsColmeias() {
    dashboard.innerHTML = "";
    colmeias.forEach(colmeia => {
        const card = document.createElement("div");
        card.className = "beehive-card";
        card.innerHTML = `
      <h3>Colmeia ${colmeia.id}</h3>
      <p>Umidade: --%</p>
      <p>Temperatura: --°C</p>
      <p>Nível de CO₂: -- ppm</p>
    `;
        card.setAttribute('data-colmeia-id', colmeia.id);
        card.onclick = () => mostrarDetalhesColmeia(colmeia.id);

        dashboard.appendChild(card);
    });
}

async function mostrarDetalhesColmeia(colmeiaId) {
    details.innerHTML = `
    <h2>Detalhes da Colmeia ${colmeiaId}</h2>
    <canvas id="humidityChart"></canvas>
    <canvas id="tempChart"></canvas>
    <canvas id="co2Chart"></canvas>
    <p class="data-status">Carregando dados...</p>
  `;

    const dados = await buscarDetalhesColmeia(colmeiaId);

    details.querySelector('.data-status').textContent = '';

    const labels = ['00h', '06h', '12h', '18h', '24h'];
    const dadosUmidade = [dados.umidade === '--' ? null : dados.umidade]; // Apenas o valor atual
    const dadosTemperatura = [dados.temperatura === '--' ? null : dados.temperatura];
    const dadosCo2 = [dados.co2 === '--' ? null : dados.co2];

    details.innerHTML += `
    <p>Umidade Atual: ${dados.umidade}%</p>
    <p>Temperatura Atual: ${dados.temperatura}°C</p>
    <p>Nível de CO₂ Atual: ${dados.co2} ppm</p>
  `;

    new Chart(document.getElementById("humidityChart"), {
        type: 'line',
        data: {
            labels: ["Atual"],
            datasets: [{
                label: 'Umidade (%)',
                data: dadosUmidade,
                borderColor: 'red',
                fill: false,
                tension: 0.1,
                pointRadius: 5
            }]
        },
        options: {
            ...opcoesPadraoGrafico(),
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { display: true } }
            }
        }
    });

    new Chart(document.getElementById("tempChart"), {
        type: 'line',
        data: {
            labels: ["Atual"],
            datasets: [{
                label: 'Temperatura (°C)',
                data: dadosTemperatura,
                borderColor: 'blue',
                fill: false,
                tension: 0.1,
                pointRadius: 5
            }]
        },
        options: {
            ...opcoesPadraoGrafico(),
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { display: true } }
            }
        }
    });

    new Chart(document.getElementById("co2Chart"), {
        type: 'line',
        data: {
            labels: ["Atual"],
            datasets: [{
                label: 'CO₂ (ppm)',
                data: dadosCo2,
                borderColor: 'orange',
                fill: false,
                tension: 0.1,
                pointRadius: 5
            }]
        },
        options: {
            ...opcoesPadraoGrafico(),
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { display: true } }
            }
        }
    });
}

function opcoesPadraoGrafico() {
    return {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: { display: false }
            },
            x: {
                ticks: { display: false }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        }
    };
}

auth.onAuthStateChanged(user => {
    if (user) {
        ouvirColmeiasFirestore();
    } else {
        console.log("Usuário não autenticado. Redirecionando...");
    }
});

window.adicionarColmeia = adicionarColmeia;
