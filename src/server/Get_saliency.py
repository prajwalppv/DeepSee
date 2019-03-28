# need the following python library on the server for generatesaliency to work: https://github.com/experiencor/deep-viz-keras.git
from PIL import Image
from skimage.transform import resize
import numpy as np
from keras.models import load_model
from viz.saliency import GradientSaliency
from viz.guided_backprop import GuidedBackprop
from matplotlib import pylab as plt
import matplotlib as mpl
import keras.backend as k
mpl.rcParams['figure.dpi'] = 150


def load_image(image_file):
  image = Image.open(image_file)
  image_array = np.asarray(image.convert("RGB"))
  image_array = image_array / 255.
  image_array = resize(image_array, (224, 224))
  return image_array


def save_image(image,file_name,grayscale=True):
    if len(image.shape) == 2 or grayscale == True:
        if len(image.shape) == 3:
            image = np.sum(np.abs(image), axis=2)
        vmax = np.percentile(image, 99)
        vmin = np.min(image)
        plt.imsave(fname=file_name + ".png", arr=image, cmap=plt.cm.gray, vmin=vmin, vmax=vmax, dpi=100)
    else:
        image = image + 127.5
        image = image.astype('uint8')
        plt.imsave(fname=file_name + ".png", arr=image, dpi=100)

def clearKerasSession():
    k.clear_session()
    print("cleared keras session")


def get_saliency(image_name,model_file):
    success = False
    model = load_model(model_file)
    model.summary()
    img_input = load_image(image_name)
    img_orignal = load_image(image_name)
    img_input = np.expand_dims(img_input, axis=0)
    pred = model.predict(img_input)
    class_id = np.argmax(pred, 1)
    print("Class id predicted: ",class_id)
    vanilla = GradientSaliency(model)
    vanilla_gradient_mask = vanilla.get_mask(img_orignal)
    vanilla_smooth_gradient_mask = vanilla.get_smoothed_mask(img_orignal)
    save_image(vanilla_gradient_mask,"VanillaGradient")
    save_image(vanilla_smooth_gradient_mask,"VanillaSmoothGradient")
    clearKerasSession()
    success = True
    return success

def get_Guided_backProp(image_name,model_file):
    model = load_model(model_file)
    model.summary()
    img_input = load_image(image_name)
    img_orignal = load_image(image_name)
    img_input = np.expand_dims(img_input, axis=0)
    pred = model.predict(img_input)
    class_id = np.argmax(pred, 1)
    print("Class id predicted: ", class_id)
    guided_bprop = GuidedBackprop(model)
    Guided_backProp_mask = guided_bprop.get_mask(img_orignal)
    save_image(Guided_backProp_mask, "GuidedBackProp")
    clearKerasSession()
    success = True
    return success

def main():
    # get_saliency("sample_xray_image.jpg","chest_xnet_saliency.h5")
    get_Guided_backProp("sample_xray_image.jpg","chest_xnet_saliency.h5")
if __name__ == "__main__":
    main()




