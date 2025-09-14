import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { mapAlbumRecordToModel } from '../../utils/index.js';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class AlbumsService 
{
    constructor(cacheService) 
    {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    // GET ALBUM WITH SONGS BY ALBUM ID (OPTIONAL) - CACHED
    async getAlbumById(id)
    {
        try 
        {
            const album = await this._cacheService.get(`album:${id}`);

            return { album: JSON.parse(album), fromCache: true };
        }
        catch
        {
            const query = {
                text:   `SELECT a.*, 
                        COALESCE(
                            json_agg( 
                                jsonb_build_object( 'id', s.id, 'title', s.title, 'performer', s.performer ) ORDER BY s.id 
                            ) FILTER (WHERE s.id IS NOT NULL), '[]'::json
                        ) AS songs
                        FROM albums a 
                        LEFT JOIN songs s ON a.id = s.album_id 
                        WHERE a.id = $1 
                        GROUP BY a.id 
                        ORDER BY a.id;`,
                values: [id],
            };

            const result = await this._pool.query(query);

            if (!result.rows.length) 
            {
                throw new NotFoundError('Album tidak ditemukan');
            }

            const album = mapAlbumRecordToModel(result.rows[0]);

            // CACHE THE ALBUM
            await this._cacheService.set(`album:${id}`, album);

            return { album, fromCache: false };
        }
        
    }

    // CACHED
    async getAlbumLikes(id)
    {
        try
        {
            const likes = await this._cacheService.get(`album_likes:${id}`);

            return { likes: parseInt(likes, 10), fromCache: true };
        }
        catch
        {
            const query = {
                text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
                values: [id],
            };

            const result = await this._pool.query(query);

            const likes = parseInt(result.rows[0].likes, 10);

            if (!result.rows.length) 
            {
                throw new NotFoundError('Album tidak ditemukan');
            }

            await this._cacheService.set(`album_likes:${id}`, likes);

            return { likes, fromCache: false };
        }
    }

    async addAlbum({ name, year }) 
    {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async addAlbumLike(albumId, userId)
    {
        const id = `album-like-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, userId, albumId, createdAt, updatedAt],
        };

        try 
        {
            const result = await this._pool.query(query);

            if (!result.rows.length) 
            {
                throw new InvariantError('Like album gagal ditambahkan');
            }

            await this._cacheService.delete(`album_likes:${albumId}`);
        }
        catch (error) 
        {
            // CHECK FOR UNIQUE CONSTRAINT VIOLATION
            if (error.code === '23505') 
            {
                throw new InvariantError('Gagal menambahkan like album. Album sudah disukai');
            }

            throw error;
        }
    }

    async editAlbumById(id, { name, year })
    {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length)
        {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }

        await this._cacheService.delete(`album:${id}`);
    }

    async deleteAlbumById(id) 
    {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }

        await this._cacheService.delete(`album:${id}`);
    }

    async deleteAlbumLike(albumId, userId)
    {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
            values: [albumId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Like album gagal dihapus. Id tidak ditemukan');
        }

        await this._cacheService.delete(`album_likes:${albumId}`);
    }

    // ADDITIONAL TO CLEAR DATABASE DURING TESTING
    async deleteAlbums() 
    {
        const query = {
            text: 'DELETE FROM albums',
        };

        await this._pool.query(query);
    }
}

export default AlbumsService;
