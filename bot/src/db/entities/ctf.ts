import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { Event } from "@/services/ctftime";

export class Challenge {
  @Column()
  public name: string;

  @Column()
  public categories: string[];

  @Column()
  public workers: ObjectID[];

  @Column()
  public cardId: string;

  @Column()
  public solvedBy: ObjectID | undefined;

  constructor(name: string, categories: string[], cardId: string) {
    this.name = name;
    this.categories = categories;
    this.cardId = cardId;
    this.workers = [];
  }
}

@Entity()
export class CTFTimeCTF extends BaseEntity {
  @ObjectIdColumn()
  public id!: ObjectID;

  @Column()
  public name!: string;

  @Column()
  public description!: string;

  @Column()
  public format!: string;

  @Column()
  public url!: string;

  @Column()
  public ctftimeUrl!: string;

  @Column()
  public trelloUrl!: string;

  @Column()
  public logoUrl!: string | undefined;

  @Column()
  public discordChannelId!: string;

  @Column()
  public discordMainMessageId!: string;

  @Column()
  public writeupLinks!: string[];

  @Column()
  public start!: Date;

  @Column()
  public finish!: Date;

  @Column()
  public hosts!: string[];

  @Column()
  public challenges!: Challenge[];

  @Column()
  public credentials!: { [key: string]: string };

  @Column()
  public archived!: boolean;

  constructor(ctftimeEvent: Event, trelloBoardUrl: string, channelId: string) {
    super();
    if (!ctftimeEvent) {
      return;
    }
    this.name = ctftimeEvent.title;
    this.description = ctftimeEvent.description;
    this.format = ctftimeEvent.format;
    this.url = ctftimeEvent.url;
    this.ctftimeUrl = ctftimeEvent.ctftime_url;
    this.trelloUrl = trelloBoardUrl;
    this.logoUrl = ctftimeEvent.logo === "" ? undefined : ctftimeEvent.logo;
    this.discordChannelId = channelId;
    this.start = ctftimeEvent.start;
    this.finish = ctftimeEvent.finish;
    this.hosts = ctftimeEvent.organizers.map(x => x.name);
    this.writeupLinks = [];
    this.challenges = [];
    this.credentials = {};
    this.archived = false;
  }
}
