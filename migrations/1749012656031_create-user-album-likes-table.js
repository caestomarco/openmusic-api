export const up = (pgm) => 
{
    pgm.createTable('user_album_likes', {
        id: {
            type: 'VARCHAR(255)',
            primaryKey: true,
        },
        user_id: {
            type: 'VARCHAR(255)',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        album_id: {
            type: 'VARCHAR(255)',
            notNull: true,
            references: 'albums(id)',
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

    pgm.createIndex('user_album_likes', ['user_id', 'album_id'], {
        unique: true,
    });
};

export const down = (pgm) => 
{
    pgm.dropTable('user_album_likes');
};
