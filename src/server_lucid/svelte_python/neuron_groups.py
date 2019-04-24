import numpy as np
import tensorflow as tf
import pickle
import os
import skimage.color
import skimage.io

import lucid.modelzoo.vision_models as models
from lucid.misc.io import show
import lucid.misc.io.showing as showing
from lucid.misc.channel_reducer import ChannelReducer
import lucid.optvis.param as param
import lucid.optvis.objectives as objectives
import lucid.optvis.render as render
from lucid.misc.io import show, load
from lucid.misc.io.reading import read
from lucid.misc.io.showing import _image_url
from lucid.misc.gradient_override import gradient_override_map
from lucid.modelzoo.vision_base import Model
from lucid_svelte import generate_html

class chestnet(Model):
  model_path = 'model.pb'
  image_shape = [None, None, 3]
  image_value_range = (-1, 1)
  input_name = 'input_1'


labels = ['dummy','Atelectasis', 'Consolidation', 'Infiltration', 'Pneumothorax', 'Edema',
           'Emphysema', 'Fibrosis', 'Effusion', 'Pneumonia', 'Pleural_thickening',
          'Cardiomegaly', 'Nodule', 'Mass', 'Hernia']

def raw_class_group_attr(img, layer, label, group_vecs, model, override=None):
    """How much did spatial positions at a given layer effect a output class?"""

    # Set up a graph for doing attribution...
    with tf.Graph().as_default(), tf.Session(), gradient_override_map(override or {}):
        t_input = tf.placeholder_with_default(img, [None, None, 3])
        T = render.import_model(model, t_input, t_input)

        # Compute activations
        acts = T(layer).eval()

        if label is None: return np.zeros(acts.shape[1:-1])

        # Compute gradient
        score = T("softmax2_pre_activation")[0, labels.index(label)]
        t_grad = tf.gradients([score], [T(layer)])[0]
        grad = t_grad.eval({T(layer): acts})

        # Linear approximation of effect of spatial position
        return [np.sum(group_vec * grad) for group_vec in group_vecs]


def neuron_groups(model, img, layer, n_groups=6, attr_classes=[]):
    # Compute activations

    with tf.Graph().as_default(), tf.Session():
        t_input = tf.placeholder_with_default(img, [None, None, 3])
        T = render.import_model(model, t_input, t_input)
        acts = T(layer).eval()

    # We'll use ChannelReducer (a wrapper around scikit learn's factorization tools)
    # to apply Non-Negative Matrix factorization (NMF).

    nmf = ChannelReducer(n_groups, "PCA")
    print(layer, n_groups)
    spatial_factors = nmf.fit_transform(acts)[0].transpose(2, 0, 1).astype("float32")
    channel_factors = nmf._reducer.components_.astype("float32")

    # Let's organize the channels based on their horizontal position in the image

    x_peak = np.argmax(spatial_factors.max(1), 1)
    ns_sorted = np.argsort(x_peak)
    spatial_factors = spatial_factors[ns_sorted]
    channel_factors = channel_factors[ns_sorted]

    # And create a feature visualziation of each group

    param_f = lambda: param.image(80, batch=n_groups)
    obj = sum(objectives.direction(layer, channel_factors[i], batch=i)
              for i in range(n_groups))
    group_icons = render.render_vis(model, obj, param_f, verbose=False)[-1]

    # We'd also like to know about attribution
    #
    # First, let's turn each group into a vector over activations
    group_vecs = [spatial_factors[i, ..., None] * channel_factors[i]
                  for i in range(n_groups)]

    attrs = np.asarray([raw_class_group_attr(img, layer, attr_class, model, group_vecs)
                        for attr_class in attr_classes])

    gray_scale_groups = [skimage.color.rgb2gray(icon) for icon in group_icons]

    # Let's render the visualization!
    data = {
        "img": _image_url(img),
        "n_groups": n_groups,
        "spatial_factors": [_image_url(factor[..., None] / np.percentile(spatial_factors, 99) * [1, 0, 0]) for factor in
                            spatial_factors],
        "group_icons": [_image_url(icon) for icon in gray_scale_groups]
    }

    # with open('ng.pickle', 'wb') as handle:
    #     pickle.dump(data, handle, protocol=pickle.HIGHEST_PROTOCOL)
    # with open('./svelte_python/ng.pickle', 'rb') as p_file:
    #     data = pickle.load(p_file)

    generate_html('neuron_groups', data)


def callNeuronGroups(imageName, layer, group):
    model = chestnet()
    model.load_graphdef()
    img = load(imageName)
    neuron_groups(model, img, layer, group)

if __name__ == '__main__':
    model = chestnet()
    model.load_graphdef()
    img = load("https://i.imgur.com/Z7xW5iy.jpg")
    neuron_groups(model, img, "conv4_block4_concat/concat", 5)