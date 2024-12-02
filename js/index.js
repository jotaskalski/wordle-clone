import { dicionario } from './dicionario.js';

// Função para remover acentos das palavras
function removerAcentos(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const dictionary = dicionario;
const situacao = {
  secret: dictionary[Math.floor(Math.random() * dictionary.length)],
  grid: Array(6)
    .fill()
    .map(() => Array(5).fill('')),
  linhaAtual: 0,
  colunaAtual: 0,
};

//Adicionar um objeto para armazenar o estado das teclas do teclado virtual
const situacaoTecla = {
  correct: new Set(),  // Teclas que estão na posição correta
  wrong: new Set(),    // Teclas que estão na palavra, mas na posição errada
  empty: new Set(),    // Teclas que não estão na palavra
};

//Função para atualizar as teclas do teclado virtual com base nos resultados do palpite
function updateSituacaoTeclado(palpite) {
  for (let i = 0; i < 5; i++) {
    const letra = palpite[i];

    // Se a letra estiver na posição correta
    if (letra === situacao.secret[i]) {
      situacaoTecla.correct.add(letra);
    } else if (situacao.secret.includes(letra)) {
      situacaoTecla.wrong.add(letra);
    } else {
      situacaoTecla.empty.add(letra);
    }
  }

  // Atualizar o teclado com as novas cores
  const teclas = document.querySelectorAll('.key');
  teclas.forEach((tecla) => {
    const letra = tecla.textContent;
    if (situacaoTecla.correct.has(letra)) {
      tecla.classList.add('right');
      tecla.classList.remove('wrong', 'empty');
    } else if (situacaoTecla.wrong.has(letra)) {
      tecla.classList.add('wrong');
      tecla.classList.remove('right', 'empty');
    } else if (situacaoTecla.empty.has(letra)) {
      tecla.classList.add('empty');
      tecla.classList.remove('right', 'wrong');
    }
  });
}

// Função para desenhar a grid do jogo
function gerarGrid(container) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      gerarBox(grid, i, j);
    }
  }

  container.appendChild(grid);
}

// Função para atualizar a grid do jogo
function updateGrid() {
  for (let i = 0; i < situacao.grid.length; i++) {
    for (let j = 0; j < situacao.grid[i].length; j++) {
      const box = document.getElementById(`box${i}${j}`);
      box.textContent = situacao.grid[i][j];
    }
  }
}

// Função para desenhar cada caixa da grid
function gerarBox(container, linha, coluna, letra = '') {
  const box = document.createElement('div');
  box.className = 'box';
  box.textContent = letra;
  box.id = `box${linha}${coluna}`;

  container.appendChild(box);
  return box;
}

// Função para registrar os eventos do teclado físico
function registrarEventosTeclado() {
  document.body.onkeydown = (e) => {
    const tecla = e.key;
    if (tecla === 'Enter') {
      if (situacao.colunaAtual === 5) {
        const palavra = getPalavraAtual();
        if (ehPalavraValida(palavra)) {
          revelarPalavra(palavra);
          situacao.linhaAtual++;
          situacao.colunaAtual = 0;
          updateSituacaoTeclado(palavra);  // Atualiza o estado das teclas do teclado virtual <<< Alteração
        } else {
          alert('Palavra inválida.');
        }
      }
    }
    if (tecla === 'Backspace') {
      removeLetra();
    }
    if (ehLetra(tecla)) {
      addLetra(tecla);
    }

    updateGrid();
  };
}

function getPalavraAtual() {
  return situacao.grid[situacao.linhaAtual].reduce((prev, curr) => prev + curr);
}

function ehPalavraValida(palavra) {
  const palavraSemAcentos = removerAcentos(palavra.toLowerCase());
  return dictionary.some(
    (d) => removerAcentos(d.toLowerCase()) === palavraSemAcentos
  );
}

function getNumRepeticoesNaPalavra(palavra, letra) {
  let result = 0;
  for (let i = 0; i < palavra.length; i++) {
    if (palavra[i] === letra) {
      result++;
    }
  }
  return result;
}

function getPosicaoRepeticao(palavra, letra, posicao) {
  let result = 0;
  for (let i = 0; i <= posicao; i++) {
    if (palavra[i] === letra) {
      result++;
    }
  }
  return result;
}

//Revela as palavras para reaplicar animações
function revelarPalavra(palpite) {
  const linha = situacao.linhaAtual;
  const animation_duration = 500; // ms

  for (let i = 0; i < 5; i++) {
    const box = document.getElementById(`box${linha}${i}`);
    const letra = box.textContent;
    const numRepeticoesPalavraSecreta = getNumRepeticoesNaPalavra(situacao.secret, letra);
    const numRepeticoesPalpite = getNumRepeticoesNaPalavra(palpite, letra);
    const posicaoLetra = getPosicaoRepeticao(palpite, letra, i);

    // Definir o tempo de atraso para cada quadrado
    const delay = i * animation_duration;

    // Mudar a cor e aplicar animação com o atraso
    setTimeout(() => {
      if (
        numRepeticoesPalpite > numRepeticoesPalavraSecreta &&
        posicaoLetra > numRepeticoesPalavraSecreta
      ) {
        box.classList.add('empty');
      } else {
        if (letra === situacao.secret[i]) {
          box.classList.add('right');
        } else if (situacao.secret.includes(letra)) {
          box.classList.add('wrong');
        } else {
          box.classList.add('empty');
        }
      }

      // Adicionar animação de flip após definir a cor
      box.classList.add('animated');
    }, delay);
  }

  // Checar vitória/derrota após todas as animações
  const total_duration = 5 * animation_duration;
  setTimeout(() => {
    const ganhou = situacao.secret === palpite;
    const perdeu = situacao.linhaAtual === 6;

    if (ganhou) {
      alert('Parabéns, você ganhou!!');
    } else if (perdeu) {
      alert(`Poxa, você perdeu... A palavra era: ${situacao.secret}.`);
    }
    // Atualiza o botão de reinício após o fim do jogo
    updateRestartButton();
  }, total_duration);
}



// Função para desenhar o teclado virtual
function gerarTeclado() {
  const teclado = document.getElementById('keyboard');
  const linhas = [
    'qwertyuiop', 
    'asdfghjkl', 
    'Enterzxcvbnm<', 
  ];

  linhas.forEach((row) => {
    const linhaDiv = document.createElement('div');
    linhaDiv.classList.add('keyboard-row');

    for (let i = 0; i < row.length; i++) {
      let char = row[i];

      // Tratamento especial para "Enter"
      if (char === 'E' && row.slice(i, i + 5) === 'Enter') {
  const key = document.createElement('button');
  key.textContent = 'Enter';
  key.classList.add('key', 'special');
  key.onclick = () => handleVirtualKey('Enter');
  linhaDiv.appendChild(key);
  i += 4;
  continue;
}

if (char === '<') {
  const key = document.createElement('button');
  key.textContent = '⌫';
  key.classList.add('key', 'special');
  key.onclick = () => handleVirtualKey('Backspace');
  linhaDiv.appendChild(key);
  continue;
}


      // Letras padrão
      const key = document.createElement('button');
      key.textContent = char;
      key.classList.add('key');
      key.onclick = () => handleVirtualKey(char);
      linhaDiv.appendChild(key);
    }

    teclado.appendChild(linhaDiv);
  });
}

// Função para lidar com o clique nas teclas do teclado virtual
function handleVirtualKey(key) {
  if (key === 'Enter') {
    if (situacao.colunaAtual === 5) {
      const word = getPalavraAtual();
      if (ehPalavraValida(word)) {
        revelarPalavra(word);
        situacao.linhaAtual++;
        situacao.colunaAtual = 0;
        updateSituacaoTeclado(word);  // Atualiza o estado das teclas do teclado virtual <<< Alteração
      } else {
        alert('Palavra inválida.');
      }
    }
  } else if (key === 'Backspace') {
    removeLetra();
  } else {
    addLetra(key);
  }

  updateGrid();
}

// Função para adicionar uma letra na grid
function addLetra(letter) {
  if (situacao.colunaAtual < 5) {
    situacao.grid[situacao.linhaAtual][situacao.colunaAtual] = letter;
    situacao.colunaAtual++;
  }
}

// Função para remover a última letra
function removeLetra() {
  if (situacao.colunaAtual > 0) {
    situacao.colunaAtual--;
    situacao.grid[situacao.linhaAtual][situacao.colunaAtual] = '';
  }
}

function ehLetra(key) {
  return key.length === 1 && key.match(/[a-z]/i);
}

// Função para reiniciar o jogo
function restartGame() {
  // Limpar o grid de letras e animações
  const boxes = document.querySelectorAll('.box');
  boxes.forEach((box) => {
    box.classList.remove('right', 'wrong', 'empty', 'animated');
    box.textContent = ''; 
  });

  // Resetar o estado do jogo
  situacao.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
  situacao.grid = Array(6)
    .fill()
    .map(() => Array(5).fill(''));
  situacao.linhaAtual = 0;
  situacao.colunaAtual = 0;
  
  // Limpar o estado das teclas no teclado virtual
  situacaoTecla.correct.clear();
  situacaoTecla.wrong.clear();
  situacaoTecla.empty.clear();

  // Limpar o estado visual do teclado virtual
  const keys = document.querySelectorAll('.key');
  keys.forEach((key) => {
    key.classList.remove('right', 'wrong', 'empty');
  });

  // Atualizar o grid
  updateGrid();
  // Atualizar o texto do botão de reinício
  updateRestartButton();
}
// Função para atualizar o texto do botão de reinício
function updateRestartButton() {
  const restartButton = document.getElementById('restartButton');
  const perdeu = situacao.linhaAtual === 6 || situacao.secret === getPalavraAtual();

  // Verifica se o jogo acabou e altera o texto do botão
  if (perdeu) {
    restartButton.textContent = 'Jogar novamente';
  } else {
    restartButton.textContent = 'Reiniciar jogo';
  }
}




// Evento do botão de reinício
document.getElementById('restartButton').addEventListener('click', () => {
  restartGame();
});

// Função para iniciar o jogo
function startGame() {
  const gameContainer = document.getElementById('game');
  gerarGrid(gameContainer);
  gerarTeclado();
  registrarEventosTeclado();
}

startGame();


