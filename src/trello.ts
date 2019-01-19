import Axios from "axios";
import Trello from "trello-node-api";
import {chooseRandom, config} from "./util";

const trelloKey = config("TRELLO_KEY");
const trelloToken = config("TRELLO_TOKEN");
export const trello = new Trello(trelloKey, trelloToken);

// tslint:disable-next-line:no-namespace
export namespace trelloEx {

    export type ID = string;

    export interface List {
        id: ID;
        name: string;
        closed: boolean;
        idBoard: ID;
        pos: number;
        subscribed: boolean;
        cards?: Card[];
    }

    export interface Card {
        id: ID;
    }

    export interface Label {
        id?: ID;
        idBoard?: ID;
        color: string;
        name: string;
    }

    export interface Member {
        id: ID;
        avatarHash: string;
        fullName: string;
        initials: string;
        username: string;
    }

    export interface MemberType {
        type: "member" | "organization";
        id: ID;
    }

    const trelloApi = Axios.create({
        baseURL: "https://api.trello.com/1",
        params: {
            key: trelloKey,
            token: trelloToken,
        },
    });

    export namespace board {
        export async function extractId(url: string): Promise<ID> {
            const segments = url.split("/").filter((x) => x !== "");
            const sid = segments[segments.length - 1];
            const brd = await trello.board.search(sid);
            return brd.id;
        }

        export async function getLabels(boardId: ID): Promise<Label[]> {
            return await trelloApi.get<Label[]>(`/boards/${boardId}/labels`).then((x) => x.data);
        }

        export async function getLists(boardId: ID): Promise<List[]> {
            return await trelloApi.get<List[]>(`/boards/${boardId}/lists`).then((x) => x.data);
        }

        export async function getList(boardId: ID, name: string): Promise<List | undefined> {
            return await getLists(boardId).then((list) => list.find((x) => x.name === name));
        }

        export async function addMemberIfNotExists(boardId: ID, memberId: ID): Promise<void> {
            await trelloApi.put(`/boards/${boardId}/members/${memberId}`);
        }
    }

    export namespace label {

    }

    export namespace card {

        export async function addMember(cardId: ID, memId: ID) {
            return await trelloApi.post(`cards/${cardId}/idMembers`, undefined, {
                params: {
                    value: memId,
                },
            });
        }

        export async function rmvMember(cardId: ID, memId: ID) {
            return await trelloApi.delete(`cards/${cardId}/idMembers/${memId}`);
        }

        export async function move(cardId: ID, newListId: ID) {
            return await trelloApi.put(`cards/${cardId}`, undefined, {
                params: {
                    idList: newListId,
                },
            });
        }

    }

    export namespace member {

        export async function extractId(s: string): Promise<ID|undefined> {
            if (!/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?trello.com\/.*$/.test(s)) {
                return;
            }
            const resp = await trelloApi.get<MemberType>("/types/" + s.split("trello.com/")[1]);
            if (resp.data.type !== "member") { return; }
            return resp.data.id;
        }
    }

    export function randomTrelloColor() {
        return chooseRandom(["yellow", "purple", "blue", "red", "green", "orange", "black", "sky", "pink", "lime"]);
    }
}
