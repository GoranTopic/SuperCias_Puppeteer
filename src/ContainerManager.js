export default class ContainerManager {
    /* the engine */
    constructor(docker){
        this.docker = docker;
        this.stopFunction = this.stopFunction;
        this.halt = false;
        this._stop = () => this.halt = true;
        this.containers = Array()
        this.successCallback = null;
        this.errorCallback = null;
        this.finishedCallback = null;
    }

    // setters
    setStopFunction = stopFunction => this.stopFunction = stopFunction 
    addContainer = container => this.containers.push(container);
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
        while( !this.halt ){
            for(var i = 0; i < this.containers.length; i++) {
                let container = this.containers[i];
                //console.log('containers: ', this.containers.length);
                let { State, Id } = await container.inspect()
                let { Status, ExitCode, Error } = State;
                if(Status === 'created'){
                    await container.start()
                //}else if(Status === 'running'){
                }else if(Status === 'exited'){
                    if(ExitCode === 1){ // there was a error
                        await this.errorCallback(container)
                    }else{ // Success
                        await this.successCallback(container)
                    }
                    await this.docker.delete_container(Id)
                    this.containers.splice(i, 1)
                    i--;
                }
            }
        }
    }



}

