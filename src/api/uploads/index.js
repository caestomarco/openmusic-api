import UploadsHandler from "./handler.js";
import routes from "./routes.js";

export default {
    name: 'uploads',
    version: '1.0.0',
    register: async (server, { storageService, albumsService, validator }) =>
    {
        const uploadsHandler = new UploadsHandler(storageService, albumsService, validator);

        server.route(routes(uploadsHandler));
    },
};