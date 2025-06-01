import 'dotenv/config';

import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';

// ERROR HANDLING
import ClientError from './exceptions/ClientError.js';

// ALBUMS
import albums from './api/albums/index.js';
import AlbumsService from './services/postgres/AlbumsService.js';
import AlbumsValidator from './validator/albums/index.js';

// SONGS
import songs from './api/songs/index.js';
import SongsService from './services/postgres/SongsService.js';
import SongsValidator from './validator/songs/index.js';

// PLAYLISTS
import playlists from './api/playlists/index.js';
import PlaylistsService from './services/postgres/PlaylistsService.js';
import PlaylistsValidator from './validator/playlists/index.js';

// USERS
import users from './api/users/index.js';
import UsersService from './services/postgres/UsersService.js';
import UsersValidator from './validator/users/index.js';

// AUTHENTICATIONS
import TokenManager from './tokenize/TokenManager.js';
import authentications from './api/authentications/index.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import AuthenticationsValidator from './validator/authentications/index.js';

// COLLABORATIONS
import collaborations from './api/collaborations/index.js';
import CollaborationsService from './services/postgres/CollaborationsService.js';
import CollaborationsValidator from './validator/collaborations/index.js';

const init = async () =>
{
    const collaborationsService = new CollaborationsService();
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const authenticationsService = new AuthenticationsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: playlists,
            options: {
                songsService,
                playlistsService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                usersService,
                playlistsService,
                collaborationsService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                usersService,
                authenticationsService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
    ]);

    server.ext('onPreResponse', (request, h) => 
    {
        const { response } = request;

        if (response instanceof Error) 
        {
            console.error(response);
            if (response instanceof ClientError) 
            {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }

            if (!response.isServer) 
            {
                return h.continue;
            }

            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server kami',
            });

            newResponse.code(500);

            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
