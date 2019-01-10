import {BaseEntity, Column, Entity, ObjectID, ObjectIdColumn} from "typeorm";

@Entity()
export class User extends BaseEntity {
    @ObjectIdColumn()
    public id!: ObjectID;

    @Column()
    public discordId!: string;

    @Column()
    public trelloId!: string;
}
