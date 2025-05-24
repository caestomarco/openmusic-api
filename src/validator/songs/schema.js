import Joi from "joi";

const SongPayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(2100).required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number().integer().min(0).optional(),
    albumId: Joi.string().optional(),
});

const SongQuerySchema = Joi.object({
    title: Joi.string().optional(),
    performer: Joi.string().empty('').optional(),
});

export { SongPayloadSchema, SongQuerySchema };