export const up = (pgm) => 
{
    pgm.createTable('playlist_songs', {
        id: {
            type: 'VARCHAR(255)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(255)',
            notNull: true,
            references: 'playlists(id)',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        song_id: {
            type: 'VARCHAR(255)',
            notNull: true,
            references: 'songs(id)',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        created_at: {
            type: 'TEXT',
            notNull: true,
        },
        updated_at: {
            type: 'TEXT',
            notNull: true,
        },
    });

    pgm.createIndex('playlist_songs', ['playlist_id', 'song_id'], {
        unique: true,
    });
};

export const down = (pgm) => 
{
    pgm.dropIndex('playlist_songs', ['playlist_id', 'song_id']);
    pgm.dropTable('playlist_songs');
};
