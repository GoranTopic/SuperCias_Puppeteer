import moment from 'moment';

export default class ContainerManager {
    /* the engine */
    constructor(docker){
        this.docker = docker;
        this.stopFunction = this.stopFunction;
        this.halt = false;
        this._stop = () => this.halt = true;
        this.containers = Array()
        this.concurrent = 0;
        this.successCallback = null;
        this.errorCallback = null;
        this.finishedCallback = null;
    }

    // setters
    setStopFunction = stopFunction => this.stopFunction = stopFunction;
    setConcurrent = concurrent => this.concurrent = concurrent;
    addContainer = container => this.containers.push(container);
    setNextContainer = nextContainer => this.nextContainer;
    setTimeout =  timeout  => this.timeout = timeout;
    whenSuccess = callback => this.successCallback = callback;
    whenError = callback => this.errorCallback = callback;
    whenTimedOut = callback => this.timeoutCallback = callback;
    whenFinished = callback => this.finishedCallback = callback;

    // this is a timeout 
    _timeoutAfter = timeout => new Promise(
        (resolve, reject) => {
            setTimeout(() => reject( new Error(`timed out`) ), timeout);
        }
    )

    async start(){
        let result;
        //if no stop function as been set run forever
        if(this.stopFunction === null) this.stopFunction = () => false;
        else this.halt = this.stopFunction();
        // create promises
        var prev_cont_count = this.containers.length;
        var i = 0 ;
        while( !this.halt ){
            //add more container if this.concurrent is set
            if( i === this.containers.length < this.containers)
                for(let e=0; e < this.concurrent - prev_cont_count; e++)
                    this.addContainer(await this.nextContainer())
            //main loop
            for(i = 0; i < this.containers.length; i++) {
                let container = this.containers[i];
                //console.log('containers: ', this.containers.length);
                let { State, Id, Created } = await container.inspect();
                let { Status, ExitCode, Error } = State;
                if(Status === 'created'){
                    // if the container was just created
                    await container.start()
                }else if(Status === 'running'){
                    // if the container is running
                    var now = moment(new Date())
                    var date = moment(Created);
                    var duration = now.diff(date, 'minutes');
                    let timeout = 25;
                    if(duration > timeout){
                        console.log(`Cotainer took more than ${timeout} minutes, stopping container`);
                        await this.docker.stop_container(Id);
                    }
                }else if(Status === 'exited'){
                    // if the container was finished
                    if(ExitCode === 1){ // there was a error
                        await this.errorCallback(container);
                    }else{ // Success
                        await this.successCallback(container);
                    }
                    await this.docker.delete_container(Id);
                    this.containers.splice(i, 1);
                    i--;
                }
            }
        }
    }



}

