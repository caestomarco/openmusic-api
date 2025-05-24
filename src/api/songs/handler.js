class SongsHandler 
{
    constructor(service, validator) 
    {
        this._service = service;
        this._validator = validator;
    }

    async getSongsHandler(request, h)
    {
        await this._validator.validateSongQuery(request.query);

        const { title = '', performer = '' } = request.query;

        if (title !== '' || performer !== '') 
        {
            const songs = await this._service.getSongsByTitleOrPerformer(title, performer);
            
            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditampilkan',
                data: {
                    songs,
                },
            });

            return response;
        }

        const songs = await this._service.getSongs();

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditampilkan',
            data: {
                songs,
            },
        });

        return response;
    }

    async getSongByIdHandler(request, h) 
    {
        const { id } = request.params;
        const song = await this._service.getSongById(id);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditampilkan',
            data: {
                song,
            },
        });

        return response;
    }

    async postSongHandler(request, h) 
    {
        this._validator.validateSongPayload(request.payload);

        const { title, year, genre, performer, duration, albumId } = request.payload;
        const songId = await this._service.addSong({ title, year, genre, performer, duration, albumId });

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan',
            data: {
                songId,
            },
        });

        response.code(201);
        
        return response;
    }

    async putSongByIdHandler(request, h) 
    {
        const { id } = request.params;
        this._validator.validateSongPayload(request.payload);

        const { title, year, genre, performer, duration, albumId } = request.payload;
        await this._service.editSongById(id, { title, year, genre, performer, duration, albumId });

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil diperbarui',
        });

        return response;
    }

    async deleteSongByIdHandler(request, h) 
    {
        const { id } = request.params;

        await this._service.deleteSongById(id);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus',
        });

        return response;
    }

    // ADDITIONAL TO CLEAR DATABASE DURING TESTING
    async deleteSongsHandler() 
    {
        await this._service.deleteSongs();

        return {
            status: 'success',
            message: 'Semua lagu berhasil dihapus',
        };
    }
}

export default SongsHandler;