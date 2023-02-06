import { ProxyRotator } from '../proxies.js'
import ContainerManager  from '../ContainerManager.js';
import { read_json, mkdir, fileExists } from '../utils/files.js';
import Checklist from '../progress/Checklist.js';
import DiskList  from '../progress/DiskList.js';
import DockerAPI from '../DockerAPI.js';
import { get_next_color } from '../logger.js'
import options from '../options.js'

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
// get the data directory
let data_directory = options.host_data_dir;
// get the inside data directory
let container_data_dir = options.inside_container_data_dir;

async function main(){
    // connect with docker daemon
    let docker = new DockerAPI({host: 'localhost', port: 4000});
    // pass docker to container engine
    let manager = new ContainerManager(docker);
    let errored = new DiskList('errored_companies');
    let proxy_r = new ProxyRotator();
    let ids = read_json( data_directory + '/mined/ids/company_ids.json')
    let checklist = new Checklist('companies', ids, null,
        { recalc_on_check: false });

    console.log('data_directoy:', data_directory)
    console.log('constainer_data_dir:', container_data_dir)

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

    mkdir( data_directory + '/resources/checklists/')


    const create_container = async ({ company, proxy, log_color }) => {
        // make a docker container
        let result_container;
        await docker.createContainer({
            Image: 'supercias',
            //name: 'supercias_container',
            CapAdd: 'SYS_ADMIN',
            AutoRemove: false,
            Cmd: ['bash', '-c',
                `npm run company ${company.id} ${proxy.proxy} ${log_color}`
            ],
            Mounts: [{
                "Target":   container_data_dir,
                "Source":   data_directory,
                "Type":     "bind",
                "ReadOnly": false
            }]
        }).then( container => {
            container.attach(
                {stream: true, stdout: true, stderr: true}, 
                (err, stream) =>
                //dockerode may demultiplex attach streams for you :)
                container.modem.demuxStream(
                    stream, process.stdout, process.stderr
                )
            );
            result_container = container;
        }).catch( e => { throw e } )
        // return container
        return result_container;
    }

	// get next container
	const getNextContainer = async params => {
		let nextMissing = checklist.nextMissing();
		if(nextMissing){
			params = params ?? {
				company: JSON.parse(nextMissing),
				proxy: proxy_r.next(),
				log_color: get_next_color(),
				retries: 0,
			}
			let container =  await create_container( params )
			container.params = params
			return container;
		}else
			return null;
	}


    // set number of 
    manager.setConcurrent(concurrent)

    // set new promise creator
    manager.setNextContainer(getNextContainer)


	// if the container succeded, create a new container and
	// add it to the container manager
	manager.whenSuccess( async container => {
		let { company } = container.params
		console.log(`${company.name} succeded`);
		console.log(
			`Company  ${checklist.valuesDone()} out of ${checklist.values.length}`
		);
		checklist.check(company);
		container = await getNextContainer();
		// add it to the engine
		manager.addContainer(container);
	})

	// if it error, make proxy as dead, 
	// add company to error pile, if to many tries
	// retry if errors are low
	manager.whenError( async container => {
		let { params } = container;
		console.log(`container ${params.company.name} errored`);
		// set the proxy as dead
		withProxy && proxy_r.setDead(params.proxy);
		// stop trying if many tries
		if( params.retries > retries_max ) {
			console.error(`Adding: ${params.company.name} to error list`);
			// check it off the list
			checklist.check(params.company);
			// added to the errored pile
			errored.add(params.company);
			// make a new container
			container = await getNextContainer();
			// add it to the engine
			if(container) manager.addContainer(container);
		}else{ // let's try it again 
			debugging && console.log(`retrying ${params.company}`)
			// add a strike to the error count
			params.retries += 1;
			// get new proxy
			params.proxy = proxy_r.next();
			// create a container with the same params
			container = await getNextContainer(params);
			// add it to the 
			manager.addContainer(container);
		}
	})

    //set stop function
    manager.setStopFunction( () => {
        if(proxy_r.getAliveList().length === 0) return true
        else return false
    })

    for(var i = 0; i < concurrent; i++) {
        // create new container
        let container = await getNextContainer()
        // add it to the engine   
	manager.addContainer(container);
    }

    manager.start() // done message
        .then(() => console.log("Engine stoped"))
}

main();

