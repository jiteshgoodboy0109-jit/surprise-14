// --- Configuration ---
const apiKey = ""; // API Key injected by environment

// --- State ---
let scene = 0;
let noCount = 0;
let isMusicPlaying = false;
let typingInterval;
let lastTouchTime = 0;
let celebrationInterval;

const scenes = [
    { id: 0, bg: "bg-gradient-to-br from-pink-400 via-rose-300 to-purple-400 animate-gradient" }, // Intro
    { id: 1, bg: "bg-gradient-to-b from-orange-200 via-pink-200 to-rose-300 animate-gradient" }, // Sunrise
    { id: 2, bg: "bg-gradient-to-tr from-rose-100 via-pink-100 to-teal-100 animate-gradient" }, // Memories
    { id: 3, bg: "bg-gradient-to-b from-slate-50 to-rose-50" }, // Letter
    { id: 4, bg: "bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 animate-gradient" }, // Waiting
    { id: 5, bg: "bg-black" }, // Proposal (Video)
];

// --- Gemini API Handler ---
async function callGemini(prompt) {
    if (!apiKey) {
        alert("API Key is missing! Please configure it in the code.");
        return null;
    }
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "The stars are a bit cloudy today... ✨ (Error connecting to AI)";
    }
}

// --- Features ---

function downloadLetter() {
    const letterElement = document.getElementById('letter-content-area');
    if (!letterElement) return;

    // Options for html2pdf
    const opt = {
        margin: 0.5,
        filename: 'Love_Letter_For_Nila.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Use html2pdf library (loaded via CDN)
    if (window.html2pdf) {
        html2pdf().set(opt).from(letterElement).save();
    } else {
        alert("PDF generator not ready yet. Please wait a moment.");
    }
}

// --- Touch & Mouse Interaction ---
function spawnTouchPetal(x, y) {
    const petal = document.createElement('div');
    petal.classList.add('touch-petal');

    const isHeart = Math.random() > 0.5;
    if (isHeart) {
        petal.innerHTML = `<svg viewBox="0 0 24 24" fill="#fb7185"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    } else {
        petal.innerHTML = `<svg viewBox="0 0 30 30" fill="#e11d48"><path d="M15 0 C4 10 0 20 8 26 C16 32 26 22 15 0 Z" /></svg>`;
    }

    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;

    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 1500);
}

document.addEventListener('mousemove', (e) => {
    if (Date.now() - lastTouchTime > 40) {
        spawnTouchPetal(e.clientX, e.clientY);
        lastTouchTime = Date.now();
    }
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (Date.now() - lastTouchTime > 40) {
        spawnTouchPetal(touch.clientX, touch.clientY);
        lastTouchTime = Date.now();
    }
}, { passive: true });

document.addEventListener('click', (e) => {
    spawnTouchPetal(e.clientX, e.clientY);
    setTimeout(() => spawnTouchPetal(e.clientX + 15, e.clientY + 15), 50);
    setTimeout(() => spawnTouchPetal(e.clientX - 15, e.clientY - 15), 100);
    setTimeout(() => spawnTouchPetal(e.clientX + 10, e.clientY - 10), 150);
    setTimeout(() => spawnTouchPetal(e.clientX - 10, e.clientY + 10), 200);
});

// --- Core Functions ---

function init() {
    renderScene();
    updateProgress();
    lucide.createIcons();
}

function nextScene() {
    if (scene < scenes.length - 1) {
        scene++;
        renderScene();
        updateProgress();
    }
}

function handleNo() {
    noCount++;
    renderProposalButtons();
}

function updateProgress() {
    const container = document.getElementById('progress-bar');
    container.innerHTML = scenes.map((s, idx) => `
        <div class="h-2 rounded-full transition-all duration-500 shadow-sm ${idx === scene ? 'w-8 bg-white scale-110' : 'w-2 bg-white/40'}"></div>
    `).join('');
}

function typeWriter(text, elementId, onComplete, speed = 30) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = "";
    let i = 0;
    clearInterval(typingInterval);

    const cleanText = text.trim();

    typingInterval = setInterval(() => {
        if (i < cleanText.length) {
            element.innerText += cleanText.charAt(i);
            const scrollContainer = element.parentElement;
            if (scrollContainer && scrollContainer.classList.contains('letter-scroll')) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
            i++;
        } else {
            clearInterval(typingInterval);
            if (onComplete) setTimeout(onComplete, 500);
        }
    }, speed);
}

// --- Background Generators ---

function clearBackground() {
    document.getElementById('bg-effects').innerHTML = '';
    clearInterval(celebrationInterval);
}

function createFloatingLove() {
    const container = document.getElementById('bg-effects');
    const colors = ['#ffe4e6', '#fecdd3', '#ffffff', '#fbcfe8', '#e11d48', '#ff007f', '#ffb6c1'];
    for (let i = 0; i < 40; i++) {
        const heart = document.createElement('div');
        const size = Math.floor(Math.random() * 20) + 10;
        heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colors[Math.floor(Math.random() * colors.length)]}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); opacity: 0.8;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        heart.className = 'absolute opacity-0 animate-float-hearts';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (5 + Math.random() * 10) + 's';
        heart.style.animationDelay = (Math.random() * 8) + 's';
        container.appendChild(heart);
    }
}

function createFireflies() {
    const container = document.getElementById('bg-effects');
    for (let i = 0; i < 30; i++) {
        const fly = document.createElement('div');
        fly.className = 'firefly';
        fly.style.left = Math.random() * 100 + '%';
        fly.style.top = Math.random() * 100 + '%';
        fly.style.animationDuration = (3 + Math.random() * 3) + 's';
        fly.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(fly);
    }
}

function createRosePetalRain() {
    const container = document.getElementById('bg-effects');
    const colors = ['#e11d48', '#be123c', '#fb7185', '#fda4af'];
    for (let i = 0; i < 50; i++) {
        const petal = document.createElement('div');
        petal.innerHTML = `<svg width="24" height="24" viewBox="0 0 30 30" fill="${colors[Math.floor(Math.random() * colors.length)]}"><path d="M15 0 C4 10 0 20 8 26 C16 32 26 22 15 0 Z" /></svg>`;
        petal.className = 'absolute opacity-0 animate-petal-rain';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.top = -20 + 'px';
        petal.style.animationDuration = (2 + Math.random() * 2) + 's';
        petal.style.animationDelay = (Math.random() * 2) + 's';
        const scale = 0.5 + Math.random() * 0.5;
        petal.style.transform = `scale(${scale})`;
        container.appendChild(petal);
    }
}

function createFirework(x, y) {
    const container = document.getElementById('bg-effects');
    const colors = ['#FFD700', '#FF69B4', '#00BFFF', '#FF4500', '#32CD32'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function createCelebration() {
    createRosePetalRain();
    createFloatingLove();
    celebrationInterval = setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight / 2);
        createFirework(x, y);
    }, 500);
}

// --- Render Logic ---

function renderScene() {
    const container = document.getElementById('main-container');
    const content = document.getElementById('content');

    // 1. Set Background
    container.className = `w-full h-screen relative flex flex-col items-center justify-center transition-all duration-1000 ${scenes[scene].bg}`;

    // 2. Set Background Effects
    clearBackground();

    if (scene <= 3) createFloatingLove();
    if (scene === 4) createFireflies();
    // Scene 5 (Video) no bg effects
    // Scene 6 removed

    // 3. Render HTML Content from Templates
    const templateId = `scene-${scene}-template`;
    const template = document.getElementById(templateId);

    if (template) {
        content.innerHTML = template.innerHTML;
    } else {
        content.innerHTML = `<div class="text-white">Scene ${scene} content missing</div>`;
    }

    // 4. Dynamic Logic per Scene
    switch (scene) {
        case 0: // Intro
            const text0Element = document.getElementById('source-text-0');
            if (text0Element) {
                const text0 = text0Element.innerText;
                typeWriter(text0, "type-text-0", () => {
                    const btnContainer = document.getElementById('action-buttons-0');
                    if (btnContainer) {
                        btnContainer.classList.remove('hidden');
                        btnContainer.classList.add('flex');
                    }
                });
            }
            break;

        case 1: // Sunrise
            const text1Element = document.getElementById('source-text-1');
            if (text1Element) {
                const text1 = text1Element.innerText;
                typeWriter(text1, "type-text-1", () => {
                    const nextBtn = document.getElementById('next-btn-1');
                    if (nextBtn) nextBtn.classList.remove('hidden');
                });
            }
            break;

        case 2: // Memories
            // Inject Images from Source Divs
            ['1', '2', '3'].forEach(id => {
                const source = document.getElementById(`source-image-${id}`);
                const img = document.getElementById(`memory-img-${id}`);
                if (source && img) {
                    const url = source.innerText.trim();
                    if (url) img.src = url;
                }
            });
            break;

        case 3: // Letter
            const text3Element = document.getElementById('source-text-3');
            if (text3Element) {
                const text3 = text3Element.innerText;
                typeWriter(text3, "type-text-3", () => {
                    const nextBtn = document.getElementById('next-btn-3');
                    const downloadBtn = document.getElementById('download-btn-3');
                    if (nextBtn) nextBtn.classList.remove('hidden');
                    if (downloadBtn) downloadBtn.classList.remove('hidden');
                });
            }
            break;

        case 4: // Waiting
            const text4Element = document.getElementById('source-text-4');
            if (text4Element) {
                const text4 = text4Element.innerText;
                typeWriter(text4, "type-text-4", () => {
                    const nextBtn = document.getElementById('next-btn-4');
                    if (nextBtn) nextBtn.classList.remove('hidden');
                });
            }
            break;

        case 5: // Proposal (Video)
            renderProposalButtons(); // Prepare buttons but keep hidden
            const video = document.getElementById('proposal-video');
            const card = document.getElementById('proposal-card');

            // Inject Text from Source Divs
            const titleSource = document.getElementById('source-text-5-title');
            const questionSource = document.getElementById('source-text-5-question');

            if (titleSource) {
                document.getElementById('final-proposal-title').innerText = titleSource.innerText.trim();
            }
            if (questionSource) {
                document.getElementById('final-proposal-question').innerText = questionSource.innerText.trim();
            }

            if (video) {
                video.style.pointerEvents = 'none';
                video.play().catch(e => console.log("Autoplay blocked, waiting for interaction", e));

                video.onended = () => {
                    if (card) {
                        card.classList.remove('hidden');
                        setTimeout(() => {
                            card.classList.remove('scale-0');
                            card.classList.add('scale-100');
                        }, 100);
                        createRosePetalRain(); // Add effect when card appears
                    }
                };
            }
            break;
    }

    lucide.createIcons();
}

function renderProposalButtons() {
    const container = document.getElementById('proposal-buttons');
    if (!container) return;

    let noBtnText = "No...";
    if (noCount === 1) noBtnText = "Wait, really? 🥺";
    if (noCount === 2) noBtnText = "Please don't... 😢";
    if (noCount === 3) noBtnText = "Breaks my heart... 💔";

    let html = `
        <button onclick="window.location.href='https://wa.me/918220945226?text=I%20Love%20You%20%F0%9F%92%96'" class="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xl rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-rose-500/50 flex items-center justify-center gap-2">
            YES, I Will! 💖
        </button>
    `;

    if (noCount < 4) {
        html += `
            <button onclick="handleNo()" class="w-full py-3 bg-white/10 text-slate-300 rounded-xl text-sm hover:bg-white/20 transition-all border border-white/10">
                ${noBtnText}
            </button>
        `;
    } else {
        html += `
            <div class="text-rose-200 text-sm font-cute animate-pulse bg-white/10 p-2 rounded-lg">
                Okay, I'm not letting you say no anymore! 😘
            </div>
        `;
    }
    container.innerHTML = html;
}

window.onload = init;