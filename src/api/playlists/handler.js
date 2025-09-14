class PlaylistsHandler 
{
    constructor(playlistsService, songsServices, validator) 
    {
        this._playlistsService = playlistsService;
        this._songsServices = songsServices;
        this._validator = validator;
    }

    async getPlaylistsHandler(request, h) 
    {
        const { id: credentialId } = request.auth.credentials;

        const { playlists, fromCache } = await this._playlistsService.getPlaylists(credentialId);

        const response = h.response({
            status: 'success',
            data: {
                playlists,
            },
        });

        if (fromCache) 
        {
            response.header('X-Data-Source', 'cache');  
        }

        return response;
    }

    async getPlaylistSongsHandler(request, h) 
    {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        const { playlistSongs, fromCache } = await this._playlistsService.getPlaylistSongs(playlistId);

        const response = h.response({
            status: 'success',
            data: {
                playlist: playlistSongs,
            },
        });

        if (fromCache)
        {
            response.header('X-Data-Source', 'cache');  
        }

        return response;
    }

    async getPlaylistSongActivitiesHandler(request, h)
    {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        const { playlistSongActivities, fromCache } = await this._playlistsService.getPlaylistSongActivities(playlistId);

        const response = h.response({
            status: 'success',
            data: {
                ...playlistSongActivities,
            },
        });

        if (fromCache)
        {
            response.header('X-Data-Source', 'cache');  
        }

        return response;
    }

    async postPlaylistHandler(request, h) 
    {
        this._validator.validatePlaylistPayload(request.payload);

        const { id: owner } = request.auth.credentials;
        const playlistId = await this._playlistsService.addPlaylist({ ...request.payload, owner });

        const response = h.response({
            status: 'success',
            message: 'Playlist successfully created',
            data: {
                playlistId,
            },
        });

        response.code(201);

        return response;
    }

    async postPlaylistSongHandler(request, h) 
    {
        this._validator.validatePlaylistSongPayload(request.payload);

        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;
        const { songId } = request.payload;

        await this._songsServices.getSongById(songId);
        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistsService.addSongToPlaylist(playlistId, songId);
        await this._playlistsService.addPlaylistSongActivity(playlistId, songId, credentialId, 'add');

        const response = h.response({
            status: 'success',
            message: 'Song successfully added to playlist',
        });

        response.code(201);

        return response;
    }

    async deletePlaylistByIdHandler(request, h) 
    {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
        await this._playlistsService.deletePlaylistById(playlistId);

        const response = h.response({
            status: 'success',
            message: 'Playlist successfully deleted',
        });

        return response;
    }

    async deletePlaylistSongHandler(request, h) 
    {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;
        const { songId } = request.payload;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistsService.deletePlaylistSongById(playlistId, songId);
        await this._playlistsService.addPlaylistSongActivity(playlistId, songId, credentialId, 'delete');

        const response = h.response({
            status: 'success',
            message: 'Song successfully removed from playlist',
        });

        return response;
    }
}

export default PlaylistsHandler;