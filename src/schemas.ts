import { ClassType, Field, Int, ObjectType, registerEnumType, ID } from "type-graphql";

export function Partial<TItem>(TItemClass: ClassType<TItem>): any {

  @ObjectType({ isAbstract: true })
  abstract class PartialClass {
    @Field(type => [TItemClass])
    public items: TItem[];

    @Field(type => Int)
    public total: number;
  }
  return PartialClass;
}

export function CreateReturn<TItem>(TItemClass: ClassType<TItem>): any {

  @ObjectType({ isAbstract: true })
  abstract class CreateReturnClass {
    @Field(type => TItemClass, { nullable: true })
    public item?: TItem;

    @Field(type => [Error], { nullable: true })
    public errors?: Error[];
  }
  return CreateReturnClass;
}

@ObjectType()
export class Commit {
  @Field()
  public hash: string;

  @Field()
  public abbrevHash: string;

  @Field()
  public subject: string;

  @Field()
  public authorName: string;

  @Field()
  public authorDate: Date;
}

@ObjectType()
export class ServerInfo {
  @Field()
  public host: string;

  @Field()
  public time: Date;

  @Field()
  public buildTime: Date;

  @Field(type => [Commit])
  public commits: Commit[];

  @Field(type => [Error], { nullable: true })
  public errors?: Error[];
}

@ObjectType()
export class Error {
  @Field({ nullable: true })
  public path?: string;

  @Field({ nullable: true })
  public name?: string;

  @Field({ nullable: true })
  public value?: string;
}

export enum OrderByType {
  asc = 'asc', desc = 'desc'
}
registerEnumType(OrderByType, { name: 'OrderByType' });

@ObjectType()
export class CreateResponse {
  @Field(type => ID, { nullable: true })
  public id?: string;

  @Field(type => [Error], { nullable: true })
  public errors?: Error[];
}

@ObjectType()
export class UpdateResponse {
  @Field(type => Int, { nullable: true })
  public matched: number;

  @Field(type => Int)
  public modified: number;

  @Field(type => [Error], { nullable: true })
  public errors?: Error[];
}

@ObjectType()
export class DeleteResponse {
  @Field(type => Int)
  public deleted: number;

  @Field(type => [Error], { nullable: true })
  public errors?: Error[];
}
