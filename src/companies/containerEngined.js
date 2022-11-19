import { ProxyRotator } from '../proxies.js'
import PromiseEngine from '../PromiseEngine.js';
import { read_json, mkdir } from '../utils/files.js';
import { Checklist, DiskList } from '../progress.js';
import options from '../options.js'
import { makeLogger } from '../logger.js'
import script from './script.js'

// options of browser
let browserOptions = options.browser;
// is debugging
let debugging = options.debugging;
// use proxies
let withProxy = options.proxyRotation;
// number of concorrent browsers
let concurrent = options.concurrent_processes;
// minutes until timeout , can be null
let minutesToTimeout = options.minutesToTimeout

async function main(){
    let engine = new PromiseEngine(concurrent);
    let proxy_r = new ProxyRotator();
    let ids = read_json('./data/mined/ids/company_ids.json')
    let checklist = new Checklist('companies', ids);
    let errored = new DiskList('errored_companies');
    let retries_max = options.triesWithProxies;

    mkdir('./data/resources/checklists/')
		
    // set timeout 1000ms * 60s * minutesToTimeout 
    // don't use the timeout from the promise engine, 
    // it make handeling with the timeout error so musch complicated
    //if(minutesToTimeout) engine.setTimeout( 1000 * 60 * minutesToTimeout );
    // use this.

    // create timeout process
    const create_promise = ( id, proxy, log, retries = 0 ) =>
        new Promise( async (resolve, reject) => {
            // run the script
            log(`Scraping ${id.name}`);
            log(`Company ${checklist.valuesDone()} out of ${checklist.values.length}`);
            let result = await script(id, proxy, log);
            if(result) resolve(result)
            else reject({
                error: new Error(`Could not finish scraping ${id.companies}`)
            });
        })

// create timeout process
const create_callback = ( id, proxy, log, retries = 0) =>
    result =>  {
        // if there was an error
        if(result instanceof Error || result?.error){ 
            // set proxy dead
            proxy && proxy_r.setDead(proxy);
            // stop trying if many tries
            if( retries > retries_max ) {
                console.error(`could not scrap: ${id}, throwing it into the trash`);
                errored.add(id);
                checklist.check(id);
                //throw new Error('Process rejected');
            }else{ // let's try it again 
                debugging && log("new Promised issued")
                return create_promise(id, proxy_r.next(), log, retries+1);
            }
        }else{ // proxy was successfull
            checklist.check(id);
            log(`${id.name} checked off`);
        }
    }

		// set promise next function
		engine.setNextPromise( () => {
				let id = JSON.parse(checklist.nextMissing());
				let proxy = proxy_r.next();
				let logger = makeLogger( withProxy? `[${proxy.proxy.split(':')[0]}]` : "", true);
				let promise = create_promise( id, proxy, logger );
				let callback = create_callback( id, proxy, logger );
				return [ promise, callback ];
		});

		//set stop function
		engine.setStopFunction( () => {
				if(proxy_r.getAliveList().length === 0) return true
				else return false
		})
		
		await engine.start() // done message
				.then(() => console.log("Engine done"))
}

main();
 
export default main
import Docker from 'dockerode'

// create docker instance
var docker = new Docker({host: '0.0.0.0', port: 3000})

// if image is not created
const img_list  = await docker.listImages()
let hasSupecias_img = img_list.some( 
    ({ RepoTags }) => RepoTags[0] === 'supercias:latest' 
);
console.log('hasSupecia_img:', hasSupecias_img);

if(!hasSupecias_img){ 
    // create image if img not found
    docker.buildImage('supercias.tar', {t: 'supercias'},
        function (err, stream) {
            stream.pipe(process.stdout)
        }
    );
}


/*
await docker.createImage({fromImage: 'ubuntu'}, function (err, stream) {
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



/*
// create container
let auxContainer;
await docker.createContainer({
    Image: 'supercias',
    name: 'supercias_container',
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
    OpenStdin: false,
    StdinOnce: false
}).then((container, err) => {
    console.log(container)
    console.log(err)
    auxContainer = container;
    console.log(auxContainer);
}).catch(err =>{
    console.error(err);
})
*/




// list all conatiners...
//console.log(await docker.listContainers({ all: true }));

// delete all conatiners...
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
