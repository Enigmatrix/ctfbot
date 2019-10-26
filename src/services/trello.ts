import { config } from "../utils";
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
  // TODO memberships: ;
  enterpriseOwned: boolean;
}

export interface Label {
  id?: ID;
  idBoard?: ID;
  color: Color;
  name: string;
}

export async function createBoard(opts: BoardCreateOpts): Promise<Board> {
  return await trello
    .post<Board>(`boards/`, undefined, { params: opts })
    .then(x => x.data);
}

export async function getLabels(boardId: ID): Promise<Label[]> {
  return await trello
    .get<Label[]>(`/boards/${boardId}/labels`)
    .then(x => x.data);
}

export async function deleteLabel(labelID: ID): Promise<void> {
  await trello.delete(`labels/${labelID}`);
}

export async function createBoardLabel(
  boardID: ID,
  label: Label
): Promise<Label> {
  return await trello
    .post<Label>(`boards/${boardID}/labels`, undefined, { params: label })
    .then(x => x.data);
}
