import { Entity, Column, PrimaryColumn } from "typeorm/browser";

@Entity()
export class Profile {
  // @ts-ignore
  public static name = "Profile";

  @PrimaryColumn("text")
  address!: string;

  @Column("text", { default: "{}" })
  socials!: string;

  @Column("int", { default: 0 })
  updatedAt!: number;
}
