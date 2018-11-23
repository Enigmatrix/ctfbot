import Trello from 'trello-node-api';
import {config, chooseRandom} from './util';
import Axios from 'axios';

const trello_key = config("TRELLO_KEY");
const trello_token = config("TRELLO_TOKEN");
export const trello = new Trello(trello_key, trello_token);

export namespace trelloEx {

    export type ID = string;

    export interface List {
        id : ID;
        name : string;
        closed : boolean;
        idBoard : ID;
        pos : number;
        subscribed : boolean;
        cards?: Card[];
    }

    export interface Card {
        id: ID;
    }

    export interface Label {
        id?: ID;
        idBoard?: ID;
        color : string;
        name : string;
    }

    export interface MemberType {
        type : "member" | "organization",
        id : ID
    }

    const trelloApi = Axios.create({
        baseURL: 'https://api.trello.com/1',
        params: {
            key: trello_key,
            token: trello_token
        }
    });

    export namespace board {
        export async function extractId(url: string): Promise<ID> {
            const segments = url.split('/').filter(x => x !== '');
            const sid = segments[segments.length - 1];
            const board = await trello.board.search(sid);
            return board.id;
        }

        export async function getLabels(boardId: ID): Promise<Label[]> {
            return await trelloApi.get<Label[]>(`/boards/${boardId}/labels`).then(x => x.data);
        }

        export async function getLists(boardId: ID): Promise<List[]> {
            return await trelloApi.get<List[]>(`/boards/${boardId}/lists`).then(x => x.data);
        }

        export async function getList(boardId: ID, name: string): Promise<List | undefined> {
            return await getLists(boardId).then(list => list.find(x => x.name == name));
        }
    }

    export namespace label {
        
    }

    export namespace member {

        export async function isTrelloMemberUrl(s: string) {
            if (!/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?trello.com\/.*$/.test(s)) 
                return false;
            let resp = await trelloApi.get<MemberType>("/types/" + extractId(s));
            return resp.data.type === "member";
        }

        export function extractId(s: string) {
            return s.split('trello.com/')[1];
        }
    }

    export function randomTrelloColor(){
        return chooseRandom(["yellow", "purple", "blue", "red", "green", "orange", "black", "sky", "pink", "lime"])
    }
}
