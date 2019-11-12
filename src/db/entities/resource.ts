import { BaseEntity, Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { Message, TextChannel } from "discord.js";

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

  @Column()
  public timestamp!: Date;

  @Column()
  public channelId!: string;

  @Column()
  public msgId!: string;

  @Column()
  public authorId!: string;

  constructor(msg?: Message, link?: string) {
    super();
    if (!msg || !link) {
      return;
    }
    this.authorId = msg.author.id;
    this.channelId = msg.channel.id;
    this.msgId = msg.id;
    this.link = link;
    this.tags = [];
    this.category = (msg.channel as TextChannel).name;
    this.timestamp = new Date();
    this.description = "";
  }
}
