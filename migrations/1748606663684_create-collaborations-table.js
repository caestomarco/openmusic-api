export const up = (pgm) => 
{
    pgm.createTable('collaborations', {
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
        user_id: {
            type: 'VARCHAR(255)',
            notNull: true,
            references: 'users(id)',
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

    pgm.createIndex('collaborations', ['playlist_id', 'user_id'], {
        unique: true,
    });
};

export const down = (pgm) => 
{
    pgm.dropIndex('collaborations', ['playlist_id', 'user_id']);
    pgm.dropTable('collaborations');
};
