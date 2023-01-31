import Docker from 'dockerode';
import tar from 'tar';

class DockerAPI{
    constructor(args){
        // connect to docke insctance
        this.docker = new Docker(args)
    }

    /**
     * hasImage.
     *
     * todo: expand this function to include filters
     * from the docker api and accept image id etc..
     *
     * @param {} image_tag
     */
    has_image = async key => {
        let img_list = await this.docker.listImages()
        let hasSupecias_img = img_list.some(
            ({ RepoTags, Id }) => {
                if(RepoTags.some( repo => repo === key)) return true;
                if( Id === key) return true;
                return false;
            });
        return hasSupecias_img;
    }


    /**
     * has_container.
     *
     * return true if we have found the container
     *
     * @param {} key
     */
    has_container = async key => {
        let containers_info = await this.docker.listContainers({ all: true });
        let has_container = containers_info.some( 
            ({ Id, Names }) =>{
                if(Names.some(name => name === key)) return true;
                if( Id === key) return true;
                return false;
            }
        );
        return has_container;
    }




    /**
     * make_tar_file.
     * make a tar file, of the given files,
     *
     * @param String filename
     *  tar file name, excluding the .tar extension
     * @param [] files
     *  aray of file to tar
     */
    make_tar_file = async (filename, files) => {
        return await tar.c(
            { file: `${filename}.tar` }, files
        )
    }

    /**
     * delete_image.
     * delets a given image form a tag
     *
     * @param {} image_tag
     * @param {} args
     */
    delete_image = async (key=null, args={}) => {
        let img_list = await this.docker.listImages({all:true});
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
            let img = this.docker.getImage(img_info.Id);
            return img.remove(args);
        }else 
            console.error(`image '${key}' not found in Docker Daemon`);
    }


    stop_container  = async (key=null, args={}) => {
        let containers_info = await this.docker.listContainers({ all: true });
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
            let container = this.docker.getContainer(container_info.Id);
            return container.stop(args);
        }else 
            console.error(`container '${key}' not found in container`);
    }


    delete_container = async (key=null, args={}) => {
        let containers_info = await this.docker.listContainers({ all: true });
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
            let container = this.docker.getContainer(container_info.Id);
            return container.remove(args);
        }else
            console.error(`container '${key}' not found in container`);
    }


    remove_all_containers = async (args) => {
        let containers_info = await this.docker.listContainers({ all: true });
        await Promise.all(
            containers_info.map( async info => {
                let container = this.docker.getContainer(info.Id);
                if(info.State === 'running')
                    // if running stop first
                    await container.stop().then(
                        stream => {
                            let onFinished = container => container.remove(args);
                            this.docker.modem.followProgress(stream, onFinished);
                        })
                else
                    container.remove(args);
            })
        )
    }

    buildImage = async (...args) =>
        await new Promise( (resolve, reject) => {
            this.docker.buildImage(...args)
                .then(stream => {
                    stream.pipe(process.stdout)
                    let onFinished = () => resolve(true);
                    this.docker.modem.followProgress(stream, onFinished);
                }).catch( e => {
                    throw e
                    reject(e)
                })
        })

    run = (...args) =>
        this.docker.run(...args);

    listImages = (...args) =>
        this.docker.listImages(...args);

    listContainers = (...args) =>
        this.docker.listContainers(...args);

    createContainer = (...args) =>
        this.docker.createContainer(...args);

    getContainer = (...args) =>
        this.docker.getContainer(...args);

}

export default DockerAPI
