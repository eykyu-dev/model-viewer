    'use strict'

    import Input from "./input.js"
    import {PerspectiveCamera, OrthographicCamera} from "./camera.js"
    import {OrbitMovement, RaycastMovement} from './movement.js'

    class AppState
    {

        constructor( app )
        {

            this.app = app
            this.is_selecting = false
            // get list of ui indicators
            this.ui_categories = {

                "camera_mode":
                {

                    "fps": document.getElementById( "fpsCamMode" ),
                    "stationary": document.getElementById( "statCamMode" )

                },
                "projection_mode":
                {

                    "perspective": document.getElementById( "perspProjMode" ),
                    "orthographic": document.getElementById( "orthoProjMode" )

                },
                "selection":
                {

                    "raycasting": document.getElementById( "selectionRaycasting" ),
                    "target": document.getElementById( "selectionTarget" )

                },
                "shading":
                {

                    "g": document.getElementById( "gShading" ),
                    "p": document.getElementById( "pShading" ),
                    "flat": document.getElementById( "flatShading" ),
                }

            }

            // update ui with default values
            this.updateUI( "camera_mode", "stationary" )
            this.updateUI( "shading", "flat" )
            this.updateUI( "projection_mode", "perspective" )
            this.updateUI( "selection", "target" )
            document.getElementById("lighta").value = this.app.lights[0].ambient;
            document.getElementById("lightd").value = this.app.lights[0].Id;
            document.getElementById("lights").value = this.app.lights[0].Is;
            document.getElementById("lightpos").value = this.app.lights[0].position;
            this.a = document.getElementById("lighta").value
            this.d = document.getElementById("lightd").value
            this.s = document.getElementById("lights").value
            this.p = document.getElementById("lightpos").value
            this.ind = document.getElementById("lightslist").value;
        }

        /**
         * Updates the app state by checking the input module for changes in user input
         */
        update( )
        {
            // Shading Input
            if ( Input.isKeyDown( "f" ) ) {
                this.app.shader = this.app.flat_shader
                this.updateUI("shading", "flat")
            } else if ( Input.isKeyDown( "g" ) ) {
                this.app.shader = this.app.g_shader
                this.updateUI("shading", "g")
            } else if ( Input.isKeyDown( "p" ) ) {
                this.app.shader = this.app.p_shader
                this.updateUI("shading", "p")
            }
            // Camera Input
            if ( Input.isKeyDown( "o" ) ) {
                this.app.camera = new OrthographicCamera(this.app.camera.position, this.app.camera.look_at, this.app.camera.up, this.app.camera.fovy, this.app.camera.aspect, this.app.camera.near, this.app.camera.far)
                this.app.movement.camera = this.app.camera
                this.app.initCamera()
                this.updateUI("projection_mode", "orthographic")
            } else if ( Input.isKeyDown( "p" ) ) {
                this.app.camera = new PerspectiveCamera(this.app.camera.position, this.app.camera.look_at, this.app.camera.up, this.app.camera.fovy, this.app.camera.aspect, this.app.camera.near, this.app.camera.far)
                this.app.movement.camera = this.app.camera
                this.app.initCamera()
                this.updateUI("projection_mode", "perspective")
            }

            // Raycasting
            if ( Input.isKeyPressed( "r" ) && !this.is_selecting) {
                console.log("Raycast on")
                this.app.movement = new RaycastMovement(this.app)
                this.updateUI("selection", "raycasting")
                this.is_selecting = true
            } else if (Input.isKeyPressed( "r" ) && this.is_selecting) {
                this.app.movement = new OrbitMovement(this.app)
                this.updateUI("selection", "target", "No Target Selected")
                this.is_selecting = false
            }

            if (this.is_selecting && this.app.movement.selected_object)
                this.updateUI("selection", "target", "Selected '"+this.app.movement.selected_object.name+"'")
            
            if(this.a != document.getElementById("lighta").value || this.d != document.getElementById("lightd").value || this.s != document.getElementById("lights").value || this.p != document.getElementById("lightpos").value)
            {
                this.sendLightValues(document.getElementById("lightslist").value)
                this.a = document.getElementById("lighta").value
                this.d = document.getElementById("lightd").value
                this.s = document.getElementById("lights").value
                this.p = document.getElementById("lightpos").value
            }
            if(this.ind != document.getElementById("lightslist").value)
            {
                this.updateLights(document.getElementById("lightslist").value)
            }
        }

        sendLightValues(index)
        {
            let a = document.getElementById("lighta").value.split(",")
            let d = document.getElementById("lightd").value.split(",")
            let s = document.getElementById("lights").value.split(",")
            let p = document.getElementById("lightpos").value.split(",")
            let ambient_new = vec3.fromValues(a[0], a[1], a[2])
            let diffuse_new = vec3.fromValues(d[0], d[1], d[2])
            let spec_new = vec3.fromValues(s[0], s[1], s[2])
            let pos_new = vec3.fromValues(p[0], p[1], p[2])
            this.app.lights[index-1].ambient = ambient_new;
            this.app.lights[index-1].Id = diffuse_new;
            this.app.lights[index-1].Is = spec_new;
            if(this.app.lights[index-1].type == "point")
            {
                this.app.lights[index-1].position = pos_new;
            }
            if(this.app.lights[index-1].type == "direction")
            {
                this.app.lights[index-1].direction = pos_new;
            }

        }
        updateLights(index)
        {
            document.getElementById("lighta").value = this.app.lights[index-1].ambient;
            document.getElementById("lightd").value = this.app.lights[index-1].Id;
            document.getElementById("lights").value = this.app.lights[index-1].Is;
            if(this.app.lights[index-1].type == "point")
            {
                document.getElementById("lightpos").value = this.app.lights[index-1].position;
            }
            if(this.app.lights[index-1].type == "direction")
            {
                document.getElementById("lightpos").value = this.app.lights[index-1].direction;
            }
        }
        /**
         * Updates the ui to represent the current interaction
         * @param { String } category The ui category to use; see this.ui_categories for reference
         * @param { String } name The name of the item within the category
         * @param { String | null } value The value to use if the ui element is not a toggle; sets the element to given string 
         */
        updateUI( category, name, value = null )
        {

            for ( let key in this.ui_categories[ category ] )
            {

                this.updateUIElement( this.ui_categories[ category ][ key ], key == name, value )

            }

        }

        /**
         * Updates a single ui element with given state and value
         * @param { Element } el The dom element to update
         * @param { Boolean } state The state (active / inactive) to update it to
         * @param { String | null } value The value to use if the ui element is not a toggle; sets the element to given string 
         */
        updateUIElement( el, state, value )
        {

            el.classList.remove( state ? "inactive" : "active" )
            el.classList.add( state ? "active" : "inactive" )

            if ( state && value != null )
                el.innerHTML = value

        }

    }

    export default AppState
