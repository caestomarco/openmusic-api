const mapAlbumRecordToModel = ({ id, name, year, created_at, updated_at }) => ({
    id,
    name,
    year,
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

const mapPlaylistSongActivityRecordToModel = ({ id, playlist_id, song_id, user_id, action, time }) => ({
    id,
    playlistId: playlist_id,
    songId: song_id,
    userId: user_id,
    action,
    time,
});

export { mapAlbumRecordToModel, mapSongRecordToModel, mapPlaylistRecordToModel, mapPlaylistSongActivityRecordToModel };