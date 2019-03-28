from PIL import Image, ImageDraw
import numpy as np
import flask
import io
import keras
from keras import backend as K
import gc
from keras.models import load_model
from flask_cors import CORS, cross_origin
from urllib.request import pathname2url
import base64

app = flask.Flask(__name__)
image = None

def createPerturbedImages(image, numchunksV, numchunksH):
  ###
  # Args: 
  #      image - the input image
  #      numchunksV - num of chunks to split the vertical axis into
  #      numchunksH - num of chunks to split the horizontal axis into
  # Returns: 
  #      perturbedImages - the images with the regions removed
  #      locs - list of locations of the top left for each perturbation region
  #               expressed as [(vertical position, horizontal position)]
  
  ###
  vert, horiz, _ = image.shape
  chunksizeV = vert//numchunksV
  chunksizeH = horiz//numchunksH
  
  perturbedImages = []
  locs = []
  v = 0
  while v < vert:
    h = 0
    while h < horiz:
      newImage = image.copy()
      newImage[v:v+chunksizeV, h:h+chunksizeH, :] = 0
      perturbedImages.append(newImage)
      locs.append((v,h))
      h += chunksizeH
    v += chunksizeV

  return perturbedImages, locs, chunksizeH, chunksizeV


def getRegionsofInterest_keras(image, numchunksV, numchunksH):
  ###
  # Args: 
  #      model_file - path to the keras model
  #      image - the input image
  #      numchunksV - num of chunks to split the vertical axis into
  #      numchunksH - num of chunks to split the horizontal axis into
  #
  # Returns: 
  #      regionsOfInterest - a list of regions expressed as 
  #                        [vert position, vert run, horiz position, horiz run]
  ###
  
  inp = np.array(image)
  perturbedImages, positions, hrun, vrun = createPerturbedImages(inp, numchunksV, numchunksH)
  inp = np.expand_dims(inp, axis=0)

  K.clear_session()
  model = load_model('./model.h5')
  correctPrediction = model.predict(inp)[0][0]

  perturbedImages = np.stack(perturbedImages, axis=0)
  perturbedPreds = model.predict_on_batch(perturbedImages).squeeze()
  print(perturbedPreds)

  regionsOfInterest = []
  for prediction, (pv, ph) in zip(perturbedPreds, positions):
    if abs(correctPrediction-prediction) > 0.3 and prediction != 0:
      regionsOfInterest.append((pv, pv+vrun, ph, ph+hrun))

  finalImage = image.copy()
  d = ImageDraw.Draw(finalImage)
  for (y0, y1, x0, x1)  in regionsOfInterest:
    d.rectangle((x0, y0, x1, y1), outline='red')

  return finalImage


@app.route("/uploadModel", methods=["POST"])
@cross_origin()
def uploadModel():
    results = {'success':False}
    K.clear_session()
    
    modelFile = flask.request.files['model']
    modelFile.save('./model.h5')
    gc.collect()

    results['success'] = True
    return flask.jsonify(results)


@app.route("/uploadImage", methods=["POST"])
@cross_origin()
def uploadImage():
    results = {'success':False}

    global image 
    uploadedFile = flask.request.files['image']
    uploadedFile.save('currentImage')
    image = Image.open('currentImage').resize((256,256))
    image = image.convert('RGB')
    image.save('./test.jpg')
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
    global image

    if True: #image is not None:
      args = flask.request.headers
      widthC, heightC = int(args['widthC']), int(args['heightC'])

      finalImage = getRegionsofInterest_keras(image, heightC, widthC)
      finalImage.save('result.jpg')
      results['success'] = True
      results['imagestr'] = convertImage2String('result.jpg')

    return flask.jsonify(results)

if __name__ == "__main__":
  app.run()