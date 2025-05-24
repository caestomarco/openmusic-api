import Joi from "joi";

const AlbumPayloadSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(2100).required(),
});

export default AlbumPayloadSchema;