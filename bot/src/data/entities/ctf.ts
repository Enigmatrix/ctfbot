import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { Event, Writeup } from "@/services/ctftime";

@Entity()
export class CTF extends BaseEntity {
    @ObjectIdColumn()
    public id!: ObjectID;

    @Column()
    public info!: Event;

    @Column()
    public discord!: { channel: string, mainMessage: string };

    @Column()
    public credentials!: { [key: string]: string };

    @Column()
    public writeups!: { [task: string]: Writeup[] }

    @Column()
    public archived!: boolean;

    @Column()
    public bingo!: Record<string, any>[][];

    constructor(info: Event) {
      super();
      this.archived = false;
      this.credentials = {};
      this.writeups = {};
      this.bingo = [
        [{}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}]
      ];
      this.info = info;
    }
}