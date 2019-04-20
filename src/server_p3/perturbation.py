
import keras
from keras import backend as K
from keras.models import load_model
from PIL import Image, ImageDraw
import numpy as np


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


def getRegionsofInterest(imageLoc, numchunksV, numchunksH):
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
  
  originalImage = Image.open(imageLoc).resize((224,224))
  originalImage = originalImage.convert('RGB')
  image = np.array(originalImage) / 255.
  perturbedImages, positions, hrun, vrun = createPerturbedImages(image, numchunksV, numchunksH)
  inp = np.expand_dims(image, axis=0)

  K.clear_session()
  model = load_model('./model.h5')
  correctPrediction = model.predict(inp)[0][0]

  perturbedImages = np.stack(perturbedImages, axis=0)
  perturbedPreds = model.predict_on_batch(perturbedImages).squeeze()
  K.clear_session()

  regionsOfInterest = []
  for prediction, (pv, ph) in zip(perturbedPreds, positions):
    if abs(correctPrediction-prediction) > 0.3 and prediction != 0:
      regionsOfInterest.append((pv, pv+vrun, ph, ph+hrun))

  finalImage = originalImage.copy()
  d = ImageDraw.Draw(finalImage)
  for (y0, y1, x0, x1)  in regionsOfInterest:
    d.rectangle((x0, y0, x1, y1), outline='red')

  return finalImage
