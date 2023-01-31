import DockerAPI from './DockerAPI.js'

// connecto to Docker instance
let docker = new DockerAPI({host: '0.0.0.0', port: 4000});


let containers = await docker.listContainers({ all: true });

console.log(`Number of containers: ${containers.length}`)
console.log(`Number of containers running:
    ${containers.filter(c => c.State === 'running').length}`)
containers.forEach( c =>
    console.log( {
        Names: c.Names,
        Command: c.Command,
        State: c.State,
        Status: c.Status,
    } )
)

