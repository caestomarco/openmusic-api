export const up = (pgm) => 
{
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(255)',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(255)',
            notNull: true,
        },
        owner: {
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
};

export const down = (pgm) => 
{
    pgm.dropTable('playlists');
};
