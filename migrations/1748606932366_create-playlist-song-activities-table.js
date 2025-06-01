export const up = (pgm) => 
{
    pgm.createTable('playlist_songs_activities', {
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
        user_id: {
            type: 'VARCHAR(255)',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        action: {
            type: 'VARCHAR(20)',
            notNull: true,
        },
        time: {
            type: 'TEXT',
            notNull: true,
        },
    });

    pgm.createIndex('playlist_songs_activities', ['playlist_id', 'song_id', 'user_id', 'action'], {
        unique: true,
    });
};

export const down = (pgm) => 
{
    pgm.dropIndex('playlist_songs_activities', ['playlist_id', 'song_id', 'user_id', 'action']);
    pgm.dropTable('playlist_songs_activities');
};
