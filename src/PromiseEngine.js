export default class ContainerEngine {
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
        for( let i = 0; i < this.containers.length; i++ )
             console.log(this.containers[i]);

        /*
            // start the loop
        while( !this.halt ){
            // check all processes
            await Promise.allSettled( this.promises )
                .then(() => {
                    try{ // if all all have settled
                        // if there is no process active
                        for( let i = 0; i < this.promises.length; i++ )
                            // for every every processes
                            if(this.promises[i].isResolved()){
                                // set new promise to none
                                let newPromise = null;
                                // if the promise has been resolved
                                if(this.resolvedCB){ //if ther is has a resolved cb, run it
                                    newPromise = this.resolvedCB( this.promises[i].getValue(), this._stop );
                                    // only overwrite if it returns something
                                    if(result) newPromise = result;
                                }
                                // if the promise as an attached callback
                                if(this.promises[i].callback){
                                    result = this.promises[i].callback(); 
                                    if(result) newPromise = result;
                                }
                                // add it as a new promise
                                // if promise if rejected
                                if(this.promises[i].isRejected()) // if there was an error
                                    if(this.rejectionCB){ // if a new promise has been returned
                                        result = this.rejectionCB( this.promises[i].getValue(), this._stop );
                                        // only overwrite if it returns something
                                        if(result) newPromise = result ;
                                    }
                                // if it was successfull
                                if(this.promises[i].isFulfilled())
                                    if(this.fulfillmentCB){ // if a new promise has been returned
                                        result = this.fulfillmentCB( this.promises[i].getValue(), this._stop );
                                        // only overwrite if it returns something
                                        if(result) newPromise = result;
                                    }
                                // if no new promise has been set
                                if( this.halt === false ){
                                    if(this._isPromise(newPromise)) // if new promise has been passed
                                        this.promises[i] = this._promiseMonitor(newPromise);
                                    else // get new one
                                        this.promises[i] = this._promiseMonitor( this._getNewPromise() );
                                }
                            }
                        // run stop function
                        if(this.halt === false ) this.halt = this.stopFunction();
                        // is this working?
                        if(this.promises.every(p => p.isResolved())) this.halt = true;
                    }catch(e){
                        this.halt = true;
                        console.error(e);
                    }
                })
        }
        */
        
    }
}

