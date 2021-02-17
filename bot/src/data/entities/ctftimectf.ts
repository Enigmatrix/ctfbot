import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { Event } from "@/services/ctftime";

@Entity()
export class CTFTimeCTF extends BaseEntity {
    @ObjectIdColumn()
    public id!: ObjectID;

    @Column()
    public info!: Event;

    @Column()
    public discord!: { channel: string, mainMessage: string };

    @Column()
    public credentials!: { [key: string]: string };

    @Column()
    public archived!: boolean;

    constructor(info: Event) {
      super();
      this.archived = false;
      this.credentials = {};
      this.info = info;
    }
}