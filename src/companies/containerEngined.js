import { ProxyRotator } from '../proxies.js'
import PromiseEngine from '../PromiseEngine.js';
import { read_json, mkdir, fileExists } from '../utils/files.js';
import Checklist from '../progress/Checklist.js';
import DiskList  from '../progress/DiskList.js';
import options from '../options.js'
import DockerAPI from '../DockerAPI.js';
import { get_next_color } from '../logger.js'
//import script from './script.js'

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
// numbe rof retries per company
let retries_max = options.max_tries;

async function main(){
    let engine = new PromiseEngine(concurrent);
    let proxy_r = new ProxyRotator();
    let ids = read_json('./data/mined/ids/company_ids.json')
    let checklist = new Checklist('companies', ids, null, { recalc_on_check: false });
    let errored = new DiskList('errored_companies');
    let docker = new DockerAPI({host: 'localhost', port: 4000});

    // delete the image
    //await docker.delete_image('supercias:latest', { force: true });
    await docker.remove_all_containers({ force: false });
    // so that we can build a new one

    // let's check that the docker has the supercia img
    if(! await docker.has_image('supercias:latest')){
        // create image if img not found
        console.log('generating docker tar file...');
        await docker.make_tar_file('supercias', [
            'Dockerfile',
            'options.json',
            'package.json',
            'src'
        ]);
        // make docker image from tar file
        let result = await docker.buildImage('supercias.tar', {t: 'supercias'})
    }

    mkdir('./data/resources/checklists/')

    // set timeout 1000ms * 60s * minutesToTimeout 
    // don't use the timeout from the promise engine, 
    // it make handeling with the timeout error so musch complicated
    //if(minutesToTimeout) engine.setTimeout( 1000 * 60 * minutesToTimeout );
    // use this.

    // create timeout process
    const create_promise = (company, proxy, log_color, retries=0) =>
        new Promise( async (resolve, reject) =>
            // make a docker container
            await docker.run(
                'supercias',
                ['bash', '-c',
                    `npm run company ${company.id} ${proxy.proxy} ${log_color}`
                ], process.stdout,
                { //name: `supercias_cont_${company.id}_${retries}`, 
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
                        });
                        if(response.StatusCode === 1){
                            console.error(new Error(`Could not finish scraping ${company.name}`))
                            reject(false)
                        }else{
                            console.log(
                                `Company ${checklist.valuesDone()} out of ${checklist.values.length}`
                            );
                            resolve(true)
                        }
                    }).catch( e => { throw e } )
        )

    // create timeout process
    const create_callback = (company, proxy, log_color, retries = 0) =>
        result =>  {
            // if there was an error
            if(!result){
                // set proxy dead
                proxy && proxy_r.setDead(proxy);
                // stop trying if many tries
                if( retries > retries_max ) {
                    console.error(`could not scrap: ${company}, throwing it into the trash`);
                    errored.add(company);
                    checklist.check(company);
                    //throw new Error('Process rejected');
                }else{ // let's try it again 
                    debugging && console.log("new Promised issued")
                    return create_promise(company, proxy_r.next(), log_color, retries+1);
                }
            }else{ // proxy was successfull
                checklist.check(company);
                console.log(`${company.name} checked off`);
            }
        }

    // set promise next function
    engine.setNextPromise( () => {
        let company = JSON.parse(checklist.nextMissing());
        let proxy = proxy_r.next();
        let log_color = get_next_color()
        try{
            let promise = create_promise( company, proxy, log_color );
            let callback = create_callback( company, proxy, log_color );
            return [ promise, callback ];
        }catch(e){
            console.error(e);
            return null;
        }
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

