const routes = (handler) => [
    {
        method: "GET",
        path: "/albums/{id}",
        handler: (request, h) => handler.getAlbumByIdHandler(request, h),
    },
    {
        method: "POST",
        path: "/albums",
        handler: (request, h) => handler.postAlbumHandler(request, h),
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
        path: "/albums",
        handler: (request, h) => handler.deleteAlbumsHandler(request, h),
    }
];

export default routes;