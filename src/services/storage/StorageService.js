import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

class StorageService
{
    constructor(folder, cacheService)
    {
        this._folder = folder;
        this._pool = new Pool();
        this._cacheService = cacheService;

        if (!fs.existsSync(folder))
        {
            fs.mkdirSync(folder, { recursive: true });
        }
    }

    writeFile(file, meta)
    {
        const filename = +new Date() + meta.filename;
        const filePath = `${this._folder}/${filename}`;
        const fileStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) =>
        {
            fileStream.on('error', (error) =>
            {
                reject(error);
            });

            file.pipe(fileStream);

            file.on('end', () =>
            {
                resolve(filename);
            });
        });
    }

    async saveCoverURLToDatabase(filename, albumId)
    {
        const query = {
            text: 'SELECT cover_url FROM albums WHERE id = $1',
            values: [albumId],
        };

        const result = await this._pool.query(query);
        const currentCoverURL = result.rows[0]?.cover_url;
        const newCoverURL = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

        if (currentCoverURL) 
        {
            const oldFilename = path.basename(currentCoverURL);
            const oldFilePath = path.join(this._folder, oldFilename);

            fs.access(oldFilePath, fs.constants.F_OK, (err) => 
            {
                if (!err) 
                {
                    fs.unlink(oldFilePath, (unlinkErr) => 
                    {
                        if (unlinkErr) 
                        {
                            console.error('Error deleting old file:', unlinkErr);
                        }
                        else 
                        {
                            console.log('Successfully deleted the old file:', oldFilePath);
                        }
                    });
                }
            });
        }

        const updateQuery = {
            text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
            values: [newCoverURL, albumId],
        };

        await this._pool.query(updateQuery);

        await this._cacheService.delete(`album:${albumId}`);

        return newCoverURL;
    }
}

export default StorageService;