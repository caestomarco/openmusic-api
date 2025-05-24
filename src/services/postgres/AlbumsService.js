import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { mapAlbumRecordToModel } from '../../utils/index.js';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class AlbumsService 
{
    constructor() 
    {
        this._pool = new Pool();
    }

    async getAlbums() 
    {
        const result = await this._pool.query('SELECT * FROM albums');

        return result.rows.map(mapAlbumRecordToModel);
    }

    // GET ALBUMS WITH SONGS BY ALBUM ID
    async getAlbumById(id)
    {
        const query = {
            text:   `SELECT 
                        a.id, a.name, a.year, 
                        COALESCE(
                            json_agg( 
                                jsonb_build_object( 'id', s.id, 'title', s.title, 'performer', s.performer ) ORDER BY s.id 
                            ) FILTER (WHERE s.id IS NOT NULL), '[]'::json
                        ) AS songs
                        FROM albums a LEFT JOIN songs s ON a.id = s.album_id 
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

        return result.rows[0];
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
