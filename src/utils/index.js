const mapAlbumRecordToModel = ({ id, name, year, cover_url, songs, created_at, updated_at }) => ({
    id,
    name,
    year,
    coverUrl: cover_url,
    songs,
    createdAt: created_at,
    updatedAt: updated_at,
});

const mapSongRecordToModel = ({ id, title, year, performer, genre, duration, album_id, created_at, updated_at }) => ({
    id,
    title,
    year,
    genre,
    duration,
    performer,
    albumId: album_id,
    createdAt: created_at,
    updatedAt: updated_at,
});

const mapPlaylistRecordToModel = ({ id, name, username }) => ({
    id,
    name,
    username,
});

export { mapAlbumRecordToModel, mapSongRecordToModel, mapPlaylistRecordToModel };