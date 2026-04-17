const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeBtn = document.querySelector(".close");

// 🔥 GOOGLE SHEET URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwMXQu7vCm02ooADnTAChEZS_OgZ-xssadrhCtXE4JoPoywSIzd2hVndHG1dXI3UcHsDg/exec";

// buka modal
function openModal(content) {
    if (!modal || !modalBody) return;

    modal.classList.remove("hidden");
    modalBody.innerHTML = content;

    initDynamicContent();
}

// close modal
if (closeBtn) {
    closeBtn.onclick = () => modal.classList.add("hidden");
}

window.onclick = (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
};

// =======================
// LOAD PAGE
// =======================
function loadPage(page) {
    fetch(`pages/${page}.html`)
        .then(res => {
            if (!res.ok) throw new Error("File tidak ditemukan");
            return res.text();
        })
        .then(html => {
            openModal(html);
        })
        .catch(err => {
            openModal("<p>Gagal memuat konten</p>");
            console.error(err);
        });
}

// =======================
// INIT DYNAMIC CONTENT
// =======================
function initDynamicContent() {

    // ===================
    // GALLERY LIGHTBOX
    // ===================
    const galleryItems = document.querySelectorAll(".gallery-item");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    if (galleryItems.length && lightbox && lightboxImg) {
        galleryItems.forEach(item => {
            item.onclick = () => {
                lightboxImg.src = item.src;
                lightbox.classList.remove("hidden");
            };
        });

        lightbox.onclick = () => {
            lightbox.classList.add("hidden");
        };
    }

    // ===================
    // RSVP FORM
    // ===================
    const form = document.getElementById("rsvpForm");

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector("button");

            const data = {
                nama: document.getElementById("nama").value,
                kehadiran: document.getElementById("kehadiran").value,
                jumlah: document.getElementById("jumlah").value,
                pesan: document.getElementById("pesan").value
            };

            try {
                submitBtn.innerText = "Mengirim...";
                submitBtn.disabled = true;

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify(data)
                });

                form.reset();

                const success = document.getElementById("rsvpSuccess");
                if (success) success.classList.remove("hidden");

                submitBtn.innerText = "Terkirim ✓";

                loadRSVPData();

            } catch (err) {
                alert("Gagal kirim data 😢");
                console.error(err);

                submitBtn.innerText = "Kirim";
                submitBtn.disabled = false;
            }
        };
    }

    loadRSVPData();
}

// =======================
// LOAD RSVP LIST
// =======================
function loadRSVPData() {
    const rsvpContainer = document.getElementById("rsvpData");
    if (!rsvpContainer) return;

    fetch(GOOGLE_SCRIPT_URL)
        .then(res => res.json())
        .then(data => {

            rsvpContainer.innerHTML = "";

            data.reverse().forEach(item => {
                const div = document.createElement("div");
                div.className = "rsvp-item";

                div.innerHTML = `
                    <strong>${item.nama}</strong>
                    <p>${item.pesan || "-"}</p>
                    <small>${item.kehadiran} • ${item.jumlah || 1} orang</small>
                `;

                rsvpContainer.appendChild(div);
            });

        })
        .catch(err => console.error(err));
}

// =======================
// 🔥 LIVE COMMENT FLOATING
// =======================
let liveCommentsData = [];

function startLiveComments() {
    const container = document.getElementById("liveComments");
    if (!container) return;

    fetch(GOOGLE_SCRIPT_URL)
        .then(res => res.json())
        .then(data => {

            liveCommentsData = data;

            setInterval(() => {
                if (!liveCommentsData.length) return;

                const random = liveCommentsData[Math.floor(Math.random() * liveCommentsData.length)];
                createCommentBubble(container, random);

            }, 1500);

        })
        .catch(err => console.error(err));
}

function createCommentBubble(container, item) {

    const bubble = document.createElement("div");
    bubble.className = "comment-bubble";

    bubble.innerText = `${item.nama}: ${item.pesan || ""}`;

    const randomBottom = Math.random() * 80;
    bubble.style.bottom = `${randomBottom}px`;

    const duration = 10 + Math.random() * 6;
    bubble.style.animationDuration = `${duration}s`;

    container.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
    }, duration * 1000);
}

// =======================
// HOTSPOT CLICK
// =======================
const hotspots = document.querySelectorAll(".hotspot");

hotspots.forEach(h => {
    h.onclick = () => {
        if (isTutorialActive) return; // Jangan buka modal saat tutorial

        const type = h.dataset.type;

        switch (type) {
            case "about":
                loadPage("about");
                return;

            case "gallery":
                loadPage("gallery");
                return;

            case "dresscode":
                loadPage("dresscode");
                return;

            case "gift":
                loadPage("gift");
                return;

            case "rsvp":
                loadPage("rsvp");
                return;

            case "bride":
                loadPage("bride");
                return;

            case "place":
                loadPage("place");
                return;
        }

        openModal("");
    };
});

// =======================
// GLOW TOGGLE
// =======================
const lightBtn = document.getElementById("toggleLight");
const glowImages = document.querySelectorAll(".glow-img");
const overlay = document.getElementById("overlay");

let isLightOn = false;

if (lightBtn) {
    lightBtn.onclick = () => {
        isLightOn = !isLightOn;

        glowImages.forEach(g => {
            g.classList.toggle("glow-on", isLightOn);
        });

        overlay.classList.toggle("active", isLightOn);
    };
}

// =======================
// 🎓 TUTORIAL ONBOARDING
// =======================
let isTutorialActive = false;
let tutorialStep = 0;

const tutorialSteps = [
    {
        glowClass: 'gallery-glow',
        emoji: '📸',
        title: 'Gallery Foto',
        text: 'Ketuk area ini untuk melihat gallery foto kami',
        tipTop: '53%', tipLeft: '48%'
    },
    {
        glowClass: 'about-glow',
        emoji: '💑',
        title: 'About Us',
        text: 'Ketuk area ini untuk mengenal perjalanan kisah kami berdua',
        tipTop: '28%', tipLeft: '3%'
    },
    {
        glowClass: 'bride-glow',
        emoji: '👰',
        title: 'Mempelai',
        text: 'Ketuk area ini untuk melihat informasi mempelai',
        tipTop: '4%', tipLeft: '52%'
    },
    {
        glowClass: 'place-glow',
        emoji: '📍',
        title: 'Lokasi Acara',
        text: 'Ketuk area ini untuk melihat lokasi pernikahan kami',
        tipTop: '46%', tipLeft: '2%'
    },
    {
        glowClass: 'dresscode-glow',
        emoji: '👗',
        title: 'Dresscode',
        text: 'Ketuk area ini untuk melihat dresscode acara',
        tipTop: '69%', tipLeft: '52%'
    },
    {
        glowClass: 'gift-glow',
        emoji: '🎁',
        title: 'Wedding Gift',
        text: 'Ketuk area ini jika kamu ingin memberikan hadiah',
        tipTop: '57%', tipLeft: '3%'
    },
    {
        glowClass: 'rsvp-glow',
        emoji: '✉️',
        title: 'RSVP',
        text: 'Ketuk area ini untuk konfirmasi kehadiranmu',
        tipTop: '68%', tipLeft: '50%'
    },
];

function startTutorial() {
    isTutorialActive = true;
    tutorialStep = 0;

    const tutContainer = document.querySelector('.container');

    // Dark overlay ON
    overlay.classList.add('active');

    // Tap hint — struktur baru
    const tapHint = document.createElement('div');
    tapHint.id = 'tutorialTapHint';
    tapHint.className = 'tutorial-tap-hint';
    tapHint.innerHTML = `
        <span class="tutorial-tap-hint__icon">👆</span>
        <span class="tutorial-tap-hint__text">Ketuk di mana saja untuk lanjut</span>
    `;
    tutContainer.appendChild(tapHint);

    // Skip button
    const skipBtn = document.createElement('button');
    skipBtn.id = 'tutorialSkip';
    skipBtn.className = 'tutorial-skip-btn';
    skipBtn.textContent = 'Lewati';
    skipBtn.onclick = (e) => {
        e.stopPropagation();
        endTutorial();
    };
    tutContainer.appendChild(skipBtn);

    showTutorialStep(0);
}

function showTutorialStep(index) {
    const step = tutorialSteps[index];
    const tutContainer = document.querySelector('.container');

    // Matiin semua glow
    glowImages.forEach(g => g.classList.remove('glow-on'));

    // Nyalain glow yang aktif
    const activeGlow = document.querySelector('.' + step.glowClass);
    if (activeGlow) activeGlow.classList.add('glow-on');

    // Hapus tooltip lama, buat baru (agar animasi selalu re-trigger)
    const old = document.getElementById('tutorialTooltip');
    if (old) old.remove();

    const tooltip = document.createElement('div');
    tooltip.id = 'tutorialTooltip';
    tooltip.className = 'tutorial-tooltip';
    tooltip.style.top = step.tipTop;
    tooltip.style.left = step.tipLeft;

    // Generate progress dots
    const dots = tutorialSteps.map((_, i) => {
        let cls = 'tutorial-dot';
        if (i === index) cls += ' tutorial-dot--active';
        else if (i < index) cls += ' tutorial-dot--done';
        return `<span class="${cls}"></span>`;
    }).join('');

    tooltip.innerHTML = `
        <div class="tutorial-tooltip__accent"></div>
        <div class="tutorial-tooltip__body">
            <div class="tutorial-tooltip__dots">${dots}</div>
            <span class="tutorial-tooltip__emoji">${step.emoji}</span>
            <div class="tutorial-tooltip__title">${step.title}</div>
            <div class="tutorial-tooltip__divider">
                <span class="tutorial-tooltip__divider-icon">✦</span>
            </div>
            <div class="tutorial-tooltip__text">${step.text}</div>
        </div>
    `;
    tutContainer.appendChild(tooltip);
}

function advanceTutorial() {
    if (!isTutorialActive) return;
    tutorialStep++;
    if (tutorialStep >= tutorialSteps.length) {
        endTutorial();
    } else {
        showTutorialStep(tutorialStep);
    }
}

function endTutorial() {
    isTutorialActive = false;

    // Matiin semua glow
    glowImages.forEach(g => g.classList.remove('glow-on'));

    // Matiin overlay
    overlay.classList.remove('active');

    // Hapus semua elemen tutorial
    ['tutorialTooltip', 'tutorialTapHint', 'tutorialSkip'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

// =======================
// COPY REKENING
// =======================
function copyRekening(id) {
    const el = document.getElementById(id);
    if (!el) return;

    navigator.clipboard.writeText(el.innerText)
        .then(() => alert("Nomor rekening berhasil disalin!"));
}

// =======================
// LOADING + MUSIC
// =======================
const openBtn = document.getElementById("openInvitation");
const loadingScreen = document.getElementById("loadingScreen");
const bgMusic = document.getElementById("bgMusic");
const musicIcon = document.getElementById("musicIcon");

if (openBtn && loadingScreen) {
    openBtn.onclick = () => {

        if (bgMusic && musicIcon) {
            bgMusic.volume = 0.3;
            bgMusic.play().then(() => {
                musicIcon.src = "assets/ui/music-button.png";
            }).catch(() => { });
        }

        startLiveComments();

        loadingScreen.classList.add("hide-loading");

        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 500);

        // Mulai tutorial setelah loading menghilang
        setTimeout(() => startTutorial(), 700);
    };
}

// =======================
// MUSIC TOGGLE
// =======================
const musicToggleBtn = document.getElementById("musicToggle");

if (musicToggleBtn && bgMusic && musicIcon) {
    musicToggleBtn.onclick = () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicIcon.src = "assets/ui/music-button.png";
            });
        } else {
            bgMusic.pause();
            musicIcon.src = "assets/ui/silent-button.png";
        }
    };
}

// =======================
// 💬 HINT SYSTEM
// =======================
const hintBtn = document.getElementById("hintBtn");

if (hintBtn) {
    const hintImg = document.createElement("img");
    hintImg.className = "hint-image-bubble";
    hintImg.src = "assets/ui/hint-lampu.png";

    const container = document.querySelector(".container");
    container.appendChild(hintImg);

    let step = 0;

    document.addEventListener("click", () => {
        if (step === 1) {
            step = 2;
            hintImg.src = "assets/ui/hint-music.png";
            hintImg.style.left = "18px";
        } else if (step === 2) {
            step = 0;
            hintImg.classList.remove("show");
        }
    });

    hintBtn.onclick = (e) => {
        e.stopPropagation();

        if (step === 0) {
            step = 1;
            hintImg.src = "assets/ui/hint-lampu.png";
            hintImg.style.left = "4px";
            hintImg.classList.add("show");
        } else {
            step = 0;
            hintImg.classList.remove("show");
        }
    };
}


// =======================
// 💧 RIPPLE TOUCH EFFECT + 🔊 CLICK SOUND
// =======================
const clickSfx = new Audio("assets/audio/click.mp3");
clickSfx.preload = "auto";
clickSfx.volume = 0.85;

document.addEventListener("click", (e) => {
    // --- ripple ---
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    ripple.style.left = e.clientX + "px";
    ripple.style.top  = e.clientY + "px";
    document.body.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());

    // --- click sound ---
    clickSfx.currentTime = 0;
    clickSfx.play().catch(() => {});

    // --- advance tutorial ---
    advanceTutorial();
});
