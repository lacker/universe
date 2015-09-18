class Scene {
  constructor() {
    this.scene = null;
    this.elements = {};

    window.elements = this.elements;
  }

  setScene(scene) {
    this.scene = scene;
  }

  add(id, element) {
    this.elements[id] = element;
  }

  get(id) {
    return this.elements[id];
  }

  getParent(id) {
    var rootPieces = id.split('.');
    if (rootPieces.length < 3) {
      return this.scene;
    }
    var parentId = rootPieces.slice(0, -1).join('.');
    return this.get(parentId);
  }

  remove(id) {
    delete this.elements[id];
  }
}

var singleton = new Scene();

export default singleton;
