'use strict'

import Input from "./input.js"
import AppState from "./appstate.js"
import Shader from "./shader.js"
import { OrbitMovement } from "./movement.js"

class App
{

    constructor( scene )
    {

        console.log( "Initializing App" )

        // canvas & gl
        this.canvas = document.getElementById( "canvas" )
        this.canvas.addEventListener( "contextmenu", event => event.preventDefault( ) );
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
        this.gl = this.initGl( )

        // save the scene
        this.scene = scene.scene
        this.lights = scene.lights;
        // shaders
        console.log( "Loading Shaders" )
        this.flat_shader = new Shader( this.gl, "../shaders/flat.vert.glsl", "../shaders/flat.frag.glsl" )
        this.g_shader = new Shader( this.gl, "../shaders/g.vert.glsl", "../shaders/g.frag.glsl" )
        this.p_shader = new Shader( this.gl, "../shaders/p.vert.glsl", "../shaders/p.frag.glsl" )
        this.shader = this.g_shader

        // camera
        this.camera = scene.camera
        this.initCamera()

        // movement
        this.movement = new OrbitMovement( this, 0.4 )

        // resize handling
        this.resizeToDisplay( )
        window.onresize = this.resizeToDisplay.bind( this )

        // app state
        this.app_state = new AppState( this )
    }

    /**
     * Initialize the camera and update settings
     */
    initCamera( )
    {
        this.camera.aspect = this.canvas.width / this.canvas.height
        this.camera.canvas_height = this.canvas.height
        this.camera.canvas_width = this.canvas.width
        this.camera.update( )
    }

    /** 
     * Resizes camera and canvas to pixel-size-corrected display size
     */
    resizeToDisplay( )
    {

        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
        this.camera.canvas_height = this.canvas.height
        this.camera.canvas_width = this.canvas.width
        this.camera.aspect = this.canvas.width / this.canvas.height
        this.camera.update( )

    }

    /**
     * Initializes webgl2 with settings
     * @returns { WebGL2RenderingContext | null }
     */
    initGl( )
    {

        let gl = this.canvas.getContext( "webgl2" )

        if ( !gl )
        {
            alert( "Could not initialize WebGL2." )
            return null
        }

        gl.enable( gl.CULL_FACE ); // Turn on culling. By default backfacing triangles will be culled.
        gl.enable( gl.DEPTH_TEST ); // Enable the depth buffer
        gl.clearDepth( 1.0 );
        gl.clearColor( 1, 1, 1, 1 );
        gl.depthFunc( gl.LEQUAL ); // Near things obscure far things

        return gl
    }

    /**
     * Starts render loop
     */
    start( )
    {

        requestAnimationFrame( ( ) =>
        {

            this.update( )

        } )

    }

    /**
     * Called every frame, triggers input and app state update and renders a frame
     */
    update( )
    {

        this.app_state.update( )
        this.movement.update( )
        Input.update( )
        this.render( )
        requestAnimationFrame( ( ) =>
        {

            this.update( )

        } )

    }

    /**
     * Main render loop
     */
    render( )
    {

        // clear the screen
        this.gl.viewport( 0, 0, this.gl.canvas.width, this.gl.canvas.height )
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT )

        this._render( this.scene )

    }

    /**
     * Recursively renders the SceneNode hierarchy
     * 
     * @param {SceneNode} node node to render and process
     */
    _render( node )
    {
        this.shader.use( )
        // Model View
        const mv = mat4.mul(
            mat4.create( ),
            this.camera.view,
            node.getTransform( ) 
            )
        // global mvp
        const global_mat = mat4.mul(
            mat4.create( ),
            this.camera.view,
            this.scene.getTransform() 
            )
        // Projection
        const mvp = mat4.mul(
            mat4.create( ),
            this.camera.vp( ),
            node.getTransform( ) 
            )


        this.shader.setUniform4x4f( "global_matrix", global_mat)
        this.shader.setUniform4x4f( "u_mv_matrix", mv )
        this.shader.setUniform4x4f( "u_mvp_matrix", mvp )
        // Sets Lights
        for(let i = 0; i < 3; i++)
        {
            if(this.lights[i].type == "point")
            {
                this.shader.setUniform3f( `u_light[${i}].ambient`, this.lights[i].ambient )
                this.shader.setUniform3f( `u_light[${i}].id`, this.lights[i].Id )
                this.shader.setUniform3f( `u_light[${i}].is`, this.lights[i].Is )
                this.shader.setUniform3f( `u_light[${i}].position`, this.lights[i].position )
                this.shader.setUniform1f( `u_light[${i}].k`, this.lights[i].k )
                this.shader.setUniform1i( `u_light[${i}].type`, 1)
            }
            if(this.lights[i].type == "direction")
            {
                this.shader.setUniform3f( `u_light[${i}].ambient`, this.lights[i].ambient )
                this.shader.setUniform3f( `u_light[${i}].id`, this.lights[i].Id )
                this.shader.setUniform3f( `u_light[${i}].is`, this.lights[i].Is )
                this.shader.setUniform3f( `u_light[${i}].position`, this.lights[i].direction )
            }
        }


        node.render( this.gl, this.shader )

        for ( let child of node.children )
            this._render( child )
    }

}

export default App
