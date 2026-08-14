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

let bedrockRuntime = null;

try {
  const bedrockModule = await import('@aws-sdk/client-bedrock-runtime');
  bedrockRuntime = bedrockModule;
} catch (error) {
  bedrockRuntime = null;
}

async function generateWithBedrock(idea, genre, length, chaos, transformation) {
  const shouldUseBedrock = process.env.USE_BEDROCK === 'true';
  const hasAwsCreds = Boolean(
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_PROFILE ||
    process.env.AWS_SESSION_TOKEN ||
    process.env.AWS_WEB_IDENTITY_TOKEN_FILE ||
    process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
  );

  if (!shouldUseBedrock || !hasAwsCreds || !bedrockRuntime?.BedrockRuntimeClient || !bedrockRuntime?.InvokeModelCommand) {
    return buildStory(idea, genre, length, chaos, transformation);
  }

  const modelId = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0';
  const region = process.env.AWS_REGION || 'us-east-1';

  const client = new bedrockRuntime.BedrockRuntimeClient({ region });
  const prompt = `Write only the final story text. Do not explain the process.

Story idea: ${idea}
Genre: ${genre}
Length: ${length}
Chaos level: ${chaos}
Requested transformation: ${transformation}

Return a creative, original short story that follows the idea and style requested.`;

  const payload = {
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages: [
        { role: 'user', content: [{ text: prompt }] }
      ],
      inferenceConfig: {
        max_new_tokens: 400,
        temperature: 0.9,
        top_p: 0.9
      }
    })
  };

  const command = new bedrockRuntime.InvokeModelCommand(payload);
  const response = await client.send(command);
  const raw = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(raw);

  const text = parsed.output?.message?.content?.[0]?.text || parsed.content?.[0]?.text || parsed.completion || '';

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Bedrock returned an empty story.');
  }

  return text.trim();
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

    const story = await generateWithBedrock(idea, genre, length, chaos, transformation);

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
      body: JSON.stringify({ error: error.message || 'The generator failed. Please try again.' })
    };
  }
};
