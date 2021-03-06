const THREE = AFRAME.THREE;

export default {
  schema: {},

  init: function () {
    this.isVR = false;

    this.cameraRig = this.el.object3D;

    //Default set up for browser
    this.controls = this.el.components["cc-keyboard-controls"];
    this.collisionSystem = this.el.components["collisions"];

    if ("xr" in navigator) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        if (supported) {
          this.el.sceneEl.addEventListener("enter-vr", (ent) => {
            this.isVR = true;
            this.controls = this.el.components["cc-vr-controls"];
          });
          this.el.sceneEl.addEventListener("exit-vr", (ent) => {
            this.isVR = false;
            this.controls = this.el.components["cc-keyboard-controls"];
          });
        }
      });
    }

    if (!this.controls) {
      console.log(
        "[-] Can not determine control component reference. Mover won't function properly."
      );
    }
  },

  teleportToZero: function () {
    this.cameraRig.position.set(0, 0, 0);
  },

  tick: function (time, timeDelta) {
    if (!this.controls) {
      return;
    }
    const moveAmt = this.controls.getMoveAmt(time, timeDelta);
    if (moveAmt) {
      let collided = this.collisionSystem.checkCollisions(this.cameraRig.position, moveAmt, timeDelta);
      if(!collided[0]) {
        this.cameraRig.position.add(moveAmt);
      } else {
        this.cameraRig.position.add(collided[1]);
      } 
    }
  },
};
