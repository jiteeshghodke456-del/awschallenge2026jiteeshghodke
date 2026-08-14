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

const API_URL = window.PLOT_TWIST_API_URL || 'http://localhost:3000/generate';

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

function renderEmptyState() {
  storyOutput.innerHTML = '<p class="story-placeholder">Your story is waiting for a spark.</p>';
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

function renderStory(storyText) {
  currentStory = storyText;
  storyOutput.innerHTML = `
    <h3>Story draft</h3>
    <p>${storyText}</p>
  `;
}

function getMutationKey(label) {
  const map = {
    'Make It Darker': 'darker',
    'Make It Funnier': 'funnier',
    'Add a Plot Twist': 'twist',
    'Make It Absurd': 'absurd',
    'Turn It Into Sci‑Fi': 'scifi',
    'Change the Ending': 'ending'
  };

  return map[label] || 'generate';
}

async function sendToBackend(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'The backend could not generate a story.');
  }

  if (!data.story || typeof data.story !== 'string') {
    throw new Error('The backend returned an invalid story response.');
  }

  return data.story;
}

mutationButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const label = button.textContent.trim();

    if (!currentStory) {
      setError('Generate a story first before mutating it.');
      return;
    }

    try {
      setLoading(true);
      clearError();

      const story = await sendToBackend({
        storyIdea: currentStory,
        genre: genreSelect.value,
        length: lengthSelect.value,
        chaos: Number(chaosInput.value),
        transformation: getMutationKey(label)
      });

      renderStory(story);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const storyIdea = ideaInput.value.trim();

  if (!storyIdea) {
    setError('Please enter a story idea before generating your plot twist.');
    return;
  }

  try {
    clearError();
    setLoading(true);

    const story = await sendToBackend({
      storyIdea,
      genre: genreSelect.value,
      length: lengthSelect.value,
      chaos: Number(chaosInput.value),
      transformation: 'generate'
    });

    renderStory(story);
    enableMutationButtons();
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
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
renderEmptyState();
