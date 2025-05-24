const mapAlbumRecordToModel = ({ id, name, year, created_at, updated_at }) => ({
    id,
    name,
    year,
    createdAt: created_at,
    updatedAt: updated_at,
});

const mapSongRecordToModel = ({ id, title, year, performer, genre, duration, albumId, created_at, updated_at }) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
    createdAt: created_at,
    updatedAt: updated_at,
});

export { mapAlbumRecordToModel, mapSongRecordToModel };
