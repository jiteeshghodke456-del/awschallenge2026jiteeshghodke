function buildStory(idea, genre, length, chaos, transformation = 'generate') {
  const lengthMap = {
    short: 'A brief, sharp little tale',
    medium: 'A medium-length story with a twist',
    long: 'A longer story full of strange detail'
  };

  const genreLabel = genre || 'fantasy';
  const opening = `${lengthMap[length] || lengthMap.short} in a ${genreLabel} mood begins when ${idea.toLowerCase()}`;

  const chaosFlavor =
    chaos >= 8
      ? 'the situation becomes increasingly ridiculous and dangerous'
      : chaos >= 5
      ? 'the situation starts to unravel in unsettling ways'
      : 'the strange truth begins to spread quietly';

  const transformationSentence = {
    darker: 'Then the moon turns red and the town realizes the fear was waiting beneath the surface all along.',
    funnier: 'Suddenly every character starts speaking in absurd rhymes and no one can stop laughing long enough to be afraid.',
    twist: 'The whole time, the real villain was the narrator, who had secretly been editing the story as it happened.',
    absurd: 'A parade of sentient umbrellas storms the sky while the hero tries to negotiate with a vending machine god.',
    scifi: 'The impossible event turns out to be a wormhole glitch from a student lab experiment that should never have been approved.',
    ending: 'The story ends with a surprising new fate: the hero leaves with a different identity, a broken compass, and a deeply suspicious cat.',
    generate: 'The central mystery deepens until the hero understands the real secret is not the strange thing they found, but who they have become.'
  };

  const ending =
    chaos >= 8
      ? 'The world ends in a glittering, impossible way, and everyone pretends it was always meant to happen.'
      : chaos >= 5
      ? 'The truth breaks open at the worst possible moment, and no one is ready for it.'
      : 'The problem is solved, but only after everyone learns something they should never have known.';

  const transformText = transformationSentence[transformation] || transformationSentence.generate;

  return `${opening}. The problem grows worse because ${chaosFlavor}. ${transformText} ${ending}`;
}

export const handler = async (event) => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
    const idea = (body.storyIdea || '').trim();
    const genre = body.genre || 'fantasy';
    const length = body.length || 'short';
    const chaos = Number(body.chaos ?? 5);
    const transformation = body.transformation || 'generate';

    if (!idea) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Please provide a story idea.' })
      };
    }

    const story = buildStory(idea, genre, length, chaos, transformation);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ story })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'The generator failed. Please try again.' })
    };
  }
};
