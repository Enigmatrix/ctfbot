import {BaseEntity, Column, Entity, ObjectID, ObjectIdColumn} from "typeorm";

@Entity()
export class Resource extends BaseEntity {
    @ObjectIdColumn()
    public id!: ObjectID;

    @Column()
    public link!: string;

    @Column()
    public description!: string;

    @Column()
    public category!: string;

    @Column()
    public tags!: string[];
}
