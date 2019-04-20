import flask
from flask_cors import CORS, cross_origin
import base64

from semanticDict import googlenet_semantic_dict


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
    results = {'success': False}

    results['activations'] = googlenet_semantic_dict('conv4_block1_concat/concat', "currentImage.png")

    results['success'] = True

    return flask.jsonify(results)

if __name__ == "__main__":
  app.run()