export const up = (pgm) => 
{
    pgm.createTable('albums', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        year: {
            type: 'INTEGER',
            notNull: true,
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
    pgm.dropTable('albums');
};
