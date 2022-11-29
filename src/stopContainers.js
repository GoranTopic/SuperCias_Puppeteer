import DockerAPI from './DockerAPI.js'

// create docker instance
let docker = new DockerAPI({host: '0.0.0.0', port: 4000});


let result = await docker.remove_all_containers({ force: true });

//await docker.delete_image('supercias:latest', { force: true });
