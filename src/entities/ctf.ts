import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity} from "typeorm";
import {CtfTime} from '../ctftime';

export class Challenge {
    @Column()
    name: string;

    @Column()
    categories: string[];

    @Column()
    workers: ObjectID[];

    @Column()
    cardId: string;

    @Column()
    solvedBy: ObjectID | undefined;

    constructor(name: string, categories: string[], cardId: string){
        this.name = name;
        this.categories = categories;
        this.cardId = cardId;
        this.workers = [];
    }
}

@Entity()
export class CTFTimeCTF extends BaseEntity {
    @ObjectIdColumn()
    id!: ObjectID;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    format!: string;

    @Column()
    url!: string;

    @Column()
    ctftimeUrl!: string;

    @Column()
    trelloUrl!: string;

    @Column()
    logoUrl!: string | undefined;

    @Column()
    discordChannelId!: string;

    @Column()
    discordMainMessageId!: string;

    @Column()
    start!: Date;

    @Column()
    finish!: Date;

    @Column()
    hosts!: string[];

    @Column()
    challenges!: Challenge[];

    @Column()
    credentials!: {[key: string]: string;};

    @Column()
    archived!: boolean;

    constructor(ctftimeEvent: CtfTime.Event, trelloBoardUrl: string, channelId: string){
        super();
        if(ctftimeEvent === undefined)
            return;
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
        this.challenges = [];
        this.credentials = {};
        this.archived = false;
    }
}