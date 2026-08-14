const form = document.getElementById('story-form');
const ideaInput = document.getElementById('story-idea');
const genreSelect = document.getElementById('genre');
const lengthSelect = document.getElementById('length');
const chaosInput = document.getElementById('chaos');
const chaosValue = document.getElementById('chaos-value');
const storyOutput = document.getElementById('story-output');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const submitButton = form.querySelector('button[type="submit"]');
const newIdeaButton = document.querySelector('.secondary-button');
const generateAnotherButton = document.querySelector('.ghost-button');
const mutationButtons = [...document.querySelectorAll('.mutation-button')];

const promptIdeas = [
  'A student discovers that his laptop is secretly alive.',
  'A tiny bakery opens at midnight and starts serving memories.',
  'An astronaut finds a message in the moon dust written by his future self.',
  'A town is powered by the laughter of a single grumpy child.'
];

let currentStory = '';

function updateChaosDisplay() {
  chaosValue.textContent = chaosInput.value;
}

function setLoading(loading) {
  loadingState.classList.toggle('hidden', !loading);
  submitButton.disabled = loading;
  submitButton.textContent = loading ? 'Generating...' : 'Generate Story';
}

function setError(message) {
  errorState.classList.remove('hidden');
  errorState.querySelector('p').textContent = message;
}

function clearError() {
  errorState.classList.add('hidden');
}

function enableMutationButtons() {
  mutationButtons.forEach((button) => {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
  });
}

function disableMutationButtons() {
  mutationButtons.forEach((button) => {
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
  });
}

function buildMockStory(idea, genre, length, chaos) {
  const lengthMap = {
    short: 'A short, sharp little tale',
    medium: 'A medium-length story with a twist',
    long: 'A longer story full of restless detail'
  };

  const opening = `${lengthMap[length]} in a ${genre} mood begins when ${idea.toLowerCase()}`;
  const chaosFlavor = chaos >= 8 ? 'everything gets more ridiculous and dangerous' : chaos >= 5 ? 'the situation becomes strange and unstable' : 'the strange truth starts to spread';
  const ending = chaos >= 8 ? 'The world ends in a glittering, impossible way, and everyone pretends it was always meant to happen.' : chaos >= 5 ? 'The truth is revealed at the exact worst possible moment, and no one is prepared.' : 'The problem is solved, but only after everyone learns something they should not have known.';

  return `${opening}. The problem grows worse because ${chaosFlavor}. By the final act, the protagonist realizes the real secret is not the weird object or creature at all, but the kind of person they have become. ${ending}`;
}

function renderStory(storyText) {
  currentStory = storyText;
  storyOutput.innerHTML = `
    <h3>Story draft</h3>
    <p>${storyText}</p>
  `;
}

function applyMutation(mutationText) {
  if (!currentStory) {
    setError('Generate a story first before mutating it.');
    return;
  }

  const mutatedStory = `${currentStory} ${mutationText}`;
  renderStory(mutatedStory);
  clearError();
}

mutationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const label = button.textContent.trim();
    const mutationMessages = {
      'Make It Darker': 'Then the moon turned black and the town realized it had been haunted by its own mistakes.',
      'Make It Funnier': 'Suddenly every character started speaking in ridiculous rhymes and nobody could stop laughing long enough to be afraid.',
      'Add a Plot Twist': 'The whole time, the real villain was the narrator, who had been editing the story in secret.',
      'Make It Absurd': 'A parade of sentient umbrellas marched across the sky while the hero tried to negotiate with a vending machine god.',
      'Turn It Into Sci‑Fi': 'The impossible event was actually a malfunctioning wormhole created by a student lab experiment that should never have been funded.',
      'Change the Ending': 'Instead of victory, the main character walked away with a new identity, a broken compass, and a deeply suspicious cat.'
    };

    applyMutation(mutationMessages[label] || 'The story changed in a dramatic but mysterious way.');
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const storyIdea = ideaInput.value.trim();

  if (!storyIdea) {
    setError('Please enter a story idea before generating your plot twist.');
    return;
  }

  clearError();
  setLoading(true);

  setTimeout(() => {
    const story = buildMockStory(storyIdea, genreSelect.value, lengthSelect.value, Number(chaosInput.value));
    renderStory(story);
    enableMutationButtons();
    setLoading(false);
  }, 900);
});

newIdeaButton.addEventListener('click', () => {
  const randomIdea = promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
  ideaInput.value = randomIdea;
  ideaInput.focus();
});

generateAnotherButton.addEventListener('click', () => {
  form.requestSubmit();
});

chaosInput.addEventListener('input', updateChaosDisplay);

updateChaosDisplay();
disableMutationButtons();
