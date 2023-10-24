import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import fragmentShader1 from './shaders/fragment1.glsl'

import vertexShader from './shaders/vertex.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
 

import landscape from './Screenshot (198).png'
import { postprocessing } from './postprocessing'

export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x111111, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 1000
		)
 
		this.camera.position.set(0, 0, 2) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.mouse = 0


		this.isPlaying = true
		this.settings()
		this.addObjects()		 
		this.mouseEvent()
 
		this.addPost()
		this.resize()
		this.render()
		this.setupResize()
 
	}
	mouseEvent() {
		this.lastX = 0
		this.lastY = 0
		this.speed = 0
		document.addEventListener('mousemove', e=> {
			this.speed = (e.pageX - this.lastX) *.1
			this.lastX = e.pageX
		})
	}
	addPost() {
		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(new RenderPass(this.scene, this.camera))
		this.customPass = new ShaderPass(postprocessing)
		this.customPass.uniforms['resolution'].value = new THREE.Vector2(this.width, this.height)
		this.customPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio)
		this.composer.addPass(this.customPass)
	}

	settings() {
		let that = this
		this.settings = {
			howmuch: 1
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'howmuch', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height
		this.composer.setSize(this.width, this.height)

		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		let t =  new THREE.TextureLoader().load(landscape)
		t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				landscape: {value: t},
				mouse: {value: 0},

				resolution: {value: new THREE.Vector4()}
			},
			vertexShader,
			// wireframe: true,
			fragmentShader
		})

		this.material1 = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				landscape: {value: t},
				mouse: {value: 0},
				resolution: {value: new THREE.Vector4()}
			},
			vertexShader: vertexShader,
			// wireframe: true,
			fragmentShader: fragmentShader1
		})
		
		
		this.geometry = new THREE.IcosahedronGeometry(1,1)
		this.geometry1 = new THREE.IcosahedronGeometry(1.001,1)

		let length = this.geometry1.attributes.position.array.length

		let bary = []
		
		for (let i = 0; i < length / 3; i++) {
			bary.push(0,0,1, 0,1,0 , 1,0,0)	
			
		}
		
		let aBary = new Float32Array(bary)




		this.geometry1.setAttribute('aBary', new THREE.BufferAttribute(aBary, 3),)


		this.ico = new THREE.Mesh(this.geometry1, this.material)
		this.icoLines = new THREE.Mesh(this.geometry1, this.material1)
 
		this.scene.add(this.ico)
		this.scene.add(this.icoLines)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.001
		this.mouse -= (this.mouse - this.speed) * 0.05
		this.mouse *= 0.99

		this.scene.rotation.x = this.time
		this.scene.rotation.y = this.time
		this.customPass.uniforms.time.value = this.time
		this.customPass.uniforms.howmuch.value = this.mouse

		this.material.uniforms.time.value = this.time
		this.material1.uniforms.time.value = this.time
		 

		this.material.uniforms.mouse.value = this.mouse
		this.material1.uniforms.mouse.value = this.mouse


		//this.renderer.setRenderTarget(this.renderTarget)
		// this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
		this.composer.render()
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 