class AlbumsHandler 
{
    constructor(service, validator) 
    {
        this._service = service;
        this._validator = validator;
    }

    async getAlbumByIdHandler(request, h)
    {
        const { id } = request.params;
        const album = await this._service.getAlbumById(id);

        const response = h.response({
            status: 'success',
            data: {
                album,
            },
        });

        return response;
    }

    async postAlbumHandler(request, h) 
    {
        this._validator.validateAlbumPayload(request.payload);
        const albumId = await this._service.addAlbum(request.payload);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            },
        });

        response.code(201);

        return response;
    }

    async putAlbumByIdHandler(request, h) 
    {
        const { id } = request.params;
        this._validator.validateAlbumPayload(request.payload);

        const { name, year } = request.payload;
        await this._service.editAlbumById(id, { name, year });

        const response = h.response({
            status: 'success',
            message: 'Album berhasil diperbarui',
        });

        return response;
    }

    async deleteAlbumByIdHandler(request, h) 
    {
        const { id } = request.params;

        await this._service.deleteAlbumById(id);

        const response = h.response({
            status: 'success',
            message: 'Album berhasil dihapus',
        });

        return response;
    }

    // ADDITIONAL TO CLEAR DATABASE DURING TESTING
    async deleteAlbumsHandler()
    {
        await this._service.deleteAlbums();

        return {
            status: 'success',
            message: 'Semua album berhasil dihapus',
        };
    }
}

export default AlbumsHandler;