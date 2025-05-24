export const up = (pgm) => 
{
    pgm.createTable('songs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        title: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
        },
        genre: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        performer: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        duration: {
            type: 'INTEGER',
            notNull: false,
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: false,
            references: 'albums',
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
    pgm.dropTable('songs');
};
