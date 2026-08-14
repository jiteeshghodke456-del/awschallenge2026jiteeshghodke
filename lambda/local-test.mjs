import { handler } from './index.mjs';

const event = {
  body: JSON.stringify({
    storyIdea: 'A student discovers that his laptop is secretly alive.',
    genre: 'fantasy',
    length: 'medium',
    chaos: 7,
    transformation: 'twist'
  })
};

const result = await handler(event);
console.log(JSON.stringify(result, null, 2));
