import DockerAPI from './DockerAPI.js'

// create docker instance
let docker = new DockerAPI({host: '0.0.0.0', port: 4000});

let [ id, proxy, log_color ] = ['704517', '192.177.191.3:3128', 'green']

let result = await docker.remove_all_containers({ force: false });

await docker.delete_image('supercias:latest', { force: true });

//console.log('this ran')

// create container, and attach stdout
/*
let auxContainer;
await docker.createContainer({
    Image: 'supercias',
    //name: 'supercias_container',
    CapAdd: 'SYS_ADMIN',
    AutoRemove: false,
    Cmd: ['/bin/bash', '-c', 'ls -la'],
    Mounts: [{
        "Target":   "/home/pptruser/supercias/data",
        "Source":   "/home/telix/supercias/data",
        "Type":     "bind",
        "ReadOnly": false
    }]
}).then( container => {
    container.attach(
        {stream: true, stdout: true, stderr: true}, 
        function (err, stream) {
            //dockerode may demultiplex attach streams for you :)
            container.modem.demuxStream(
                stream, process.stdout, process.stderr
            );
        });
    auxContainer = container;
    return container
}).catch( e => { throw e } )

result = await auxContainer.inspect()
console.log(result.State);

await auxContainer.start()

result = await auxContainer.inspect()
console.log(result.State);

let loop = true
while(loop){
    let result = await auxContainer.inspect()
    let { Running } = result.State
    if(Running === false){
        loop = false;
        console.log(result.State);
    }
}
*/

/*
await docker.createImage({fromImage: 'ubuntu'}, function (err, stream) {
    stream.pipe(process.stdout);
});
*/

// list all conatiners...
//console.log(await docker.listContainers({ all: true }));


/*
const result = await new Promise( async (resolve, reject) => {
    // make a docker container
    await docker.run(
        'supercias', 
        ['bash', '-c', 
            `npm run company ${id} ${proxy} ${log_color}`
        ], process.stdout,
        { name: `supercias_cont_${id}`, 
            HostConfig: { 
                AttachStdin: true, 
                AttachStdout: true, 
                AttachStderr: true, 
                CapAdd:'SYS_ADMIN',
                tty: true, 
                AutoRemove: true,
                Mounts: [
                    {
                        "Target":   "/home/pptruser/supercias/data",
                        "Source":   "/home/telix/supercias/data",
                        "Type":     "bind", 
                        "ReadOnly": false
                    }],
            }}).then(async function (data) {
                let [ response, container ] = data;
                await container.attach({
                    stream: true,
                    stdout: true,
                    stdin: true,
                    stderr: true
                }, function handler(err, stream) {
                    container.modem.demuxStream(stream, process.stdout, process.stderr);
                });
                if(response.StatusCode === 1){
                    console.error(new Error(`Could not finish scraping ${id}`))
                    reject(false)
                }else{
                    console.log( `Company scrapped`);
                    resolve(true)
                }
            }).catch( e => { throw e } )
})
console.log('result:', result);
*/


/*
const delete_image = async (key=null, args={}) => {
    let img_list = await docker.listImages({all:true});
    if(img_list.length <= 0 )
        console.error('There are no images in the Docker Deamon');
    let img_info = key === null? 
        img_list[0] : 
        img_list.find( ({ RepoTags, Id }) => {
            if(RepoTags.some( repo => repo === key)) return true;
            if( Id === key) return true;
            return false;
        });
    if(img_info){
        let img = docker.getImage(img_info.Id);
        return img.remove(args);
    }else 
        console.error(`image '${image_tag}' not found in container`);
}

delete_image()
*/


/*
const stop_container  = async (key=null, args={}) => {
    let containers_info = await docker.listContainers({ all: true });
    console.log(containers_info.length)
    if(containers_info.length <= 0 )
        console.error('There are no containers in Docker Deamon');
    let container_info = key === null? 
        containers_info[0] : 
        containers_info.find( 
            ({ Id, Names }) =>{
                if(Names.some(name => name === key)) return true;
                if( Id === key) return true;
                return false;
            }
        );
    if(container_info){
        let container = docker.getContainer(container_info.Id);
        return container.stop(args);
    }else 
        console.error(`container '${key}' not found in container`);
}

stop_container()
*/


// list all conatiners...
//console.log(await docker.listContainers({ all: true }));

// get container
/*
let container = await docker.listContainers({ all: true })
    .then( containerInfo => docker.getContainer(containerInfo[0].Id) )
    .catch( e => console.error(e) );
    */
//console.log(await container.start())


// docker run comand
/*
let result = await docker.run('supercias', 
    ['/bin/bash', '-c',  `
    touch data/mined/delte.me && echo "it worked"
        `], 
    process.stdout, 
    { name: 'supercias_cont', 
        HostConfig: { 
            AttachStdin: true, 
            AttachStdout: true, 
            AttachStderr: true, 
            Privileged: true,
            CapAdd:'SYS_ADMIN',
            tty: true, 
            AutoRemove: true,
            Mounts: [
                {
                    "Target":   "/home/pptruser/data",
                    "Source":   "/home/telix/supercias/data",
                    "Type":     "bind", 
                    "ReadOnly": false
                }],
        }}
);
//stream.pipe(process.stdout);
*/






// list all conatiners...
//console.log(await docker.listContainers({ all: true }));

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

// list all conatiners...
//console.log(await docker.listContainers({ all: true }));



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



/*
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
*/


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


//console.log(image);
