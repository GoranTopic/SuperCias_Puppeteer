import Docker from 'Dockerode'


// create docker instance
var docker = new Docker();

//let dockerode = new Dockerode();

let stream = await docker.buildImage({
    context: '/home/telix/supercias/',
    src: [ 'Dockerfile' ] 
});

await new Promise((resolve, reject) => {
  docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
});
