module.exports = {
	"config": {
		"apiKey": "c2b08663-06e3-440c-ef6f-13978b42883a",
		"securityKey": "f26baf68-e3a9-45fc-effe-502e47116265",
		"organization_Id": "5de0387b12e200ea63204d6c",
		"host": "server.cocreate.app:8088"
	},

    "sources": [{
            "entry": "./docs/index.html",
            "collection": "files",
            "document_id": "60298d60e979fb17407e25bd",
            "key": "src",
            "data":{
                "name": "pickr Doc",
                "domains": ["cocreate.app", "server.cocreate.app", "ws.cocreate.app"],
                "path": "/docs/pickr"
            }
        }
    ],

	"extract": {
		"directory": "./src/",
		"extensions": [
			"js",
			"css",
			"html"
		],
		"ignores": [
			"node_modules",
			"vendor",
			"bower_components",
			"archive"
		]
	}
}

