const THREE = AFRAME.THREE;

export default {
  schema: {
    envMapIntensity: { default: 1 },
    roughness: { default: 0 },
    metalness: { default: 1 },
    reflectivity: { default: 1 },
    color: { type: 'color', default: '#ffffff' }
  },

  init: function () {
    this.scene = this.el.sceneEl;
    this.renderer = document.querySelector('a-scene').renderer;
    let mql = window.matchMedia("(max-width: 768px)");
    if (mql.matches) {
      this.texSize = 256;
    } else {
      this.texSize = 1024;
    }
    if ("xr" in navigator) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        if (supported) {
          this.texSize = 256;
          this.initTex();
        } else {
          this.initTex();
        }
      });
    } else {
      this.initTex();
    }
  },

  initTex: function() {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( this.texSize, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
    // Create cube camera
    this.cubeCamera = new THREE.CubeCamera( 1, 100000, cubeRenderTarget );
    this.el.object3D.add(this.cubeCamera);

    this.el.sceneEl.addEventListener('chrome-mat-set', (evt) => {
      if(evt.detail.value !== this.mesh.name) {
        this.needEnvUpdate = true;
      }
    });

    this.mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.data.color),
      envMap: cubeRenderTarget.texture,
    });
    this.el.addEventListener("object3dset", () => {
      this.mesh = this.el.getObject3D("mesh");
      this.cubeCamera.position.copy( this.mesh.position );
      this.cubeCamera.position.y += 1.0;
      this.mesh.material = this.mat;
      this.needEnvUpdate = true;
      this.mesh.material.vertexColors = false;
      this.shouldEmitEvent = true;
    });
    this.update();
  },

  update: function () {
    if(this.mat) {
      this.mat.color = new THREE.Color(this.data.color);
      this.mat.roughness = this.data.roughness;
      this.mat.metalness = this.data.metalness;
      this.mat.reflectivity = this.data.reflectivity;
      this.mat.envMapIntensity = this.data.envMapIntensity;
    }
  },
  
  tick: function (time) {
    if (this.needEnvUpdate && !this.renderer.xr.enabled && this.mesh) {
      this.mesh.visible = false;
      this.cubeCamera.update(this.renderer, this.scene.object3D);
      this.mesh.visible = true;
      this.needEnvUpdate = false;
      if(this.shouldEmitEvent) {
        this.el.sceneEl.emit("chrome-mat-set",{value: this.mesh.name})
        this.shouldEmitEvent = false;
      }
    }
  },
};