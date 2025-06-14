class CollaborationsHandler
{
    constructor(collaborationsService, playlistsService, usersService, validator)
    {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._usersService = usersService;
        this._validator = validator;
    }

    async postCollaborationHandler(request, h)
    {
        this._validator.validateCollaborationPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId: collaboratorId } = request.payload;

        await this._usersService.getUserById(collaboratorId);
        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
        const collaborationId = await this._collaborationsService.addCollaboration(playlistId, collaboratorId);

        const response = h.response({
            status: 'success',
            message: 'Kolaborasi berhasil ditambahkan',
            data: {
                collaborationId,
            },
        });

        response.code(201);

        return response;
    }

    async deleteCollaborationHandler(request, h)
    {
        this._validator.validateCollaborationPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
        await this._collaborationsService.deleteCollaboration(playlistId, userId);

        const response = h.response({
            status: 'success',
            message: 'Kolaborasi berhasil dihapus',
        });

        return response;
    }
}

export default CollaborationsHandler;