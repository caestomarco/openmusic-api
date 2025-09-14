import AlbumCoverSchema from "./schema.js";
import InvariantError from "../../exceptions/InvariantError.js";

const UploadsValidator = {
    validateAlbumCover: (headers) =>
    {
        const validationResult = AlbumCoverSchema.validate(headers);

        if (validationResult.error)
        {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

export default UploadsValidator;