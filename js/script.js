// js/script.js (updated: removed slider dependency, now fully keyboard-controlled; added friction for better gameplay)
let actionForce = 0;
let counterForce = 0;
let ctx;
let ballPosition = 250; // Center of canvas width 500
let velocity = 0;
let score = 0;
let time = 0;
let gameInterval;
let levelInterval;
let timerInterval;
let isGameRunning = false;

function updateCounterValue() {
    document.getElementById('counterValue').textContent = counterForce;
}

function startGame() {
    if (isGameRunning) {
        endGame();
    }
    isGameRunning = true;
    actionForce = Math.floor(Math.random() * 201) - 100; // -100 to 100
    counterForce = 0;
    ballPosition = 250;
    velocity = 0;
    score = 0;
    time = 0;
    updateCounterValue();
    document.getElementById('gameResult').innerHTML = '';
    document.getElementById('score').innerHTML = 'Score: 0';
    document.getElementById('timer').innerHTML = 'Time: 0s';
    document.getElementById('startButton').textContent = 'Reset Game';
    const canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    gameInterval = setInterval(gameLoop, 16); // ~60 FPS
    levelInterval = setInterval(changeActionForce, 10000); // Change force every 10s
    timerInterval = setInterval(updateTimer, 1000); // Update time/score every second
}

function gameLoop() {
    const netForce = actionForce + counterForce;
    velocity += netForce * 0.001; // Acceleration = netForce / mass (mass=1000)
    velocity *= 0.98; // Friction damping for more realistic/stabilizable motion
    ballPosition += velocity;
    
    if (ballPosition < 100 || ballPosition > 400) { // Off platform edges
        endGame();
    }
    
    drawGame();
}

function drawGame() {
    const canvas = document.getElementById('gameCanvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Platform
    ctx.fillStyle = '#888';
    ctx.fillRect(100, 200, 300, 20); // Platform from x=100 to 400
    
    // Ball (object)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(ballPosition, 190, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Force arrows (fixed for proper direction)
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    drawArrow(250, 100, actionForce); // Action
    ctx.strokeStyle = '#ff8800';
    drawArrow(250, 120, counterForce); // Counter
    
    // Labels
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Action Force: ${actionForce} N`, 10, 30);
    ctx.fillText(`Counter Force: ${counterForce} N`, 10, 50);
    ctx.fillText(`Net Force: ${actionForce + counterForce} N`, 10, 70);
    ctx.fillText(`Keep the ball on the platform!`, 150, 250);
}

function drawArrow(centerX, y, force) {
    const scale = 0.5; // Scale arrow length
    const absForce = Math.abs(force);
    const arrowLength = absForce * scale;
    let fromX, toX;
    if (force >= 0) {
        fromX = centerX - arrowLength / 2;
        toX = centerX + arrowLength / 2;
    } else {
        fromX = centerX + arrowLength / 2;
        toX = centerX - arrowLength / 2;
    }
    ctx.beginPath();
    ctx.moveTo(fromX, y);
    ctx.lineTo(toX, y);
    ctx.stroke();
    // Arrowhead
    const headLen = 10;
    const dx = toX - fromX;
    const dy = 0; // Horizontal
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(toX, y);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, y);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function updateTimer() {
    if (!isGameRunning) return;
    time++;
    score += Math.abs(actionForce + counterForce) < 5 ? 10 : 0; // Bonus for close balance
    document.getElementById('timer').innerHTML = `Time: ${time}s`;
    document.getElementById('score').innerHTML = `Score: ${score}`;
}

function changeActionForce() {
    if (!isGameRunning) return;
    actionForce = Math.floor(Math.random() * 201) - 100;
    velocity *= 0.5; // Dampen velocity on level change
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(levelInterval);
    clearInterval(timerInterval);
    isGameRunning = false;
    document.getElementById('gameResult').innerHTML = `<strong style="color: red;">Game Over! Final Score: ${score}</strong>`;
    document.getElementById('startButton').textContent = 'Start Game';
}

function initGameListeners() {
    // Keyboard controls for counter force
    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;
        if (e.key === 'ArrowLeft') {
            counterForce = Math.max(counterForce - 1, -100);
        } else if (e.key === 'ArrowRight') {
            counterForce = Math.min(counterForce + 1, 100);
        }
        updateCounterValue();
    });
}

// Quiz Logic (unchanged)
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
    document.getElementById('result').innerHTML = `<strong>You scored ${score} out of 3!</strong>`;
}