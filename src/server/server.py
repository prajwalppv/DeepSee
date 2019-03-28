import flask
from flask_cors import CORS, cross_origin
import base64
from perturbation import getRegionsofInterest

app = flask.Flask(__name__)


@app.route("/uploadModel", methods=["POST"])
@cross_origin()
def uploadModel():
    results = {'success':False}
    
    modelFile = flask.request.files['model']
    modelFile.save('./model.h5')

    results['success'] = True
    return flask.jsonify(results)


@app.route("/uploadImage", methods=["POST"])
@cross_origin()
def uploadImage():
    results = {'success':False}

    global image 
    uploadedFile = flask.request.files['image']
    uploadedFile.save('currentImage')
    results['success'] = True
    
    return flask.jsonify(results)


def convertImage2String(inputFile):
  with open(inputFile, 'rb') as imageFile:
      result = base64.b64encode(imageFile.read()).decode('utf-8')
      return result


@app.route("/perturb", methods=['POST'])
@cross_origin()
def perturb():
    results = {'success':False}
    results['attempt'] = 50

    if True: #image is not None:
      args = flask.request.headers
      widthC, heightC = int(args['widthC']), int(args['heightC'])

      finalImage = getRegionsofInterest('currentImage', heightC, widthC)
      finalImage.save('result.jpg')
      results['success'] = True
      results['imagestr'] = convertImage2String('result.jpg')

    return flask.jsonify(results)

if __name__ == "__main__":
  app.run()