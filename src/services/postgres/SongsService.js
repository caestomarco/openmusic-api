import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import { mapSongRecordToModel } from '../../utils/index.js';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class SongsService 
{
    constructor() 
    {
        this._pool = new Pool();
    }

    async getSongs() 
    {
        const result = await this._pool.query('SELECT id, title, performer FROM songs');

        return result.rows.map(mapSongRecordToModel);
    }

    async getSongsByTitleOrPerformer(title, performer) 
    {
        let query = 'SELECT id, title, performer FROM songs WHERE 1=1';
        let params = [];

        if (title) 
        {
            query += ' AND title ILIKE $' + (params.length + 1);
            params.push(`%${title}%`);
        }

        if (performer) 
        {
            query += ' AND performer ILIKE $' + (params.length + 1);
            params.push(`%${performer}%`);
        }

        const result = await this._pool.query(query, params);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return result.rows.map(mapSongRecordToModel);
    }

    async getSongById(id) 
    {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return result.rows.map(mapSongRecordToModel)[0];
    }

    async addSong({ title, year, genre, performer, duration, albumId }) 
    {
        const id = `song-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;
        
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async editSongById(id, { title, year, genre, performer, duration, albumId }) 
    {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteSongById(id) 
    {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) 
        {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }

    // ADDITIONAL TO CLEAR DATABASE DURING TESTING
    async deleteSongs()
    {
        const query = {
            text: 'DELETE FROM songs',
        };

        await this._pool.query(query);
    }
}

export default SongsService;
