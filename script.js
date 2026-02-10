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
    console.log("=== PDF DOWNLOAD STARTED ===");

    // Get the FULL letter text from the source template
    const template = document.getElementById('scene-3-template');
    console.log("Template found:", !!template);

    const textTarget = template ? template.querySelector('#source-text-3') : null;
    console.log("Source text element found:", !!textTarget);

    if (!textTarget) {
        alert("Letter content not found! Please try again. ✨");
        console.error("Could not find #source-text-3 in template");
        return;
    }

    const fullContent = textTarget.innerText.trim();
    console.log("📝 Letter content captured:");
    console.log("   Length:", fullContent.length, "characters");
    console.log("   First 150 chars:", fullContent.substring(0, 150));
    console.log("   Last 100 chars:", fullContent.substring(fullContent.length - 100));

    if (!fullContent || fullContent.length < 10) {
        alert("Letter content is empty or too short! ✨");
        console.error("Content too short:", fullContent);
        return;
    }

    // Create PDF container
    const printContainer = document.createElement('div');
    printContainer.id = 'pdf-letter-container';
    printContainer.style.width = '800px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.padding = '60px 50px';
    printContainer.style.boxSizing = 'border-box';
    printContainer.style.minHeight = '1000px';
    printContainer.style.position = 'relative';

    // Add ruled lines background
    const lineHeight = '36pt';
    printContainer.style.lineHeight = lineHeight;
    printContainer.style.backgroundImage = 'repeating-linear-gradient(transparent, transparent 35pt, #e5e7eb 35pt, #e5e7eb 36pt)';
    printContainer.style.backgroundSize = '100% 36pt';

    // Header with date
    const header = document.createElement('div');
    header.style.textAlign = 'right';
    header.style.marginBottom = '30px';
    header.style.color = '#94a3b8';
    header.style.fontSize = '14pt';
    header.style.fontFamily = "'Nunito', sans-serif";
    header.style.lineHeight = '1.5';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    header.textContent = dateStr;
    printContainer.appendChild(header);

    // Letter body - CRITICAL PART
    const body = document.createElement('div');
    body.style.fontSize = '20pt';
    body.style.color = '#1e293b';
    body.style.whiteSpace = 'pre-wrap';
    body.style.wordWrap = 'break-word';
    body.style.fontFamily = "'Dancing Script', cursive";
    body.style.lineHeight = lineHeight;
    body.style.width = '100%';

    // Set the content - THIS IS THE KEY LINE
    body.textContent = fullContent;
    console.log("Body element created, content set");
    console.log("Body textContent length:", body.textContent.length);

    printContainer.appendChild(body);

    // Feather decoration
    const feather = document.createElement('div');
    feather.style.position = 'absolute';
    feather.style.right = '30px';
    feather.style.bottom = '30px';
    feather.style.opacity = '0.06';
    feather.style.fontSize = '60pt';
    feather.textContent = '🪶';
    printContainer.appendChild(feather);

    // Append to body (hidden off-screen)
    printContainer.style.position = 'fixed';
    printContainer.style.left = '-10000px';
    printContainer.style.top = '0';
    document.body.appendChild(printContainer);

    console.log("Container appended to body");
    console.log("Container innerHTML length:", printContainer.innerHTML.length);

    // PDF options
    const opt = {
        margin: 0.5,
        filename: 'Love_Letter_To_you.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,
            letterRendering: true
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    };

    if (window.html2pdf) {
        console.log("html2pdf library found, generating PDF...");
        setTimeout(() => {
            html2pdf().set(opt).from(printContainer).save().then(() => {
                console.log("✅ PDF GENERATED SUCCESSFULLY!");
                document.body.removeChild(printContainer);
            }).catch(err => {
                console.error("❌ PDF Generation Error:", err);
                alert("PDF generation failed. Check console for details. 💫");
                if (document.body.contains(printContainer)) {
                    document.body.removeChild(printContainer);
                }
            });
        }, 500);
    } else {
        console.error("html2pdf library not loaded!");
        alert("PDF library not ready. Please refresh and try again! ✨");
        document.body.removeChild(printContainer);
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
    console.log("Initializing App...");
    try {
        renderScene();
        updateProgress();
        if (window.lucide) {
            lucide.createIcons();
        }
    } catch (error) {
        console.error("Initialization Error:", error);
    }
}

function nextScene() {
    if (scene < scenes.length - 1) {
        scene++;
        renderScene();
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

function typeWriter(text, element, onComplete, speed = 30) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
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
    console.log(`Rendering Scene ${scene}...`);
    try {
        const container = document.getElementById('main-container');
        const content = document.getElementById('content');

        if (!container || !content) {
            console.error("Critical elements missing!");
            return;
        }

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
                // Inject Image from Source Div
                const source0 = template.querySelector('#source-image-0');
                const img0 = content.querySelector('#intro-img-0');
                if (source0 && img0) {
                    const url = source0.innerText.trim();
                    if (url) img0.src = url;
                }

                const text0Element = template.querySelector('#source-text-0');
                if (text0Element) {
                    const text0 = text0Element.innerText;
                    typeWriter(text0, content.querySelector("#type-text-0"), () => {
                        const btnContainer = content.querySelector('#action-buttons-0');
                        if (btnContainer) {
                            btnContainer.classList.remove('hidden');
                            btnContainer.classList.add('flex');
                        }
                    });
                }
                break;

            case 1: // Sunrise
                const text1Element = template.querySelector('#source-text-1');
                if (text1Element) {
                    const text1 = text1Element.innerText;
                    typeWriter(text1, content.querySelector("#type-text-1"), () => {
                        const nextBtn = content.querySelector('#next-btn-1');
                        if (nextBtn) nextBtn.classList.remove('hidden');
                    });
                }
                break;

            case 2: // Memories
                // Inject Images from Source Divs
                ['1', '2', '3'].forEach(id => {
                    const source = template.querySelector(`#source-image-${id}`);
                    const img = content.querySelector(`#memory-img-${id}`);
                    if (source && img) {
                        const url = source.innerText.trim();
                        if (url) img.src = url;
                    }
                });
                break;

            case 3: // Letter
                const text3Element = template.querySelector('#source-text-3');
                if (text3Element) {
                    const text3 = text3Element.innerText;
                    typeWriter(text3, content.querySelector("#type-text-3"), () => {
                        const nextBtn = content.querySelector('#next-btn-3');
                        const downloadBtn = content.querySelector('#download-btn-3');
                        if (nextBtn) nextBtn.classList.remove('hidden');
                        if (downloadBtn) downloadBtn.classList.remove('hidden');
                    });
                }
                break;

            case 4: // Waiting
                const text4Element = template.querySelector('#source-text-4');
                if (text4Element) {
                    const text4 = text4Element.innerText;
                    typeWriter(text4, content.querySelector("#type-text-4"), () => {
                        const nextBtn = content.querySelector('#next-btn-4');
                        if (nextBtn) nextBtn.classList.remove('hidden');
                    });
                }
                break;

            case 5: // Proposal (Video)
                renderProposalButtons(); // Prepare buttons but keep hidden
                const video = content.querySelector('#proposal-video');
                const card = content.querySelector('#proposal-card');

                // Inject Text from Source Divs
                const titleSource = template.querySelector('#source-text-5-title');
                const questionSource = template.querySelector('#source-text-5-question');

                if (titleSource) {
                    content.querySelector('#final-proposal-title').innerText = titleSource.innerText.trim();
                }
                if (questionSource) {
                    content.querySelector('#final-proposal-question').innerText = questionSource.innerText.trim();
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

    } catch (error) {
        console.error("Render Scene Error:", error);
        content.innerHTML = `<div class="text-white p-10 text-center">
            <p class="text-2xl mb-4">Oops! Something went wrong. 💫</p>
            <p class="text-sm opacity-70">${error.message}</p>
            <button onclick="location.reload()" class="mt-6 px-4 py-2 bg-white/20 rounded-full">Try Again</button>
        </div>`;
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderProposalButtons() {
    const container = document.getElementById('proposal-buttons');
    if (!container) return;

    // Helper to get text from source divs
    const getTxt = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? el.innerText.trim() : fallback;
    };

    const yesText = getTxt('source-text-5-yes', 'YES, I Will! 💖');
    const noBase = getTxt('source-text-5-no', 'No...');
    const waNumber = getTxt('source-text-5-whatsapp', '918220945226');
    const question = getTxt('source-text-5-question', 'My heart has already chosen you—will you choose me for always🌙?');

    let noBtnText = noBase;
    if (noCount === 1) noBtnText = getTxt('source-text-5-no-hover-1', "Wait, really? 🥺");
    if (noCount === 2) noBtnText = getTxt('source-text-5-no-hover-2', "Please don't... 😢");
    if (noCount === 3) noBtnText = getTxt('source-text-5-no-hover-3', "Breaks my heart... 💔");

    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent('I Love You! 💖 ' + question)}`;

    let html = `
        <button onclick="window.location.href='${waLink}'" class="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xl rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-rose-500/50 flex items-center justify-center gap-2">
            ${yesText}
        </button>
    `;

    if (noCount < 4) {
        html += `
            <button onclick="handleNo()" class="w-full py-3 bg-white/10 text-slate-300 rounded-xl text-sm hover:bg-white/20 transition-all border border-white/10">
                ${noBtnText}
            </button>
        `;
    } else {
        const finalNo = getTxt('source-text-5-no-final', "Okay, I'm not letting you say no anymore! 😘");
        html += `
            <div class="text-rose-200 text-sm font-cute animate-pulse bg-white/10 p-2 rounded-lg text-center">
                ${finalNo}
            </div>
        `;
    }
    container.innerHTML = html;
}

// --- Initialization ---

if (document.readyState === 'loading') {
    window.addEventListener('load', init);
} else {
    init();
}
