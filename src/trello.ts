import Trello from 'trello-node-api';
import { config } from './util';

export default new Trello(config("TRELLO_KEY"), config("TRELLO_TOKEN"));
