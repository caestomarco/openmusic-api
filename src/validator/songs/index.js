import { SongPayloadSchema, SongQuerySchema } from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const SongsValidator = {
    validateSongPayload: (payload) => 
    {
        const validationResult = SongPayloadSchema.validate(payload);

        if (validationResult.error) 
        {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateSongQuery: (query) => 
    {
        const validationResult = SongQuerySchema.validate(query);

        if (validationResult.error) 
        {
            throw new InvariantError(validationResult.error.message);
        }
    }
};

export default SongsValidator;
