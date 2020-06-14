import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

export interface Option {
  key: string,
  name: string
}

@Entity()
export class Vote extends BaseEntity {
  @ObjectIdColumn()
  public id!: ObjectID;

  @Column()
  public title!: string;

  @Column()
  public description!: string;

  @Column()
  public options!: Option[];

  @Column()
  public deadline!: Date|undefined;

  static async createDefault(): Promise<Vote> {
    const vote = new Vote();
    await vote.save();
    vote.title = "Vote Title";
    vote.description = "Vote description, can contain _formatting_";
    vote.options = [
      { key: ":hammer:", name: "Negative" },
      { key: ":tick:", name: "Yes" }];
    return vote;
  }
}
