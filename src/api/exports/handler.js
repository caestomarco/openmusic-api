class ExportsHandler
{
    constructor(ProducerService, playlistsService, validator)
    {
        this.ProducerService = ProducerService;
        this._playlistsService = playlistsService;
        this._validator = validator;
    }

    async postExportPlaylistsHandler(request, h)
    {
        this._validator.validateExportPlaylistsPayload(request.payload);
        
        const { id: playlistId } = request.params;
        const { id: userId } = request.auth.credentials;
        const message = {
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        // ONLY AVAILABLE FOR PLAYLIST OWNER
        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
        await this.ProducerService.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });

        response.code(201);

        return response;
    }
}

export default ExportsHandler;