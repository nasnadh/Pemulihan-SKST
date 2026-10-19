const questions = [
  {
    type: 'Pilih jawapan',
    prompt: 'Pilih perkataan yang sepadan dengan gambar.',
    visual: '🐟',
    choices: ['ikan', 'itik', 'kuda', 'arnab'],
    answer: 'ikan',
    explanation: 'Gambar itu menunjukkan seekor ikan.'
  },
  {
    type: 'Lengkapkan ayat',
    prompt: 'Lengkapkan perkataan ini: baju ialah pakaian yang kita ___ .',
    input: true,
    answer: 'pakai',
    explanation: 'Kita memakai baju.'
  },
  {
    type: 'Susun perkataan',
    prompt: 'Susun perkataan untuk membina ayat yang betul.',
    words: ['sekolah', 'ke', 'pergi', 'Mira', '.'],
    answer: ['Mira', 'pergi', 'ke', 'sekolah', '.'],
    explanation: 'Ayat yang betul ialah “Mira pergi ke sekolah.”'
  },
  {
    type: 'Betul atau salah',
    prompt: 'Perkataan “buku” mempunyai dua suku kata.',
    choices: ['Betul', 'Salah'],
    answer: 'Betul',
    explanation: 'Buku disebut dalam dua suku kata: bu-ku.'
  },
  {
    type: 'Padankan',
    prompt: 'Padankan setiap perkataan dengan kumpulan yang betul.',
    matches: [
      { word: 'kucing', answer: 'Haiwan' },
      { word: 'membaca', answer: 'Perbuatan' },
      { word: 'merah', answer: 'Warna' }
    ],
    options: ['Haiwan', 'Perbuatan', 'Warna'],
    explanation: 'Kucing ialah haiwan, membaca ialah perbuatan dan merah ialah warna.'
  },
  {
    type: 'Tanda baca',
    prompt: 'Pilih tanda baca yang sesuai: “Wah, cantiknya bunga___”',
    choices: ['!', '.', '?'],
    answer: '!',
    explanation: 'Tanda seru digunakan untuk menunjukkan rasa kagum.'
  },
  {
    type: 'Pilih suku kata',
    prompt: 'Pilih suku kata yang membentuk perkataan “kelapa”.',
    tiles: ['ke', 'la', 'ma', 'pa', 'ba'],
    answer: ['ke', 'la', 'pa'],
    explanation: 'Kelapa terdiri daripada suku kata ke-la-pa.'
  },
  {
    type: 'Pilih semua jawapan',
    prompt: 'Pilih semua perkataan yang berakhir dengan “-an”.',
    choices: ['makanan', 'taman', 'buku', 'jalan'],
    answer: ['makanan', 'taman', 'jalan'],
    explanation: 'Makanan, taman dan jalan semuanya berakhir dengan “-an”.'
  },
  {
    type: 'Kenali kata kerja',
    prompt: 'Perkataan “menyanyi” ialah kata ...',
    choices: ['nama', 'kerja', 'adjektif'],
    answer: 'kerja',
    explanation: 'Menyanyi ialah perbuatan, jadi perkataan ini ialah kata kerja.'
  },
  {
    type: 'Teka-teki',
    prompt: 'Saya digunakan untuk menulis. Badan saya daripada kayu dan mata saya berwarna hitam. Apakah saya?',
    visual: '✏️',
    input: true,
    answer: 'pensel',
    explanation: 'Alat tulis yang mempunyai mata hitam dan badan kayu ialah pensel.'
  }
];

const screens = {
  welcome: document.querySelector('#welcome-screen'),
  game: document.querySelector('#game-screen'),
  result: document.querySelector('#result-screen')
};
const form = document.querySelector('#player-form');
const nameInput = document.querySelector('#student-name');
const classInput = document.querySelector('#student-class');
const dateInput = document.querySelector('#student-date');
const errorMessage = document.querySelector('#form-error');
const questionContent = document.querySelector('#question-content');
const answerButton = document.querySelector('#answer-button');
const nextButton = document.querySelector('#next-button');
const feedback = document.querySelector('#feedback');
const guideMessage = document.querySelector('#guide-message');
const progressTrack = document.querySelector('.progress-track');

let player = { name: '', className: '', date: '' };
let currentQuestion = 0;
let correctAnswers = 0;
let xp = 0;
let selectedChoice = '';
let orderedWords = [];
let hasAnswered = false;

dateInput.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) {
    errorMessage.hidden = false;
    return;
  }
  errorMessage.hidden = true;
  player = {
    name: nameInput.value.trim(),
    className: classInput.value,
    date: dateInput.value
  };
  if (!player.name || !player.className || !player.date) {
    errorMessage.hidden = false;
    return;
  }
  currentQuestion = 0;
  correctAnswers = 0;
  xp = 0;
  document.querySelector('#player-chip-name').textContent = player.name;
  showScreen('game');
  renderQuestion();
});

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.hidden = key !== name;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuestion() {
  const question = questions[currentQuestion];
  selectedChoice = '';
  orderedWords = [];
  hasAnswered = false;
  feedback.hidden = true;
  feedback.className = 'feedback';
  answerButton.hidden = false;
  answerButton.disabled = false;
  nextButton.hidden = true;

  document.querySelector('#question-number').textContent = `CABARAN ${String(currentQuestion + 1).padStart(2, '0')}`;
  document.querySelector('#question-type').textContent = question.type;
  document.querySelector('#question-prompt').textContent = question.prompt;
  document.querySelector('#progress-count').textContent = `${String(currentQuestion + 1).padStart(2, '0')} / 10`;
  document.querySelector('#progress-fill').style.width = `${(currentQuestion / questions.length) * 100}%`;
  progressTrack.setAttribute('aria-valuenow', String(currentQuestion));
  document.querySelector('#xp-count').textContent = `${xp} XP`;
  guideMessage.textContent = currentQuestion === 0
    ? 'Baca soalan dengan teliti. Anda pasti boleh!'
    : 'Teruskan usaha! Setiap jawapan membawa anda lebih dekat ke garisan penamat.';

  questionContent.replaceChildren();
  if (question.visual) {
    const visual = document.createElement('div');
    visual.className = 'visual-prompt';
    visual.setAttribute('aria-hidden', 'true');
    visual.textContent = question.visual;
    questionContent.append(visual);
  }
  if (question.choices) renderChoices(question);
  if (question.input) renderTextInput(question);
  if (question.words) renderWordOrder(question);
  if (question.matches) renderMatches(question);
  if (question.tiles) renderTiles(question);
}

function renderChoices(question) {
  const grid = document.createElement('div');
  grid.className = 'choice-grid';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Pilihan jawapan');
  question.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-button';
    button.textContent = choice;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (hasAnswered) return;
      if (Array.isArray(question.answer)) {
        button.classList.toggle('selected');
        button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
        return;
      }
      selectedChoice = choice;
      grid.querySelectorAll('.choice-button').forEach((item) => {
        const selected = item === button;
        item.classList.toggle('selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
    });
    grid.append(button);
  });
  questionContent.append(grid);
}

function renderTextInput(question) {
  const input = document.createElement('input');
  input.className = 'answer-input';
  input.type = 'text';
  input.id = 'written-answer';
  input.autocomplete = 'off';
  input.maxLength = 60;
  input.placeholder = 'Tulis jawapan anda di sini';
  input.setAttribute('aria-label', 'Jawapan anda');
  questionContent.append(input);
}

function renderWordOrder(question) {
  const answer = document.createElement('div');
  answer.className = 'answer-strip';
  answer.id = 'ordered-answer';
  answer.setAttribute('aria-label', 'Perkataan yang telah disusun');
  const bank = document.createElement('div');
  bank.className = 'word-bank';
  question.words.forEach((word, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'word-chip';
    button.textContent = word;
    button.dataset.index = String(index);
    button.addEventListener('click', () => {
      if (hasAnswered || button.disabled) return;
      orderedWords.push({ word, index });
      button.disabled = true;
      button.classList.add('selected');
      drawOrderedWords(answer);
    });
    bank.append(button);
  });
  questionContent.append(answer, bank);
}

function drawOrderedWords(container) {
  container.replaceChildren();
  orderedWords.forEach((item, position) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-chip';
    button.textContent = item.word;
    button.setAttribute('aria-label', `Buang ${item.word}`);
    button.addEventListener('click', () => {
      if (hasAnswered) return;
      orderedWords.splice(position, 1);
      const source = questionContent.querySelector(`.word-chip[data-index="${item.index}"]`);
      source.disabled = false;
      source.classList.remove('selected');
      drawOrderedWords(container);
    });
    container.append(button);
  });
}

function renderMatches(question) {
  const list = document.createElement('div');
  list.className = 'match-list';
  list.setAttribute('aria-label', 'Padanan perkataan');
  question.matches.forEach((item, index) => {
    const row = document.createElement('label');
    row.className = 'match-row';
    const word = document.createElement('span');
    word.className = 'match-word';
    word.textContent = item.word;
    const select = document.createElement('select');
    select.className = 'match-select';
    select.dataset.index = String(index);
    select.setAttribute('aria-label', `Padanan untuk ${item.word}`);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Pilih padanan';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.append(placeholder);
    question.options.forEach((option) => {
      const choice = document.createElement('option');
      choice.value = option;
      choice.textContent = option;
      select.append(choice);
    });
    row.append(word, select);
    list.append(row);
  });
  questionContent.append(list);
}

function renderTiles(question) {
  const grid = document.createElement('div');
  grid.className = 'tile-grid';
  question.tiles.forEach((tile, index) => {
    const label = document.createElement('label');
    label.className = 'tile-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = tile;
    input.name = 'syllable';
    input.setAttribute('aria-label', `Suku kata ${tile}`);
    const text = document.createElement('span');
    text.textContent = tile;
    label.append(input, text);
    grid.append(label);
  });
  questionContent.append(grid);
}

function getResponse(question) {
  if (question.matches) {
    return [...questionContent.querySelectorAll('.match-select')].map((select) => select.value);
  }
  if (question.tiles) {
    return [...questionContent.querySelectorAll('input[name="syllable"]:checked')].map((input) => input.value);
  }
  if (question.words) return orderedWords.map((item) => item.word);
  if (question.input) return document.querySelector('#written-answer').value.trim();
  if (question.answer instanceof Array) {
    return [...questionContent.querySelectorAll('.choice-button.selected')].map((button) => button.textContent);
  }
  return selectedChoice;
}

function normalize(value) {
  return String(value).toLocaleLowerCase('ms').replace(/[.!?]/g, '').replace(/\s+/g, ' ').trim();
}

function isCorrect(response, answer, ordered = false) {
  if (Array.isArray(answer)) {
    if (!Array.isArray(response) || response.length !== answer.length) return false;
    const normalizedResponse = response.map(normalize);
    const normalizedAnswer = answer.map(normalize);
    if (!ordered) {
      normalizedResponse.sort();
      normalizedAnswer.sort();
    }
    return normalizedResponse.every((value, index) => value === normalizedAnswer[index]);
  }
  return normalize(response) === normalize(answer);
}

function formatAnswer(answer) {
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
}

answerButton.addEventListener('click', () => {
  if (hasAnswered) return;
  const question = questions[currentQuestion];
  const response = getResponse(question);
  const unanswered = Array.isArray(response) ? response.length === 0 || response.some((item) => !item) : !response;
  if (unanswered) {
    feedback.hidden = false;
    feedback.className = 'feedback incorrect';
    feedback.innerHTML = '<strong>Pilih atau tulis jawapan dahulu.</strong> Anda boleh cuba, pengembara!';
    return;
  }
  hasAnswered = true;
  const correct = question.matches
    ? response.every((answer, index) => normalize(answer) === normalize(question.matches[index].answer))
    : isCorrect(response, question.answer, Boolean(question.words));
  if (correct) {
    correctAnswers += 1;
    xp += 10;
  }
  answerButton.hidden = true;
  nextButton.hidden = false;
  feedback.hidden = false;
  feedback.className = `feedback ${correct ? 'correct' : 'incorrect'}`;
  const title = correct ? 'Tepat sekali! +10 XP' : 'Belum tepat, teruskan usaha!';
  const correctAnswer = question.matches
    ? question.matches.map((item) => `${item.word} → ${item.answer}`).join(', ')
    : formatAnswer(question.answer);
  const detail = correct ? question.explanation : `Jawapan yang betul: ${correctAnswer}. ${question.explanation}`;
  feedback.replaceChildren();
  const strong = document.createElement('strong');
  strong.textContent = title;
  const message = document.createElement('span');
  message.textContent = detail;
  feedback.append(strong, message);
  document.querySelector('#xp-count').textContent = `${xp} XP`;
  document.querySelector('#progress-fill').style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  progressTrack.setAttribute('aria-valuenow', String(currentQuestion + 1));
  document.querySelector('#question-hint').textContent = correct ? 'Satu langkah lagi menuju kejayaan!' : 'Belajar daripada jawapan dan mara ke cabaran seterusnya.';
});

nextButton.addEventListener('click', () => {
  currentQuestion += 1;
  if (currentQuestion === questions.length) {
    showResults();
    return;
  }
  renderQuestion();
  document.querySelector('#question-prompt').focus?.();
});

function formatDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

function showResults() {
  const percentage = Math.round((correctAnswers / questions.length) * 100);
  document.querySelector('#score-percentage').textContent = String(percentage);
  document.querySelector('#score-correct').textContent = `${correctAnswers} / ${questions.length}`;
  document.querySelector('#score-xp').textContent = `${xp} XP`;
  document.querySelector('#score-message').textContent = percentage === 100
    ? 'Sempurna! Anda benar-benar Penjaga Kata.'
    : percentage >= 70
      ? 'Bagus sekali! Teruskan membaca dan berlatih.'
      : 'Syabas kerana mencuba. Latihan menjadikan kita lebih mahir!';
  document.querySelector('#certificate-name').textContent = player.name;
  document.querySelector('#certificate-class').textContent = player.className;
  document.querySelector('#certificate-date').textContent = formatDate(player.date);
  document.querySelector('#certificate-score').textContent = `${percentage}% · ${correctAnswers}/10 betul`;
  showScreen('result');
}

document.querySelector('#print-button').addEventListener('click', () => window.print());
document.querySelector('#restart-button').addEventListener('click', () => {
  form.reset();
  dateInput.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  showScreen('welcome');
  nameInput.focus();
});
