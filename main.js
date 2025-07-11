// main.js
// Lógica de simulación del sistema oscilatorio

// Parámetros iniciales
let m = 1; // masa (kg)
let k = 10; // constante del resorte (N/m)
let x0 = 1; // elongación inicial (m)
let v0 = 0; // velocidad inicial (m/s)

// Estado de la simulación
const EstadoSimulacion = { Parado: 0, Corriendo: 1, Pausado: 2 };
let estado = EstadoSimulacion.Parado;

// Variables de tiempo
let t = 0;
const dt = 0.02; // paso de tiempo en segundos
let timer = null;

// Arrays para almacenar la evolución
let tiempos = [];
let elongaciones = [];
let velocidades = [];
let aceleraciones = [];
let energiasTotales = [];

// Referencias a los canvas de los gráficos
const ctxElongacion = document.getElementById('elongacionChart').getContext('2d');
const ctxVelocidad = document.getElementById('velocidadChart').getContext('2d');
const ctxAceleracion = document.getElementById('aceleracionChart').getContext('2d');
const ctxEnergia = document.getElementById('energiaChart').getContext('2d');
const ctxFuerza = document.getElementById('fuerzaChart').getContext('2d');

// Gráficos de Chart.js
const elongacionChart = new Chart(ctxElongacion, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'x (m)',
            data: [],
            borderColor: '#1976d2',
            fill: false,
        }]
    },
    options: { responsive: true, animation: false }
});

const velocidadChart = new Chart(ctxVelocidad, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'v (m/s)',
            data: [],
            borderColor: '#388e3c',
            fill: false,
        }]
    },
    options: { responsive: true, animation: false }
});

const aceleracionChart = new Chart(ctxAceleracion, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'a (m/s²)',
            data: [],
            borderColor: '#fbc02d',
            fill: false,
        }]
    },
    options: { responsive: true, animation: false }
});

// Modificar el gráfico de energía para mostrar tres datasets
const energiaChart = new Chart(ctxEnergia, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Energía cinética (Ec)',
                data: [],
                borderColor: '#388e3c',
                backgroundColor: 'rgba(56,142,60,0.08)',
                fill: false,
            },
            {
                label: 'Energía potencial (Ep)',
                data: [],
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25,118,210,0.08)',
                fill: false,
            },
            {
                label: 'Energía total (Et)',
                data: [],
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(211,47,47,0.08)',
                fill: false,
            }
        ]
    },
    options: {
        responsive: true,
        animation: false,
        plugins: {
            legend: { display: true, position: 'top' }
        },
        scales: {
            y: {
                beginAtZero: false,
                // Ajuste automático del rango
                suggestedMin: undefined,
                suggestedMax: undefined
            }
        }
    }
});

const fuerzaChart = new Chart(ctxFuerza, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'F (N)',
            data: [],
            borderColor: '#d32f2f',
            fill: false,
        }]
    },
    options: { responsive: true, animation: false }
});

function omega() {
    return Math.sqrt(k / m);
}

// Calcular la fase inicial φ a partir de x0 y v0
function calcularFaseInicial() {
    const w = omega();
    if (x0 === 0 && v0 === 0) return 0; // caso trivial
    // φ = atan2(-v0/(x0*ω), 1)
    return Math.atan2(-v0 / (x0 * w), 1);
}

function calcularValores(t) {
    const w = omega();
    // Forma explícita usando x0 y v0
    const x = x0 * Math.cos(w * t) + (v0 / w) * Math.sin(w * t);
    const v = -x0 * w * Math.sin(w * t) + v0 * Math.cos(w * t);
    const a = -k / m * x;
    const F = -k * x;
    const Ec = 0.5 * m * v * v;
    const Ep = 0.5 * k * x * x;
    // Energía total teórica (constante)
    const Et = 0.5 * m * v0 * v0 + 0.5 * k * x0 * x0;
    return { x, v, a, F, Ec, Ep, Et };
}

function resetSimulacion() {
    t = 0;
    tiempos = [];
    elongaciones = [];
    velocidades = [];
    aceleraciones = [];
    energiasTotales = [];
    fuerzas = [];
    energiasCineticas = [];
    energiasPotenciales = [];
}

function actualizarValoresMaximos() {
    // Elongación máxima (valor absoluto)
    const maxX = elongaciones.length ? Math.max(...elongaciones.map(Math.abs)) : 0;
    const xActual = elongaciones.length ? elongaciones[elongaciones.length-1] : 0;
    document.getElementById('maxElongacion').innerHTML = `Elongación máxima: ${maxX.toFixed(3)} m<br><span style='font-weight:normal'>Actual: ${xActual.toFixed(3)} m</span>`;

    // Velocidad máxima (valor absoluto)
    const maxV = velocidades.length ? Math.max(...velocidades.map(Math.abs)) : 0;
    const vActual = velocidades.length ? velocidades[velocidades.length-1] : 0;
    document.getElementById('maxVelocidad').innerHTML = `Velocidad máxima: ${maxV.toFixed(3)} m/s<br><span style='font-weight:normal'>Actual: ${vActual.toFixed(3)} m/s</span>`;

    // Aceleración máxima (valor absoluto)
    const maxA = aceleraciones.length ? Math.max(...aceleraciones.map(Math.abs)) : 0;
    const aActual = aceleraciones.length ? aceleraciones[aceleraciones.length-1] : 0;
    document.getElementById('maxAceleracion').innerHTML = `Aceleración máxima: ${maxA.toFixed(3)} m/s²<br><span style='font-weight:normal'>Actual: ${aActual.toFixed(3)} m/s²</span>`;

    // Fuerza máxima (valor absoluto)
    const maxF = fuerzas.length ? Math.max(...fuerzas.map(Math.abs)) : 0;
    const fActual = fuerzas.length ? fuerzas[fuerzas.length-1] : 0;
    document.getElementById('maxFuerza').innerHTML = `Fuerza máxima: ${maxF.toFixed(3)} N<br><span style='font-weight:normal'>Actual: ${fActual.toFixed(3)} N</span>`;

    // Energías máximas y actuales
    const maxEc = energiasCineticas.length ? Math.max(...energiasCineticas) : 0;
    const maxEp = energiasPotenciales.length ? Math.max(...energiasPotenciales) : 0;
    const maxEt = energiasTotales.length ? Math.max(...energiasTotales) : 0;
    const EcActual = energiasCineticas.length ? energiasCineticas[energiasCineticas.length-1] : 0;
    const EpActual = energiasPotenciales.length ? energiasPotenciales[energiasPotenciales.length-1] : 0;
    const EtActual = energiasTotales.length ? energiasTotales[energiasTotales.length-1] : 0;
    document.getElementById('energiasInfo').innerHTML =
        `Energía cinética máxima: ${maxEc.toFixed(3)} J<br>` +
        `Energía potencial máxima: ${maxEp.toFixed(3)} J<br>` +
        `Energía total máxima: ${maxEt.toFixed(3)} J<br>` +
        `<hr style='margin:4px 0;'>` +
        `Energía cinética actual: ${EcActual.toFixed(3)} J<br>` +
        `Energía potencial actual: ${EpActual.toFixed(3)} J<br>` +
        `Energía total actual: ${EtActual.toFixed(3)} J`;
}

// Modificar actualizarGraficos para actualizar los tres datasets y ajustar el rango Y
function actualizarGraficos() {
    elongacionChart.data.labels = tiempos;
    elongacionChart.data.datasets[0].data = elongaciones;
    elongacionChart.update('none');

    velocidadChart.data.labels = tiempos;
    velocidadChart.data.datasets[0].data = velocidades;
    velocidadChart.update('none');

    aceleracionChart.data.labels = tiempos;
    aceleracionChart.data.datasets[0].data = aceleraciones;
    aceleracionChart.update('none');

    // --- Solo para el gráfico de energía: ventana de tiempo fija ---
    const ventanaSegundos = 4; // muestra solo los últimos 4 segundos
    const n = Math.floor(ventanaSegundos / dt);
    const start = Math.max(0, tiempos.length - n);

    energiaChart.data.labels = tiempos.slice(start);
    energiaChart.data.datasets[0].data = energiasCineticas.slice(start);
    energiaChart.data.datasets[1].data = energiasPotenciales.slice(start);
    energiaChart.data.datasets[2].data = energiasTotales.slice(start);

    // Ajustar el rango Y automáticamente
    const allEnergies = energiaChart.data.datasets[0].data
        .concat(energiaChart.data.datasets[1].data, energiaChart.data.datasets[2].data);
    if (allEnergies.length > 0) {
        const min = Math.min(...allEnergies);
        const max = Math.max(...allEnergies);
        energiaChart.options.scales.y.min = min - 0.05 * Math.abs(max - min);
        energiaChart.options.scales.y.max = max + 0.05 * Math.abs(max - min);
    }
    energiaChart.update('none');

    fuerzaChart.data.labels = tiempos;
    fuerzaChart.data.datasets[0].data = fuerzas;
    fuerzaChart.update('none');

    actualizarValoresMaximos();
}

function mostrarParametrosFisicos() {
    const w = omega();
    const phi = calcularFaseInicial();
    const phiDeg = phi * 180 / Math.PI;
    document.getElementById('paramInfo').innerHTML =
        `Frecuencia angular (ω): <b>${w.toFixed(4)} rad/s</b><br>` +
        `Fase inicial (φ): <b>${phi.toFixed(4)} rad</b> &nbsp;|&nbsp; <b>${phiDeg.toFixed(2)}°</b>`;
}

// Inicializar valores al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    resetSimulacion();
    actualizarGraficos();
    mostrarParametrosFisicos();
});

// Manejo de controles y simulación

document.getElementById('startBtn').addEventListener('click', () => {
    if (estado !== EstadoSimulacion.Corriendo) {
        estado = EstadoSimulacion.Corriendo;
        if (!timer) {
            timer = setInterval(simularPaso, dt * 1000);
        }
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    if (estado === EstadoSimulacion.Corriendo) {
        estado = EstadoSimulacion.Pausado;
        clearInterval(timer);
        timer = null;
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    estado = EstadoSimulacion.Parado;
    clearInterval(timer);
    timer = null;
    resetSimulacion();
    actualizarGraficos();
    mostrarParametrosFisicos();
});

// Actualización de parámetros
function actualizarParametros() {
    m = parseFloat(document.getElementById('mass').value);
    k = parseFloat(document.getElementById('k').value);
    x0 = parseFloat(document.getElementById('x0').value);
    v0 = parseFloat(document.getElementById('v0').value);
    resetSimulacion();
    actualizarGraficos();
    mostrarParametrosFisicos();
}

document.getElementById('mass').addEventListener('change', actualizarParametros);
document.getElementById('k').addEventListener('change', actualizarParametros);
document.getElementById('x0').addEventListener('change', actualizarParametros);
document.getElementById('v0').addEventListener('change', actualizarParametros);

// Simulación paso a paso
defaultSteps = 1000;
function simularPaso() {
    if (estado !== EstadoSimulacion.Corriendo) return;
    const valores = calcularValores(t);
    tiempos.push(Number(t.toFixed(2)));
    elongaciones.push(valores.x);
    velocidades.push(valores.v);
    aceleraciones.push(valores.a);
    fuerzas.push(valores.F);
    energiasCineticas.push(valores.Ec);
    energiasPotenciales.push(valores.Ep);
    energiasTotales.push(valores.Et);
    actualizarGraficos();
    t += dt;
    if (tiempos.length > 1000) {
        tiempos.shift();
        elongaciones.shift();
        velocidades.shift();
        aceleraciones.shift();
        fuerzas.shift();
        energiasCineticas.shift();
        energiasPotenciales.shift();
        energiasTotales.shift();
    }
}

function actualizarValoresEnergia() {
    const maxEnergia = Math.max(...energiasTotales).toFixed(3);
    const actualEnergia = energiasTotales[energiasTotales.length - 1]?.toFixed(3) || '0';
    document.getElementById('energiasInfo').innerHTML =
        `<span class="max">Máximo: ${maxEnergia}</span> <span class="actual">Actual: ${actualEnergia}</span>`;
}

document.getElementById('modoSwitch').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
});