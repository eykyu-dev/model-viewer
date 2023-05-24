import
{
    loadExternalFile
}
from "./utils.js"

class Material
{
    constructor(name)
    {
        let url = "../objects/" + name
        let raw = loadExternalFile( url )

        for ( let line of raw.split( '\n' ) )
        {
    
            switch ( line.split( ' ' )[ 0 ] )
            {
                case 'Ka':
                    this.ka = this.parseK( line)
                    break
                case 'Ks':
                    this.ks = this.parseK( line)
                    break
                case 'Kd':
                    this.kd = this.parseK( line)
                    break
                case 'Ns':
                    this.ns = this.parseNs(line)
            }
        }
    }

    parseK( entry )
    {
        const elements = entry.split( ' ' )
        return vec3.fromValues(parseFloat( elements[ 1 ] ), parseFloat( elements[ 2 ] ), parseFloat( elements[ 3 ] ))
    }

    parseNs( entry )
    {
        const elements = entry.split( ' ' )
        return (parseFloat(elements[1]))
    }

}

export
{
    Material  
}