import flask
from flask_cors import CORS, cross_origin
import base64
from flask import request
from semanticDict import googlenet_semantic_dict
import os
import base64

from svelte_python.neuron_groups import callNeuronGroups
from svelte_python.spatial_attr import callSpatialAttr
from multiprocessing import Pool
from contextlib import closing
from PIL import Image

app = flask.Flask(__name__)

def convertImage2String(inputFile):
  with open(inputFile, 'rb') as imageFile:
      result = base64.b64encode(imageFile.read()).decode('utf-8')
      return result


@app.route("/uploadImage", methods=["POST"])
@cross_origin()
def uploadImage():
    results = {'success': False}
    uploadedFile = flask.request.files['image']
    uploadedFile.save('currentImage.png')

    Image.open('currentImage.png').resize((224,224)).save('currentImage.png')
    print(Image.open('currentImage.png').size)

    results['success'] = True
    return flask.jsonify(results)

@app.route("/uploadModel", methods=["POST"])
@cross_origin()
def uploadModel():
    results = {'success': False}

    modelFile = flask.request.files['model']
    modelFile.save('./model.pb')

    results['success'] = True
    return flask.jsonify(results)


@app.route("/semanticDictionary", methods=['POST'])
@cross_origin()
def semanticDictionary():
    layer = flask.request.form['layer']
    results = {'success': False}
    # print(layer)

    with closing(Pool(1)) as p:
      results['activations'] = p.apply(googlenet_semantic_dict, (layer, "currentImage.png"))
      p.terminate()

    results['imagestr'] = convertImage2String('currentImage.png')
    results['success'] = True

    return flask.jsonify(results)

@app.route("/neuronGroups", methods=['POST'])
@cross_origin()
def neuronGroups():
    layer = flask.request.form['layer']
    group = flask.request.form['group']
    results = {'success':False}
    print(Image.open('currentImage.png').size)
    with closing(Pool(1)) as p:
      p.apply(callNeuronGroups, ("currentImage.png", str(layer), int(group)))
      p.terminate()

    results['success'] = True
    return flask.jsonify(results)

@app.route("/spatialAttribution", methods=['POST'])
@cross_origin()
def spatialAttribution():
    layer1 = flask.request.form['layer1']
    layer2 = flask.request.form['layer2']
    results = {'success':False}
    # print(layer1, type(layer1), str(layer2), type(layer2))

    with closing(Pool(1)) as p:
      p.apply(callSpatialAttr, ("currentImage.png", str(layer1), str(layer2)))
      p.terminate()

    results['success'] = True
    return flask.jsonify(results)

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=8000, debug=True)