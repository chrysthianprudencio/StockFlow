const words = [
    { text: "rápido", class: "word-red" },
    { text: "fácil", class: "word-blue" },
    { text: "eficiente", class: "word-green" }
];
let currentWordIndex = 0;
const dynamicWordElement = document.getElementById("dynamic-word");

function changeWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    dynamicWordElement.classList.add("fade-out");
    setTimeout(() => {
        dynamicWordElement.textContent = words[currentWordIndex].text;
        dynamicWordElement.className = "";
        dynamicWordElement.classList.add(words[currentWordIndex].class);
        dynamicWordElement.classList.remove("fade-out");
    }, 500); // Tempo de transição para o fade-out
}

setInterval(changeWord, 1500); // Troca a palavra a cada 3 segundos

// Inicializa o texto com a primeira palavra
dynamicWordElement.textContent = words[currentWordIndex].text;
dynamicWordElement.classList.add(words[currentWordIndex].class);
