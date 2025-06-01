export const up = (pgm) => 
{
    pgm.createTable('users', {
        id: {
            type: 'VARCHAR(255)',
            primaryKey: true,
        },
        username: {
            type: 'VARCHAR(255)',
            notNull: true,
            unique: true,
        },
        password: {
            type: 'TEXT',
            notNull: true,
        },
        fullname: {
            type: 'TEXT',
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
    pgm.dropTable('users');
};
