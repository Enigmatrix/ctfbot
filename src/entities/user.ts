import {Entity, ObjectID, ObjectIdColumn, Column, BaseEntity} from "typeorm";

@Entity()
export class User extends BaseEntity {
    @ObjectIdColumn()
    id!: ObjectID;

    @Column()
    discordId!: string;

    @Column()
    trelloId!: string;
}
