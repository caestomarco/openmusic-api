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

        const { album, fromCache } = await this._service.getAlbumById(id);

        const response = h.response({
            status: 'success',
            data: {
                album,
            },
        });

        if (fromCache)
        {
            response.header('X-Data-Source', 'cache');  
        }

        return response;
    }

    async getAlbumLikesHandler(request, h)
    {
        const { id } = request.params;

        const { likes, fromCache } = await this._service.getAlbumLikes(id);

        const response = h.response({
            status: 'success',
            data: {
                likes,
            },
        });

        if (fromCache)
        {
            response.header('X-Data-Source', 'cache');  
        }

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

    async postAlbumLikeHandler(request, h)
    {
        const { id: albumId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._service.getAlbumById(albumId);
        await this._service.addAlbumLike(albumId, userId);

        const response = h.response({
            status: 'success',
            message: 'Like album berhasil ditambahkan',
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

    async deleteAlbumLikeHandler(request, h)
    {
        const { id: albumId } = request.params;
        const { id: userId } = request.auth.credentials;

        await this._service.getAlbumById(albumId);
        await this._service.deleteAlbumLike(albumId, userId);

        const response = h.response({
            status: 'success',
            message: 'Like album berhasil dihapus',
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