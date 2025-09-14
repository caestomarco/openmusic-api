class UploadsHandler
{
    constructor(storageService, albumsService, validator)
    {
        this._storageService = storageService;
        this._albumsService = albumsService;
        this._validator = validator;
    }

    async postUploadAlbumCoverHandler(request, h)
    {
        const { cover } = request.payload;
        const { id: albumId } = request.params;

        this._validator.validateAlbumCover(cover.hapi.headers);

        // CHECK IF THE ALBUM EXISTS BEFORE UPLOADING THE COVER
        await this._albumsService.getAlbumById(albumId);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        const coverURL = await this._storageService.saveCoverURLToDatabase(filename, albumId);

        const response = h.response({
            status: 'success',
            message: 'Sampul album berhasil diunggah',
            data: {
                coverURL,
            },
        });

        response.code(201);

        return response;
    }
}

export default UploadsHandler;