import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { mapPlaylistRecordToModel } from '../../utils/index.js';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

class PlaylistsService 
{
    constructor(collaborationsService, cacheService) 
    {
        this._pool = new Pool();
        this._cacheService = cacheService;
        this._collaborationsService = collaborationsService;
    }
    
    // CACHED
    async getPlaylists(credentialId) 
    {
        try
        {
            const playlists = await this._cacheService.get(`playlists:${credentialId}`);

            return { playlists: JSON.parse(playlists), fromCache: true };
        }
        catch
        {
            const query = {
                text: `SELECT playlists.*, users.username
                        FROM playlists 
                        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                        LEFT JOIN users ON users.id = playlists.owner
                        WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
                values: [credentialId],
            };
    
            const result = await this._pool.query(query);

            const playlists = result.rows.map(mapPlaylistRecordToModel);
    
            await this._cacheService.set(`playlists:${credentialId}`, JSON.stringify(playlists));

            return { playlists, fromCache: false };
        }
    }

    // CACHED
    async getPlaylistSongs(playlistId) 
    {
        try
        {
            const playlistSongs = await this._cacheService.get(`playlist_songs:${playlistId}`);

            return { playlistSongs: JSON.parse(playlistSongs), fromCache: true };
        }
        catch
        {
            const query = {
                text: `SELECT playlists.id, playlists.name, users.username, songs.id AS song_id, songs.title, songs.performer
                    FROM playlists
                    LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                    LEFT JOIN users ON users.id = playlists.owner
                    LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
                    LEFT JOIN songs ON songs.id = playlist_songs.song_id
                    WHERE playlists.id = $1`,
                values: [playlistId],
            };

            const result = await this._pool.query(query);

            if (!result.rows.length) 
            {
                throw new NotFoundError('Playlist tidak ditemukan');
            }

            const playlistSongs = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                username: result.rows[0].username,
                songs: []
            };

            result.rows.forEach(row => 
            {
                if (row.song_id) 
                {
                    const song = {
                        id: row.song_id,
                        title: row.title,
                        performer: row.performer
                    };

                    // CHECK IF THERE IS NO DUPLICATE SONG
                    if (!playlistSongs.songs.some(existingSong => existingSong.id === song.id))
                    {
                        playlistSongs.songs.push(song);
                    }
                }
            });

            await this._cacheService.set(`playlist_songs:${playlistId}`, JSON.stringify(playlistSongs));

            return { playlistSongs, fromCache: false };
        }
    }

    // CACHED
    async getPlaylistSongActivities(playlistId) 
    {
        try
        {
            const playlistSongActivities = await this._cacheService.get(`playlist_activities:${playlistId}`);

            return { playlistSongActivities: JSON.parse(playlistSongActivities), fromCache: true };
        }
        catch
        {
            const query = {
                text: `SELECT playlists.*, users.username, songs.title, playlist_songs_activities.action, playlist_songs_activities.time
                        FROM playlists
                        LEFT JOIN playlist_songs_activities ON playlist_songs_activities.playlist_id = playlists.id
                        LEFT JOIN users ON users.id = playlist_songs_activities.user_id
                        LEFT JOIN songs ON songs.id = playlist_songs_activities.song_id
                        WHERE playlists.id = $1 
                        ORDER BY playlist_songs_activities.time ASC`,
                values: [playlistId],
            };
    
            const result = await this._pool.query(query);
    
            if (!result.rows.length)
            {
                throw new NotFoundError('Aktivitas playlist tidak ditemukan');
            }
    
            const playlistSongActivities = {
                playlistId: result.rows[0].id,
                activities: []
            };
    
            result.rows.forEach(row =>
            {
                const activity = {
                    username: row.username,
                    title: row.title,
                    action: row.action,
                    time: row.time,
                };
    
                playlistSongActivities.activities.push(activity);
            });

            await this._cacheService.set(`playlist_activities:${playlistId}`, JSON.stringify(playlistSongActivities));
    
            return { playlistSongActivities, fromCache: false };
        }
    }

    async addPlaylist({ name, owner }) 
    {
        const id = `playlist-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, owner, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) 
        {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        await this._cacheService.delete(`playlists:${owner}`);

        return result.rows[0].id;
    }

    async addSongToPlaylist(playlistId, songId)
    {
        const id = `${playlistId}_song-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, playlistId, songId, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }

        await this._cacheService.delete(`playlist_songs:${playlistId}`);
    }

    async addPlaylistSongActivity(playlistId, songId, userId, action)
    {
        const id = `activity-${nanoid(16)}`;
        const time = new Date().toISOString();

        const query = {
            text: 'INSERT INTO playlist_songs_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, action, time],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new InvariantError('Aktivitas lagu di playlist gagal ditambahkan');
        }

        await this._cacheService.delete(`playlist_activities:${playlistId}`);
    }

    async deletePlaylistById(id)
    {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }

        const { owner } = result.rows[0];

        await this._cacheService.delete(`playlists:${owner}`);
    }

    async deletePlaylistSongById(playlistId, songId)
    {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new InvariantError('Lagu gagal dihapus dari playlist');
        }

        await this._cacheService.delete(`playlist_songs:${playlistId}`);
    }

    async verifyPlaylistOwner(playlistId, owner) 
    {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== owner) 
        {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) 
    {
        try
        {
            await this.verifyPlaylistOwner(playlistId, userId);
        }
        catch (error)
        {
            if (error instanceof NotFoundError)
            {
                throw error;
            }

            try
            {
                await this._collaborationsService.verifyCollaborator(playlistId, userId);
            }
            catch
            {
                throw error;
            }
        }
    }
}

export default PlaylistsService;