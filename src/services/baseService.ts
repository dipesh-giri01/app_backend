import type { Document, Model, QueryOptions, UpdateQuery } from "mongoose";

type FilterQuery<T> = any;

class BaseService<T extends Document> {
    #model: Model<T>;

    constructor(model: Model<T>) {
        this.#model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        try {
            const dataObj = new this.#model(data);
            return await dataObj.save();
        } catch (exception) {
            throw exception;
        }
    }

    async singleRow(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
        try {
            const detail = options 
                ? await this.#model.findOne(filter, null, options)
                : await this.#model.findOne(filter);
            return detail;
        } catch (exception) {
            throw exception;
        }
    }

    async getRows(
        filter: FilterQuery<T>,
        page: number = 1,
        limit: number = 10,
        options?: QueryOptions<T>
    ) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.#model.find(filter, null, { ...options, skip, limit }),
            this.#model.countDocuments(filter)
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        };
    }

    async updateSingleRow(
        filter: FilterQuery<T>, 
        data: UpdateQuery<T>,
        options?: QueryOptions<T>
    ): Promise<T | null> {
        try {
            const updateOptions = { new: true, ...options };
            const update = await this.#model.findOneAndUpdate(
                filter, 
                { $set: data }, 
                updateOptions
            );
            return update;
        } catch (exception) {
            throw exception;
        }
    }

    async deleteSingleRowByFilter(filter: FilterQuery<T>): Promise<T | null> {
        try {
            const del = await this.#model.findOneAndDelete(filter);
            return del;
        } catch (exception) {
            throw exception;
        }
    }

    async softDelete(filter: FilterQuery<T>): Promise<T | null> {
        try {
            const deleted = await this.#model.findOneAndUpdate(
                filter,
                { $set: { isDeleted: true, deletedAt: new Date() } as UpdateQuery<T> },
                { new: true }
            );
            return deleted;
        } catch (exception) {
            throw exception;
        }
    }

    async restoreSoftDeleted(filter: FilterQuery<T>): Promise<T | null> {
        try {
            const deleted = await this.#model.findOneAndUpdate(
                filter,
                { $set: { isDeleted: false, deletedAt: null } as UpdateQuery<T> },
                { new: true }
            );
            return deleted;
        } catch (exception) {
            throw exception;
        }
    }
}

export default BaseService;