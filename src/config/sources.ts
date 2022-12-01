export default () => ({
    basis_archive: {
        vufind: {
            baseurl: "http://host.docker.internal/resources/api/v1/search?",
            parameters: {
                "field[]": ["id", "urls"],
                "filter[]": ["collection:\"archive_basis\""],
                "limit": 100,
            },
        },
        images: {
            baseurl: "http://localhost/resources/api/v1/search?",
            parameters: {
                "field[]": ["id", "urls"],
                "filter[]": ["collection:\"archive_basis\""],
                "limit": 100,
            },
        },
        target: "/opt/thumbnails/basis_archive",
    },
});
