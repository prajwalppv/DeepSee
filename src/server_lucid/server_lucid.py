import flask
from flask_cors import CORS, cross_origin
import base64
from flask import request
from semanticDict import googlenet_semantic_dict
import os
from svelte_python.neuron_groups import callNeuronGroups
from svelte_python.spatial_attr import callSpatialAttr
app = flask.Flask(__name__)


@app.route("/uploadImage", methods=["POST"])
@cross_origin()
def uploadImage():
    results = {'success': False}

    uploadedFile = flask.request.files['image']
    uploadedFile.save('currentImage.png')
    results['success'] = True

    return flask.jsonify(results)


@app.route("/semanticDictionary", methods=['POST'])
@cross_origin()
def semanticDictionary():
    layer = flask.request.form['layer']
    results = {'success': False}
    print(layer)

    results['activations'] = googlenet_semantic_dict(layer, "currentImage.png")

    results['success'] = True

    return flask.jsonify(results)

@app.route("/neuronGroups", methods=['POST'])
@cross_origin()
def neuronGroups():
    layer = flask.request.form['layer']
    group = flask.request.form['group']
    results = {'success':False}
    callNeuronGroups("currentImage.png", str(layer), int(group))
    results['success'] = True
    return flask.jsonify(results)

@app.route("/spatialAttribution", methods=['POST'])
@cross_origin()
def spatialAttribution():
    layer1 = flask.request.form['layer1']
    layer2 = flask.request.form['layer2']
    results = {'success':False}
    print(layer1, type(layer1), str(layer2), type(layer2))
    callSpatialAttr("currentImage.png", str(layer1), str(layer2))
    results['success'] = True
    return flask.jsonify(results)

if __name__ == "__main__":
  app.run()