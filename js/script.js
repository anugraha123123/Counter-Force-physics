// js/script.js
// Quiz Logic
function checkQuiz() {
    const answers = {
        q1: 'c',
        q2: 'b',
        q3: 'a'
    };
    let score = 0;
    const questions = ['q1', 'q2', 'q3'];
    questions.forEach(q => {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === answers[q]) {
            score++;
        }
    });
    document.getElementById('result').innerHTML = `You scored ${score} out of 3.`;
}

// Game Logic
let actionForce = 0;
let counterForce = 0;
let ctx;

function updateCounterValue() {
    counterForce = parseInt(document.getElementById('counterForceSlider').value);
    document.getElementById('counterValue').textContent = counterForce;
    drawGame();
    checkBalance();
}

function startGame() {
    actionForce = Math.floor(Math.random() * 200) - 100; // Random between -100 and 100
    counterForce = 0;
    document.getElementById('counterForceSlider').value = 0;
    document.getElementById('counterValue').textContent = 0;
    document.getElementById('gameResult').innerHTML = '';
    ctx = document.getElementById('gameCanvas').getContext('2d');
    drawGame();
}

function drawGame() {
    ctx.clearRect(0, 0, 400, 200);
    ctx.fillStyle = '#007bff';
    ctx.fillRect(100, 90, actionForce, 20); // Action force bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(300 - Math.abs(counterForce), 90, counterForce, 20); // Counter force bar
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(`Action: ${actionForce} N`, 10, 50);
    ctx.fillText(`Counter: ${counterForce} N`, 250, 50);
    ctx.fillText(`Net: ${actionForce + counterForce} N`, 150, 150);
}

function checkBalance() {
    const net = actionForce + counterForce;
    if (net === 0) {
        document.getElementById('gameResult').innerHTML = 'Balanced! Great job!';
    } else {
        document.getElementById('gameResult').innerHTML = '';
    }
}