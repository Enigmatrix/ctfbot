import { chooseRandom, config } from "../utils";
import axios from "../utils/requests";

const trello = axios.create({
  baseURL: "https://api.trello.com/1",
  params: {
    key: config("TRELLO_KEY"),
    token: config("TRELLO_TOKEN")
  }
});

export type ID = string;

export enum Color {
  Black = "black",
  Blue = "blue",
  Green = "green",
  Lime = "lime",
  Null = "null",
  Orange = "orange",
  Pink = "pink",
  Purple = "purple",
  Red = "red",
  Sky = "sky",
  Yellow = "yellow"
}

export interface CardCreateOpts {
  name?: string;
  desc?: string;
  pos?: number | string;
  due?: string;
  dueComplete?: boolean;
  idList: ID;
  idMembers?: string;
  idLabels?: string[];
  urlSource?: string;
  // fileSource: file
  idCardSource?: ID;
  keepFromSource?: string;
  address?: string;
  locationName?: string;
  coordinates?: string | { latitude: number; longitude: number };
}

export interface BoardCreateOpts {
  name: string;
  defaultLabels?: boolean;
  defaultLists?: boolean;
  desc?: string;
  idOrganization?: ID;
  idBoardSource?: ID;
  keepFromSource?: "none" | "cards";
  powerUps?: "all" | "calendar" | "cardAging" | "recap" | "voting";
  prefs_permissionLevel?: "org" | "private" | "public";
  prefs_voting?: "disabled" | "members" | "observers" | "org" | "public";
  prefs_comments?: "disabled" | "members" | "observers" | "org" | "public";
  prefs_invitations?: "admins" | "members";
  prefs_selfJoin?: boolean;
  prefs_cardCovers?: boolean;
  prefs_background?: Color;
  prefs_cardAging?: "pirate" | "regular";
}

export interface Board {
  id: ID;
  name: string;
  desc: string;
  descData: string | null;
  closed: boolean;
  idOrganization: ID;
  pinned: boolean;
  url: string;
  shortUrl: string;
  prefs: any;
  labelNames: Label[];
  starred: boolean;
  limits: any;
  // memberships: ;
  enterpriseOwned: boolean;
}

export interface List {
  id: ID;
  name: string;
  closed: boolean;
  idBoard: ID;
  pos: number;
  subscribed: boolean;
  softLimit: number | null;
}

export interface Label {
  id?: ID;
  idBoard?: ID;
  color: Color;
  name: string;
}

export interface Badges {
  votes: number;
  viewingMemberVoted: boolean;
  subscribed: boolean;
  fogbugz: string;
  checkItems: number;
  checkItemsChecked: number;
  comments: number;
  attachments: number;
  description: boolean;
  due: Date;
  dueComplete: boolean;
}

export interface Card {
  id: ID;
  badges: Badges;
  // checkItemStates
  closed: boolean;
  dateLastActivity: Date;
  desc: string;
  descData: string | null;
  due: Date;
  dueComplete: boolean;
  idAttachmentCover: ID;
  idBoard: ID;
  idChecklists: ID[];
  idLabels: ID[];
  idList: ID;
  idMembers: ID[];
  idMembersVoted: ID[];
  idShort: ID;
  labels: Label[];
  manualCoverAttachment: boolean;
  name: string;
  pos: number;
  shortLink: string;
  shortUrl: string;
  subscribed: boolean;
  url: string;
  address: string;
  locationName: string;
  coordinates: string | { latitude: number; longitude: number };
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

export class Board {
  public static async create(opts: BoardCreateOpts): Promise<Board> {
    return await trello
      .post<Board>(`/boards/`, undefined, { params: opts })
      .then(x => x.data);
  }

  public static async extractId(url: string): Promise<ID> {
    const segments = url.split("/").filter(x => x !== "");
    const sid = segments[segments.length - 1];
    const brd = await trello.get<Board>(`/boards/${sid}`).then(x => x.data);
    return brd.id;
  }

  public static async addMemberIfNotExists(
    boardId: ID,
    memberId: ID
  ): Promise<void> {
    const all: Member[] = await trello
      .get(`/boards/${boardId}/members`)
      .then(x => x.data);
    if (all.findIndex(x => x.id === memberId) !== -1) {
      return;
    }

    await trello.put(`/boards/${boardId}/members/${memberId}`, undefined, {
      params: {
        type: "admin"
      }
    });
  }
}

export class Label {
  public static async getAll(boardId: ID): Promise<Label[]> {
    return await trello
      .get<Label[]>(`/boards/${boardId}/labels`)
      .then(x => x.data);
  }

  public static async delete(labelID: ID): Promise<void> {
    await trello.delete(`/labels/${labelID}`);
  }

  public static async create(boardID: ID, label: Label): Promise<Label> {
    return await trello
      .post<Label>(`/boards/${boardID}/labels`, undefined, { params: label })
      .then(x => x.data);
  }
}

export class List {
  public static async getAll(boardId: ID): Promise<List[]> {
    return await trello
      .get<List[]>(`/boards/${boardId}/lists`)
      .then(x => x.data);
  }

  public static async get(
    boardId: ID,
    name: string
  ): Promise<List | undefined> {
    return await this.getAll(boardId).then(list =>
      list.find(x => x.name === name)
    );
  }
}

export class Card {
  public static async create(opts: CardCreateOpts): Promise<Card> {
    return await trello
      .post<Card>(`/cards/`, undefined, { params: opts })
      .then(x => x.data);
  }

  public static async addMember(cardId: ID, memId: ID) {
    return await trello.post(`/cards/${cardId}/idMembers`, undefined, {
      params: {
        value: memId
      }
    });
  }

  public static async rmvMember(cardId: ID, memId: ID) {
    return await trello.delete(`/cards/${cardId}/idMembers/${memId}`);
  }

  public static async move(cardId: ID, newListId: ID) {
    return await trello.put(`/cards/${cardId}`, undefined, {
      params: {
        idList: newListId
      }
    });
  }
}

export function randomTrelloColor(): Color {
  return chooseRandom(Object.values(Color)) as Color;
}
