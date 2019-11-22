import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export class Session extends BaseEntity {
  @ObjectIdColumn()
  public id!: ObjectID;

  @Column()
  public sessionId!: string;

  @Column()
  public sessionDetails: any;
}
