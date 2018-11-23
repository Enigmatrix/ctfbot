import fastify from 'fastify';

let webhooks = fastify({logger: false})

webhooks.post('/trello/card', (req, res) => {});

export default webhooks;