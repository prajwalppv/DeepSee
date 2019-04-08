# need the following python library on the server for generatesaliency to work: https://github.com/experiencor/deep-viz-keras.git
import keras.backend as k
import matplotlib as mpl
import numpy as np

mpl.use('PS')
mpl.rcParams['figure.dpi'] = 150

from guided_backprop import GuidedBackprop
from keras.models import load_model
from matplotlib import pylab as plt
from PIL import Image
from saliency import GradientSaliency
from skimage.transform import resize


def load_image(image_file):
  image = Image.open(image_file).resize((224,224))
  image.save('currentImage.png')
  image_array = np.asarray(image.convert("RGB"))
  image_array = image_array / 255.
  return image_array


def save_image(image,file_name,grayscale=True):
    if len(image.shape) == 2 or grayscale == True:
        if len(image.shape) == 3:
            image = np.sum(np.abs(image), axis=2)
        vmax = np.percentile(image, 99)
        vmin = np.min(image)
        plt.imsave(fname=file_name, arr=image, cmap=plt.cm.gray, vmin=vmin, vmax=vmax, dpi=100)
    else:
        image = image + 127.5
        image = image.astype('uint8')
        plt.imsave(fname=file_name, arr=image, dpi=100)


def get_saliency(image_name, model_file, grad_fileName, smooth_fileName):
    success = False
    k.clear_session()
    model = load_model(model_file)

    img_input = load_image(image_name)
    img_orignal = load_image(image_name)
    img_input = np.expand_dims(img_input, axis=0)

    pred = model.predict(img_input)
    class_id = np.argmax(pred, 1)
    print("Class id predicted: ",class_id)

    vanilla = GradientSaliency(model)
    vanilla_gradient_mask = vanilla.get_mask(img_orignal)
    vanilla_smooth_gradient_mask = vanilla.get_smoothed_mask(img_orignal)

    save_image(vanilla_gradient_mask, grad_fileName)
    save_image(vanilla_smooth_gradient_mask, smooth_fileName)

    k.clear_session()
    success = True
    return success


def get_Guided_backProp(image_name, model_file, resultFile):
    k.clear_session()
    model = load_model(model_file)

    img_input = load_image(image_name)
    img_orignal = load_image(image_name)
    img_input = np.expand_dims(img_input, axis=0)

    pred = model.predict(img_input)
    class_id = np.argmax(pred, 1)
    print("Class id predicted: ", class_id)

    guided_bprop = GuidedBackprop(model)
    Guided_backProp_mask = guided_bprop.get_mask(img_orignal)
    save_image(Guided_backProp_mask, resultFile)
   
    k.clear_session()
    success = True
    return success


def main():
    # get_saliency("sample_xray_image.jpg","chest_xnet_saliency.h5")
    get_Guided_backProp("sample_xray_image.jpg","chest_xnet_saliency.h5")
    

if __name__ == "__main__":
    main()




