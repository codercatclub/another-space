var LOADING_MODELS = {};
var MODELS = {};


import { KTX2Loader } from 'super-three/examples/jsm/loaders/KTX2Loader.js';


const GLTFPart = {
  schema: {
    buffer: { default: true },
    part: { type: "string" },
    src: { type: "asset" },
  },

  update: function () {
    var el = this.el;
    if (!this.data.part && this.data.src) {
      return;
    }
    this.getModel(function (modelPart) {
      if (!modelPart) {
        return;
      }
      el.setObject3D("mesh", modelPart);
    });
  },

  /**
   * Fetch, cache, and select from GLTF.
   *
   * @returns {object} Selected subset of model.
   */
  getModel: function (cb) {
    var self = this;

    // Already parsed, grab it.
    if (MODELS[this.data.src]) {
      cb(this.selectFromModel(MODELS[this.data.src]));
      return;
    }

    // Currently loading, wait for it.
    if (LOADING_MODELS[this.data.src]) {
      return LOADING_MODELS[this.data.src].then(function (model) {
        cb(self.selectFromModel(model));
      });
    }

    // Not yet fetching, fetch it.
    LOADING_MODELS[this.data.src] = new Promise(function (resolve) {
      // const loadingManager = document.querySelector('a-assets').fileLoader.manager
      const renderer = document.querySelector('a-scene').renderer;

      console.log('[D] renderer', renderer)
    
      const loader = new THREE.GLTFLoader();

      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath('assets/libs/basis/');
      ktx2Loader.detectSupport( renderer );
      loader.setKTX2Loader(ktx2Loader)

      // basisLoader.detectSupport(renderer);
      // loadingManager.addHandler(/\.ktx2$/i, ktx2Loader);


      // const dracoLoader = new THREE.DRACOLoader();
      // dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
      // loader.setDRACOLoader(dracoLoader);

      loader.load(
        self.data.src,
        function (gltfModel) {
          var model = gltfModel.scene || gltfModel.scenes[0];
          MODELS[self.data.src] = model;
          delete LOADING_MODELS[self.data.src];
          cb(self.selectFromModel(model));
          resolve(model);
        },
        function () {},
        console.error
      );
    });
  },

  /**
   * Search for the part name and look for a mesh.
   */
  selectFromModel: function (model) {
    var mesh;
    var part;

    part = model.getObjectByName(this.data.part);
    if (!part) {
      console.error("[gltf-part] `" + this.data.part + "` not found in model.");
      return;
    }

    var root = part.clone(true);
    //mesh = part.getObjectByProperty('type', 'Mesh').clone(true);

    return root;
  },
};

export default GLTFPart;
