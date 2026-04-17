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
});
