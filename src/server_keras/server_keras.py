import flask
from flask_cors import CORS, cross_origin
import base64
from perturbation import getRegionsofInterest
from gradientVis import get_saliency, get_Guided_backProp
from multiprocessing import Pool


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

    uploadedFile = flask.request.files['image']
    uploadedFile.save('currentImage.png')
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

    args = flask.request.headers
    widthC, heightC = int(args['widthC']), int(args['heightC'])
    class_names = args['class_names'].split(',')
    
    with Pool(1) as p:
      finalImage, region_probs = p.apply(getRegionsofInterest, ('currentImage.png', class_names, heightC, widthC))
    finalImage.save('result.jpg')

    results['success'] = True
    results['imagestr'] = convertImage2String('result.jpg')
    results['region_probs'] = region_probs
    results['origIndex'] = len(region_probs)-1
    return flask.jsonify(results)


@app.route("/saliency", methods=['POST'])
@cross_origin()
def saliency():
  results = {'success':False}
  
  grad_fileName = 'result.png'
  smooth_fileName = 'resultSmooth.png'

  with Pool(1) as p:
    p.apply(get_saliency, ('currentImage.png', 'model.h5', grad_fileName, smooth_fileName))

  results['success'] = True
  results['originalImage'] = convertImage2String('currentImage.png')
  results['imagestrSmooth'] = convertImage2String(smooth_fileName)
  results['imagestrGrad'] = convertImage2String(grad_fileName)

  return flask.jsonify(results)


@app.route("/guidedBP", methods=['POST'])
@cross_origin()
def guidedBP():
  results = {'success':False}
  
  result_fileName = 'result.png'

  with Pool(1) as p:
    p.apply(get_Guided_backProp, ('currentImage.png', 'model.h5', result_fileName))

  results['success'] = True
  results['originalImage'] = convertImage2String('currentImage.png')
  results['imagestrResult'] = convertImage2String(result_fileName)

  return flask.jsonify(results)

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5000, debug=True)