'use strict'

import SceneNode from "./scenenode.js"
import ObjectNode from "./object.js"
import {Material} from "./material.js"
import {PerspectiveCamera, OrthographicCamera} from "./camera.js"
import {pointLight, dLight} from "./lights.js"
/**
 * Clamps a number between two numbers
 * @param { Number } number The number to clamp
 * @param { Number } min The minimum used for clamping
 * @param { Number } max The maximum used for clamping
 * @returns { Number } The clamped number
 */
function clamp( number, min, max )
{

    return Math.max( min, Math.min( number, max ) )

}


/**
 * Converts degrees to radians
 * @param { Number } deg The number in degrees
 * @returns { Number }The angle in radians
 */
function deg2rad( deg )
{

    return ( deg * Math.PI ) / 180

}

/**
 * Converts a hex color string to a normalized rgba array
 * @param { String } hex The hex color as a string
 * @returns { Array<number> } The color as normalized values
 */
function hex2rgb( hex )
{

    let rgb = hex.match( /\w\w/g )
        .map( x => parseInt( x, 16 ) / 255 )
    return vec3.fromValues( rgb[ 0 ], rgb[ 1 ], rgb[ 2 ] )

}

/**
 * Returns the mouse coordinates relative to a clicking target, in our case the canvas
 * @param event The mouse click event
 * @returns { { x: number, y: number } } The x and y coordinates relative to the canvas
 */
 function getRelativeMousePosition( event )
 {
 
     let target = event.target
 
     // if the mouse is not over the canvas, return invalid values
     if ( target.id != 'canvas' )
     {
 
         return {
 
             x: Input.mousex,
             y: Input.mousey,
 
         }
 
     }
 
     target = target || event.target;
     let rect = target.getBoundingClientRect( );
 
     return {
 
         x: event.clientX - rect.left,
         y: event.clientY - rect.top,
 
     }
 
 }
/**
 * Loads a given URL; this is used to load the shaders from file
 * @param { String } url The relative url to the file to be loaded
 * @returns { String | null } The external file as text
 */
function loadExternalFile( url )
{

    let req = new XMLHttpRequest( )
    req.open( "GET", url, false )
    req.send( null )
    return ( req.status == 200 ) ? req.responseText : null

}

function parseLight(entry)
{
    let lights = []
    let ambient = vec3.fromValues(entry.ambient[0], entry.ambient[1], entry.ambient[2])
    for(let j = 0; j < entry.point_lights.length; j++)
    {
        let position = vec3.fromValues( entry.point_lights[j].position[ 0 ], entry.point_lights[j].position[ 1 ], entry.point_lights[j].position[ 2 ] )
        let Id = vec3.fromValues(entry.point_lights[j].Id[ 0 ], entry.point_lights[j].Id[ 1 ], entry.point_lights[j].Id[ 2 ] )
        let Is = vec3.fromValues(entry.point_lights[j].Is[ 0 ], entry.point_lights[j].Is[ 1 ], entry.point_lights[j].Is[ 2 ] )
        let k = entry.point_lights[j].k
        let light = new pointLight(ambient, position, Id, Is, k)
        lights.push(light)
    }
    for(let i = 0; i < entry.directional_lights.length; i++)
    {
        let direction = vec3.fromValues( entry.directional_lights[i].direction[ 0 ], entry.directional_lights[i].direction[ 1 ], entry.directional_lights[i].direction[ 2 ] )
        let Id = vec3.fromValues(entry.directional_lights[i].Id[ 0 ], entry.directional_lights[i].Id[ 1 ], entry.directional_lights[i].Id[ 2 ])
        let Is = vec3.fromValues(entry.directional_lights[i].Is[ 0 ], entry.directional_lights[i].Is[ 1 ], entry.directional_lights[i].Is[ 2 ])
        let light = new dLight(ambient, direction, Id, Is)
        lights.push(light)
    }
    return lights
}

function loadMtlFile(url)
{

    let raw = loadExternalFile( url )

    for ( let line of raw.split( '\n' ) )
    {

        switch ( line.split( ' ' )[ 0 ] )
        {

            case 'mtllib':
                return parseMTL(line)

        }
    }
}

function parseMTL( line )
{
    const elements = line.split( ' ' )
    return elements[1]

}

/**
 * Loads a given .obj file and builds an object from it with vertices, colors and normals
 * @param { String } url The url to the file
 * @param { Array.<Number> } fallback_color A default color to use if the OBJ does not define vertex colors
 * @returns { Array.<Number> } The complete, interleaved vertex buffer object containing vertices, colors and normals
 */
function loadObjFile( url, fallback_color )
{

    let raw = loadExternalFile( url )

    let vertices = [ ]
    let colors = [ ]
    let normals = [ ]
    let vertex_ids = [ ]
    let normal_ids = [ ]

    for ( let line of raw.split( '\n' ) )
    {

        switch ( line.split( ' ' )[ 0 ] )
        {

            case 'v':
                parseObjVertex( line, vertices )
                parseObjColor( line, colors, fallback_color )
                break
            case 'vn':
                parseObjNormal( line, normals )
                break
            case 'f':
                parseObjIds( line, vertex_ids, normal_ids )

        }
    }
    //Creates normal list containing all normals for index x
    let normal_test = []
    
    for ( let g = 0; g < vertices.length/3; g++)
    {
        normal_test[g] = vec3.create()
    }
    //adds all normals for specific vertex
    for ( let i = 0; i < vertex_ids.length; i++ )
    {
        const nid = ( normal_ids[ i ] * 3 )
        vec3.add(normal_test[vertex_ids[i]], normal_test[vertex_ids[i]], vec3.fromValues(normals[nid], normals[nid+1], normals[nid+2]))
    }
    //divides by vertex normals
    for( let i = 0; i < normal_test.length; i++)
    {
        vec3.normalize(normal_test[i], normal_test[i])
    }
    let data = [ ]
    for ( let i = 0; i < vertex_ids.length; i++ )
    {

        const vid = ( vertex_ids[ i ] * 3 )

        data.push( vertices[ vid ], vertices[ vid + 1 ], vertices[ vid + 2 ] )
        data.push( colors[ vid ], colors[ vid + 1 ], colors[ vid + 2 ] )
        data.push( normal_test[vertex_ids[i]][0], normal_test[vertex_ids[i]][1], normal_test[vertex_ids[i]][2] )
    }
    return data

}

/**
 * Parses a given object vertex entry line
 * @param { String } entry A line of an object vertex entry
 * @param { Array.<Number> } list The list to write the parsed vertex coordinates to
 */
function parseObjVertex( entry, list )
{

    const elements = entry.split( ' ' )
    if ( elements.length < 4 )
        alert( "Unknown vertex entry " + entry )

    list.push( parseFloat( elements[ 1 ] ), parseFloat( elements[ 2 ] ), parseFloat( elements[ 3 ] ) )

}

/**
 * Parses a given object color entry line
 * @param { String } entry A line of an object color entry
 * @param { Array.<Number> } list The list to write the parsed vertex colors to
 * @param { Array.<Number> } fallback_color A fallback color in case the OBJ does not define vertex colors
 */
function parseObjColor( entry, list, fallback_color )
{

    const elements = entry.split( ' ' )
    if ( elements.length < 7 )
    {

        list.push( fallback_color[ 0 ], fallback_color[ 1 ], fallback_color[ 2 ] )
        return

    }

    list.push( parseFloat( elements[ 4 ] ), parseFloat( elements[ 5 ] ), parseFloat( elements[ 6 ] ) )

}

/**
 * Parses a given object normal entry line
 * @param { String } entry A line of an object normal entry
 * @param { Array.<Number> } list The list to write the parsed vertex normals to
 */
function parseObjNormal( entry, list )
{

    const elements = entry.split( ' ' )
    if ( elements.length != 4 )
        alert( "Unknown normals entry " + entry )

    list.push( parseFloat( elements[ 1 ] ), parseFloat( elements[ 2 ] ), parseFloat( elements[ 3 ] ) )

}

/**
 * Parses a given object ids entry line
 * @param { String } entry A line of an object ids entry
 * @param { Array.<Number> } vertex_ids The list of vertex ids to write to
 * @param { Array.<Number> } normal_ids The list normal ids to write to
 */
function parseObjIds( entry, vertex_ids, normal_ids )
{

    const elements = entry.split( ' ' )
    if ( elements.length != 4 )
        alert( "Unknown face entry " + entry )

    for ( let element of elements )
    {

        if ( element == 'f' )
            continue

        const subelements = element.split( '/' )

        vertex_ids.push( parseInt( subelements[ 0 ] ) - 1 )
        normal_ids.push( parseInt( subelements[ 2 ] ) - 1 )

    }

}

/**
 * Loads a scene file and triggers the appropriate parsing functions
 * @param { String } url The url to the scene file
 * @returns An object containing information about the camera, the light and the scene
 */
function loadSceneFile( url )
{

    let raw = loadExternalFile( url )

    let scene_description = JSON.parse( raw )

    return {

        "camera": parseCamera( scene_description[ "camera" ] ),
        "scene": parseSceneNode( scene_description[ "root" ], null ),
        "lights": parseLight( scene_description[ "lights" ])
    }
}

/**
 * Parses a given camera entry
 * @param { TODO } entry An entry containing information on a single camera
 * @returns A camera instance with the camera read from the scene file
 */
function parseCamera( entry )
{

    let camera = null

    let position = vec3.fromValues( entry.position[ 0 ], entry.position[ 1 ], entry.position[ 2 ] )
    let lookat = vec3.fromValues( entry.lookat[ 0 ], entry.lookat[ 1 ], entry.lookat[ 2 ] )
    let up = vec3.fromValues( entry.up[ 0 ], entry.up[ 1 ], entry.up[ 2 ] )
    let fov = entry.fov

    if ( entry.type == "perspective" )
    {

        camera = new PerspectiveCamera( position, lookat, up, fov )

    }
    else if ( entry.type == "orthographic" )
    {

        camera = new OrthographicCamera( position, lookat, up, fov )

    }

    return camera

}


/**
 *  Recursively parses a SceneNode and its children
 * @param { Object } entry An entry from the JSON config representing a SceneNode
 * @param { Object | null } parent The parent node of the current SceneNode
 * @returns { SceneNode } The parsed SceneNode object
 */
function parseSceneNode( entry, parent )
{

    let node = null

    let name = entry.name
    let translation = vec3.fromValues( entry.translation[ 0 ], entry.translation[ 1 ], entry.translation[ 2 ] )
    let rotation = vec3.fromValues( entry.rotation[ 0 ], entry.rotation[ 1 ], entry.rotation[ 2 ] )
    let scale = vec3.fromValues( entry.scale[ 0 ], entry.scale[ 1 ], entry.scale[ 2 ] )

    if ( entry.type == 'node' )
    {
        node = new SceneNode( name, parent, translation, rotation, scale )

    }
    else if ( entry.type == 'object' )
    {

        const fallback_color = hex2rgb( entry.color )
        const obj_content = loadObjFile( entry.obj, fallback_color )
        const material = new Material(loadMtlFile(entry.obj))
        node = new ObjectNode( obj_content, name, parent, translation, rotation, scale, material)

    }

    for ( let child of entry.children )
        node.children.push( parseSceneNode( child, node ) )

    return node

}

export
{

    clamp,
    deg2rad,
    hex2rgb,
    getRelativeMousePosition,
    loadExternalFile,
    loadObjFile,
    loadSceneFile

}
