// FUNÇÃO PARA ATIVAR A PRÉVIA DO VÍDEO

function ativarPrevias() {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const video = card.querySelector(".preview");
        const thumb = card.querySelector(".thumb");

        if (!video || !thumb) return; // evita erro

        let startTimer;
        let stopTimer;

        card.onmouseenter = () => {

            startTimer = setTimeout(() => {

                thumb.style.opacity = "0";
                video.style.opacity = "1";

                video.currentTime = 0;
                video.play();

                stopTimer = setTimeout(() => {
                    video.pause();
                    video.currentTime = 0;
                    video.style.opacity = "0";
                    thumb.style.opacity = "1";
                }, previewTime);

            }, delay);
        };

        card.onmouseleave = () => {
            clearTimeout(startTimer);
            clearTimeout(stopTimer);

            video.pause();
            video.currentTime = 0;

            video.style.opacity = "0";
            thumb.style.opacity = "1";
        };
    });
}

// CONFIGURAÇÃO INICIAL

let delay = 800;
let previewTime = 30000;

ativarPrevias(); // ativa prévias nos cards originais


//  CARROSSEL AUTOMÁTICO + INFINITO

const wrapper = document.querySelector(".carrossel-wrapper");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let cards2 = document.querySelectorAll(".card");
let index = 0;
let cardLargura = cards2[0].offsetWidth + 20;

// DUPLICAR PARA LOOP INFINITO
wrapper.innerHTML += wrapper.innerHTML;

// RECARREGAR LISTA DE CARDS DEPOIS DA DUPLICAÇÃO
cards2 = document.querySelectorAll(".card");

// MUITO IMPORTANTE → ATIVAR PRÉVIA NOS CARDS DUPLICADOS
ativarPrevias();


// MOVIMENTOS

function moveNext() {
    index++;
    wrapper.style.transition = "0.5s ease";
    wrapper.style.transform = `translateX(${-index * cardLargura}px)`;

    if (index >= cards2.length / 2) {
        setTimeout(() => {
            wrapper.style.transition = "none";
            index = 0;
            wrapper.style.transform = `translateX(0px)`;
        }, 510);
    }
}

function movePrev() {
    if (index === 0) {
        wrapper.style.transition = "none";
        index = cards2.length / 2;
        wrapper.style.transform = `translateX(${-index * cardLargura}px)`;
    }
    setTimeout(() => {
        index--;
        wrapper.style.transition = "0.5s ease";
        wrapper.style.transform = `translateX(${-index * cardLargura}px)`;
    }, 20);
}

nextBtn.addEventListener("click", moveNext);
prevBtn.addEventListener("click", movePrev);



// AUTO PLAY

let autoPlay = setInterval(moveNext, 2500);

wrapper.addEventListener("mouseenter", () => clearInterval(autoPlay));
wrapper.addEventListener("mouseleave", () => {
    autoPlay = setInterval(moveNext, 2500);
});

window.addEventListener("resize", () => {
    cardLargura = cards2[0].offsetWidth + 20;
});


const hamburger = document.getElementById("hamburger");
const menuList = document.querySelector(".menuList");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    menuList.classList.toggle("open");
});