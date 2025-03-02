import { Delete } from "@sinclair/typebox/build/cjs/value";
import { DeleteResult } from "mongodb";
import {
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  SortOrder,
  Require_id,
  FlattenMaps,
  PipelineStage,
  AggregateOptions,
  UpdateWriteOpResult,
  AnyBulkWriteOperation,
} from "mongoose";

export class BaseRepository<T> {
  private model: Model<T>;
  private queryOptions!: {
    filter: FilterQuery<T>;
    sort:
      | string
      | { [key: string]: SortOrder | { $meta: any } }
      | [string, SortOrder][]
      | undefined
      | null;
    populate: any[];
    select: string;
    skip: number;
    limit: number;
    lean: boolean;
  };

  constructor(model: Model<T>) {
    this.model = model;
    this.resetQueryOptions();
  }

  private resetQueryOptions() {
    this.queryOptions = {
      filter: {},
      sort: {},
      populate: [],
      select: "",
      skip: 0,
      limit: 0,
      lean: false,
    };
  }

  where(filter: FilterQuery<T>): this {
    this.queryOptions.filter = filter;
    return this;
  }

  sort(
    sort:
      | string
      | { [key: string]: SortOrder | { $meta: any } }
      | [string, SortOrder][]
      | undefined
      | null
  ): this {
    this.queryOptions.sort = sort;
    return this;
  }

  populate(populate: any[]): this {
    this.queryOptions.populate = populate;
    return this;
  }

  select(select: string): this {
    this.queryOptions.select = select;
    return this;
  }

  skip(skip: number): this {
    this.queryOptions.skip = skip;
    return this;
  }

  limit(limit: number): this {
    this.queryOptions.limit = limit;
    return this;
  }

  lean(lean: boolean = true): this {
    this.queryOptions.lean = lean;
    return this;
  }

  count() {
    return this.model.countDocuments(this.queryOptions.filter);
  }

  async findAll(): Promise<T[] | Require_id<FlattenMaps<T>>[]> {
    const result = await this.model
      .find(this.queryOptions.filter)
      .sort(this.queryOptions.sort)
      .skip(this.queryOptions.skip)
      .limit(this.queryOptions.limit)
      .populate(this.queryOptions.populate)
      .select(this.queryOptions.select)
      .lean(this.queryOptions.lean);

    this.resetQueryOptions();
    return result;
  }

  async findOne(): Promise<T | null | Require_id<FlattenMaps<T>>> {
    const result = await this.model
      .findOne(this.queryOptions.filter)
      .sort(this.queryOptions.sort)
      .populate(this.queryOptions.populate)
      .select(this.queryOptions.select)
      .lean(this.queryOptions.lean);

    this.resetQueryOptions();
    return result;
  }

  async create(document: Partial<T> | T[]): Promise<T> {
    return this.model.create(document);
  }

  async update(
    body: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    console.log(this.queryOptions.filter,body,options,'a')
    const result = await this.model
      .findOneAndUpdate(this.queryOptions.filter, body, {
        ...options,
        new: true,
      })
      .populate(this.queryOptions.populate);

    this.resetQueryOptions();
    return result;
  }

  async updateOne(
    body: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T|null> {
    
    const result = await this.model
      .findOneAndUpdate(this.queryOptions.filter, body, options)
      .exec();
    this.resetQueryOptions();
    return result;
  }

  async upsert(body: UpdateQuery<T>): Promise<object> {
    return this.updateOne(body, { upsert: true });
  }

  async updateMany(
    body: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<object> {
    const result = await this.model
      .updateMany(this.queryOptions.filter, body, options)
      .exec();
    this.resetQueryOptions();
    return result;
  }

  async deleteMany(): Promise<T |UpdateWriteOpResult> {
    return this.model
      .updateMany(this.queryOptions.filter, { deleted:true })
      .exec();

    
  }
  async deleteOne(){
    return this.model
      .deleteOne(this.queryOptions.filter, { deleted:true })
      .exec();

    
  }
  async findById(id: string): Promise<T | null | Require_id<FlattenMaps<T>>> {
    const result = await this.model
      .findById(id)
      .populate(this.queryOptions.populate)
      .select(this.queryOptions.select)
      .lean(this.queryOptions.lean);

    this.resetQueryOptions();
    return result;
  }
  async aggregate(pipeline: PipelineStage[], options?: AggregateOptions): Promise<T[]> {
    let aggregation = this.model.aggregate(pipeline);

    // if (this.queryOptions.sort) {
    //   aggregation = aggregation.sort(this.queryOptions.sort);
    // }

    // if (this.queryOptions.skip) {
    //   aggregation = aggregation.skip(this.queryOptions.skip);
    // }

    // if (this.queryOptions.limit) {
    //   aggregation = aggregation.limit(this.queryOptions.limit);
    // }

    // if (options) {
    //   aggregation = aggregation.option(options);
    // }

    const result = await aggregation.exec();

    this.resetQueryOptions();
    return result;
  }
  async bulkWrite(data:AnyBulkWriteOperation[]){
    return this.model.bulkWrite(data)
  }
}
