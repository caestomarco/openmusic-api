const routes = (handler) => [
    {
        method: "GET",
        path: "/albums/{id}",
        handler: (request, h) => handler.getAlbumByIdHandler(request, h),
    },
    {
        method: "GET",
        path: "/albums/{id}/likes",
        handler: (request, h) => handler.getAlbumLikesHandler(request, h),
    },
    {
        method: "POST",
        path: "/albums",
        handler: (request, h) => handler.postAlbumHandler(request, h),
    },
    {
        method: "POST",
        path: "/albums/{id}/likes",
        handler: (request, h) => handler.postAlbumLikeHandler(request, h),
        options: {
            auth: 'openmusic_jwt'
        }
    },
    {
        method: "PUT",
        path: "/albums/{id}",
        handler: (request, h) => handler.putAlbumByIdHandler(request, h),
    },
    {
        method: "DELETE",
        path: "/albums/{id}",
        handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
    },
    {
        method: "DELETE",
        path: "/albums/{id}/likes",
        handler: (request, h) => handler.deleteAlbumLikeHandler(request, h),
        options: {
            auth: 'openmusic_jwt'
        }
    },
    {
        method: "DELETE",
        path: "/albums",
        handler: (request, h) => handler.deleteAlbumsHandler(request, h),
    }
];

export default routes;