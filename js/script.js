// js/script.js (ULTIMATELY PLAYABLE: BALL SUPER SLOW, HIGH FRICTION, EASY CONTROLS - PERFECT FOR LOW SENSITIVITY!)
let ctx;
let canvas;
let actionForce = 0;
let counterForce = 0;
let ballPosition = 300;
let ballY = 220;
let velocityX = 0;
let velocityY = 0;
let score = 0;
let startTime = 0;
let lastTime = 0;
let animationId;
let levelInterval;
let isGameRunning = false;
let isFalling = false;
let leftPressed = false;
rightPressed = false;
let level = 1;
const canvasWidth = 600;
const canvasHeight = 400;
const centerX = canvasWidth / 2;
const platformLeft = 80;  // Wider platform
const platformRight = 520;
const mass = 1;
const accelScale = 4;  // MUCH SLOWER acceleration (was 60 -> 4)
const gravity = 600;   // Slower fall
const drag = 0.88;     // STRONGER friction (ball stops FAST)
const changeSpeed = 120;  // FASTER counter adjustment (easy control)
const pointsPerSec = 30;
const balanceThreshold = 8;  // Forgiving balance

function startGame() {
    if (isGameRunning) endGame();
    isGameRunning = true;
    isFalling = false;
    level = 1;
    actionForce = getRandomForce();
    counterForce = 0;
    ballPosition = centerX;
    ballY = 220;
    velocityX = 0;
    velocityY = 0;
    score = 0;
    startTime = performance.now();
    lastTime = startTime;
    document.getElementById('counterValue').textContent = counterForce;
    document.getElementById('gameResult').innerHTML = '';
    document.getElementById('score').innerHTML = `Score: 0`;
    document.getElementById('timer').innerHTML = `Time: 0s`;
    document.getElementById('startButton').textContent = 'Reset Game';
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    gameLoop();
    levelInterval = setInterval(() => {
        if (isGameRunning) {
            level++;
            actionForce = getRandomForce();
            velocityX *= 0.6;
        }
    }, 15000);  // Slower level changes (15s)
}

function getRandomForce() {
    const maxForce = 20 + level * 3;  // Smaller forces, slow ramp
    return Math.floor(Math.random() * (2 * maxForce + 1)) - maxForce;
}

function gameLoop(currentTime = performance.now()) {
    if (!isGameRunning) return;
    const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
    lastTime = currentTime;

    const netForce = actionForce + counterForce;
    
    // Controls: FAST smooth hold
    if (!isFalling) {
        if (leftPressed) counterForce = Math.max(-150, counterForce - changeSpeed * dt);
        if (rightPressed) counterForce = Math.min(150, counterForce + changeSpeed * dt);
    }
    document.getElementById('counterValue').textContent = Math.round(counterForce);

    // Physics: SUPER SLOW & DAMPED
    if (!isFalling) {
        velocityX += netForce * accelScale * dt / mass;
        velocityX *= drag;
        // EXTRA damping when balanced
        if (Math.abs(netForce) < balanceThreshold) velocityX *= 0.92;
        ballPosition += velocityX * dt;
        
        // Wider forgiving edges
        if (ballPosition < platformLeft || ballPosition > platformRight) {
            isFalling = true;
            velocityY = -20;  // Gentle kick off
        }
    } else {
        // Falling
        velocityX *= drag;
        velocityY += gravity * dt;
        ballPosition += velocityX * dt;
        ballY += velocityY * dt;
        if (ballY > canvasHeight - 20) {
            endGame();
            return;
        }
    }

    // Real-time timer/score
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    document.getElementById('timer').innerHTML = `Time: ${elapsed}s`;
    if (Math.abs(netForce) < balanceThreshold) score += pointsPerSec * dt;
    document.getElementById('score').innerHTML = `Score: ${Math.floor(score)}`;

    drawGame(netForce);
    animationId = requestAnimationFrame(gameLoop);
}

function drawGame(netForce) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#e3f2fd');
    grad.addColorStop(1, '#f5f5f5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Platform (wider, nicer)
    ctx.fillStyle = '#4caf50';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;
    ctx.fillRect(platformLeft, 235, platformRight - platformLeft, 25);
    ctx.shadowBlur = 0;
    
    // Ball (glowing)
    ctx.fillStyle = '#ff5722';
    ctx.shadowColor = 'rgba(255,87,34,0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = velocityX * 2;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.arc(ballPosition, ballY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Arrows
    const scale = 2;
    drawArrow(centerX, 60, actionForce, '#2196f3', 'Action');
    drawArrow(centerX, 90, counterForce, '#ff9800', 'Counter');
    const netColor = Math.abs(netForce) < balanceThreshold ? '#4caf50' : '#f44336';
    drawArrow(centerX, 120, netForce, netColor, 'Net');
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Action: ${actionForce}N`, 20, 50);
    ctx.fillText(`Counter: ${Math.round(counterForce)}N`, 20, 80);
    ctx.fillText(`Net: ${Math.round(netForce)}N`, 20, 110);
    
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    if (isFalling) {
        ctx.fillStyle = '#f44336';
        ctx.fillText('FALLING! Unbalanced 😵', centerX, 280);
    } else {
        ctx.fillStyle = Math.abs(netForce) < balanceThreshold ? '#4caf50' : '#ff9800';
        ctx.fillText('BALANCE IT! 🎯', centerX, 280);
    }
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#007bff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Level: ${level}`, 20, canvasHeight - 25);
}

function drawArrow(centerX, y, force, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const absForce = Math.abs(force);
    const arrowLength = Math.min(absForce * scale, 140);
    let fromX = centerX - arrowLength / 2;
    let toX = centerX + arrowLength / 2;
    if (force < 0) {
        fromX = centerX + arrowLength / 2;
        toX = centerX - arrowLength / 2;
    }
    // Shaft
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(fromX, y);
    ctx.lineTo(toX, y);
    ctx.stroke();
    // Head
    ctx.lineWidth = 4;
    const headLen = 15;
    const dx = toX - fromX;
    const angle = Math.atan2(0, dx);
    ctx.beginPath();
    ctx.moveTo(toX, y);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

function endGame() {
    cancelAnimationFrame(animationId);
    clearInterval(levelInterval);
    isGameRunning = false;
    document.getElementById('gameResult').innerHTML = `<strong style="color: #ff5722; font-size: 28px;">Game Over! Score: ${Math.floor(score)} 🎮</strong><br><small>Hold ←/→ arrows to counter the blue force!</small>`;
    document.getElementById('startButton').textContent = 'Start Game';
}

function initGameListeners() {
    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (!isGameRunning) return;
        if (e.key === 'ArrowLeft') leftPressed = true;
        if (e.key === 'ArrowRight') rightPressed = true;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') leftPressed = false;
        if (e.key === 'ArrowRight') rightPressed = false;
    });
}

// Quiz (unchanged)
function checkQuiz() {
    const answers = { q1: 'c', q2: 'b', q3: 'a' };
    let score = 0;
    ['q1', 'q2', 'q3'].forEach(q => {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === answers[q]) score++;
    });
    document.getElementById('result').innerHTML = `<strong style="color: #007bff;">You scored ${score}/3! 🎉</strong>`;
}