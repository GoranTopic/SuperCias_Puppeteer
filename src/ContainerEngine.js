import Docker from 'dockerode'


// create docker instance
var docker = new Docker({host: '0.0.0.0', port: 3000})

/*
docker.createImage({fromImage: 'ubuntu'}, function (err, stream) {
  stream.pipe(process.stdout);
});
*/

/*
docker.run('supercias', ['bash', '-c', 'uname -a'], process.stdout)
    .then(function (data) {
        let [ response, container ] = data;
        container.attach({
            stream: true,
            stdout: true,
            stdin: true,
            stderr: true
        }, function handler(err, stream) {
            container.modem.demuxStream(stream, process.stdout, process.stderr);
            //...
        });
    })
    .catch( e => console.error(e) );

*/

/*
let auxContainer;
docker.createContainer({
    Image: 'supercias',
    name: 'supercias3',
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
    OpenStdin: false,
    StdinOnce: false
}, function(err, cont){
    console.log(err)
    console.log(cont)
}).then((container, err) => {
    console.log(container)
    console.log(err)
    auxContainer = container;
    console.log(auxContainer);
}).catch(err =>{
    console.error(err);
})
*/

/* delete all conatiners...
console.log(await docker.listContainers({ all: true }))
docker.listContainers({ all: true }, (err, containers) =>{
    if(err) console.error(err);
    //console.error(containers);
    containers.forEach( async cont => {
        //console.log(contInfo.Id);
        let container = docker.getContainer(cont.Id)
        let res = container.remove()
            .then( value  => console.log(value))
            .catch( e => console.error(err))
        console.log('res: ', res)
            
    })
})
*/




//console.log( (await docker.listImages()).map( ({ RepoTags, Id }) => ({RepoTags, Id})))


/*
docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash'], name: 'ubuntu-test'},
    function (err, container) {
        console.error(err)
        console.log(container)
        container.start(function (err, data) {
            console.error(err)
            console.error(data)
        });
    });

*/


//let image = await docker.buildImage('Dockerfile.tar', {t: 'supercia'});

let images = await docker.listImages({all:true});
Promise.all(
    images.map( async imageInfo => { 
        let { RepoTags, Id } = imageInfo;
        console.log(RepoTags, Id) 
        let [ tag ] = RepoTags;
        if(tag.startsWith('ubuntu')){
            let image = docker.getImage(Id)
            await image.remove({ force: true })
                .then( value  => console.log(value))
                .catch( e => console.error(e))
        }
    } )
)


/*
console.log(
    docker.createContainer({
        Image: 'ubuntu', 
        Cmd: ['/bin/bash'],
        name: 'testing',
        //Volumes: { "/home/telix/supercias/data/":"/home/pptruser/supercias/data", },
        cap_add: 'SYS_ADMIN',
    }, function (err, container) {
        if(err){
            console.error(err);
        }else{
            container.start(function (err, data) {
                console.log(data)
            });
        }
    })
)
*/

//console.log(stream)

/*
let stream = await docker.buildImage(
    { context: '/home/telix/supercias/', src: [ 'Dockerfile' ] },
    { t: 'supercias_image' },
    ( error, response ) => {
        console.log('response:', response);
        console.log('error:', error);
        return response
    }
);
*/

/*
await new Promise((resolve, reject) => {
  docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
});
*/

//await new Promise((resolve, reject) => { docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res)); });

/*
console.log( 
    (await docker.listImages()).map(
        ({ RepoTags, Id }) => ({RepoTags, Id})
    )
)
*/

//let image = (await docker.listImages())[2]

//console.log(image);
