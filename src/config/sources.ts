export default () => ({
    basis_archive_photos: {
        mdsource: {
            baseurl: "http://host.docker.internal/resources/api/v1/search?",
            parameters: {
                "field[]": ["id", "rawData"],
                "filter[]": "ctrlnum:\"AT-OeAW-BA-3-27-P-*\"",
                "limit": 100,
            },
            rescountpath: "resultCount",
            recsetpath: "records",
            identifierpath: "id",
        },
        imgsource: [{
            baseurl: "https://opacbasis.acdh.oeaw.ac.at/wwwopac.ashx?",
            parameters: {
                command: "getcontent",
                server: "images",
                imageformat: "jpg",
                width: 500,
                height: 500,
                value: "${rawData['is_hierarchy_id']}.tif",
            },
        }],
        target: "/opt/thumbnails",
    },
});
