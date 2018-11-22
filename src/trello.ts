import Trello from 'trello-node-api';
import { config } from './util';
import Axios from 'axios';

interface MemberType {
    type: "member" | "organization",
    id: string
}

export function extractBoardId(s: string){
    const segments = s.split('/').filter(x => x!=='');
    return segments[segments.length-1];
}

let trelloApi = Axios.create({baseURL: 'https://api.trello.com/1/'});

export function getLists(boardId: string){
    
}

export async function isTrelloMemberUrl(s: string){
    if(!/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?trello.com\/.*$/.test(s))
        return;
    let resp = await trelloApi.get<MemberType>("types/"+extractMemberId(s));
    return resp.data.type === "member";
}

export function extractMemberId(s: string){
    return s.split('trello.com/')[1];
}

const trello = new Trello(config("TRELLO_KEY"), config("TRELLO_TOKEN"));
export default trello;
