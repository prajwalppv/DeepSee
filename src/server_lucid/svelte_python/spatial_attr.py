import numpy as np
import tensorflow as tf

import lucid.modelzoo.vision_models as models
from lucid.misc.io import show
import lucid.optvis.render as render
from lucid.misc.io import show, load
from lucid.misc.io.reading import read
from lucid.misc.io.showing import _image_url
from lucid.misc.gradient_override import gradient_override_map
from lucid.modelzoo.vision_base import Model
from lucid_svelte import generate_html

class chestnet(Model):
  model_path = 'tf_chestxnet_frozen.pb'
  image_shape = [None, None, 3]
  image_value_range = (-1, 1)
  input_name = 'input_1'

model = chestnet()
model.load_graphdef()

labels = ['dummy','Atelectasis', 'Consolidation', 'Infiltration', 'Pneumothorax', 'Edema',
           'Emphysema', 'Fibrosis', 'Effusion', 'Pneumonia', 'Pleural_thickening',
          'Cardiomegaly', 'Nodule', 'Mass', 'Hernia']


def raw_class_spatial_attr(img, layer, label, override=None):
    """How much did spatial positions at a given layer effect a output class?"""

    # Set up a graph for doing attribution...
    with tf.Graph().as_default(), tf.Session(), gradient_override_map(override or {}):
        t_input = tf.placeholder_with_default(img, [None, None, 3])
        T = render.import_model(model, t_input, t_input)

        # Compute activations
        acts = T(layer).eval()

        if label is None: return np.zeros(acts.shape[1:-1])

        # Compute gradient
        score = T("predictions/Sigmoid")[0, labels.index(label)]
        t_grad = tf.gradients([score], [T(layer)])[0]
        grad = t_grad.eval({T(layer): acts})

        # Linear approximation of effect of spatial position
        return np.sum(acts * grad, -1)[0]


def raw_spatial_spatial_attr(img, layer1, layer2, override=None):
    """Attribution between spatial positions in two different layers."""

    # Set up a graph for doing attribution...
    with tf.Graph().as_default(), tf.Session(), gradient_override_map(override or {}):
        t_input = tf.placeholder_with_default(img, [None, None, 3])
        T = render.import_model(model, t_input, t_input)

        # Compute activations
        acts1 = T(layer1).eval()
        acts2 = T(layer2).eval({T(layer1): acts1})

        # Construct gradient tensor
        # Backprop from spatial position (n_x, n_y) in layer2 to layer1.
        n_x, n_y = tf.placeholder("int32", []), tf.placeholder("int32", [])
        layer2_mags = tf.sqrt(tf.reduce_sum(T(layer2) ** 2, -1))[0]
        score = layer2_mags[n_x, n_y]
        t_grad = tf.gradients([score], [T(layer1)])[0]

        # Compute attribution backwards from each positin in layer2
        attrs = []
        for i in range(acts2.shape[1]):
            attrs_ = []
            for j in range(acts2.shape[2]):
                grad = t_grad.eval({n_x: i, n_y: j, T(layer1): acts1})
                # linear approximation of imapct
                attr = np.sum(acts1 * grad, -1)[0]
                attrs_.append(attr)
            attrs.append(attrs_)
    return np.asarray(attrs)

def orange_blue(a,b,clip=False):
  if clip:
    a,b = np.maximum(a,0), np.maximum(b,0)
  arr = np.stack([a, (a + b)/2., b], -1)
  arr /= 1e-2 + np.abs(arr).max()/1.5
  arr += 0.3
  return arr


def image_url_grid(grid):
    return [[_image_url(img) for img in line] for line in grid]


def spatial_spatial_attr(img, layer1, layer2, hint_label_1=None, hint_label_2=None, override=None):
    hint1 = orange_blue(
        raw_class_spatial_attr(img, layer1, hint_label_1, override=override),
        raw_class_spatial_attr(img, layer1, hint_label_2, override=override),
        clip=True
    )
    hint2 = orange_blue(
        raw_class_spatial_attr(img, layer2, hint_label_1, override=override),
        raw_class_spatial_attr(img, layer2, hint_label_2, override=override),
        clip=True
    )

    attrs = raw_spatial_spatial_attr(img, layer1, layer2, override=override)
    attrs = attrs / attrs.max()

    data = {
        "spritemap1": image_url_grid(attrs),
        "spritemap2": image_url_grid(attrs.transpose(2, 3, 0, 1)),
        "size1": attrs.shape[3],
        "layer1": layer1,
        "size2": attrs.shape[0],
        "layer2": layer2,
        "img": _image_url(img),
        "hint1": _image_url(hint1),
        "hint2": _image_url(hint2)
    }
    generate_html('spatial_attr', data)

def callSpatialAttr(imageName, layer1, layer2):
    # img = load("https://i.imgur.com/Z7xW5iy.jpg")
    #
    # spatial_spatial_attr(img, "conv4_block1_concat/concat", "conv5_block1_concat/concat", hint_label_1="Atelectasis",
    #                      hint_label_2="Consolidation")
    img = load(imageName)
    spatial_spatial_attr(img, layer1, layer2, hint_label_1="Atelectasis", hint_label_2="Consolidation")

if __name__=="__main__":
    img = load("https://i.imgur.com/Z7xW5iy.jpg")

    spatial_spatial_attr(img, "conv4_block1_concat/concat", "conv5_block1_concat/concat", hint_label_1="Atelectasis",
                         hint_label_2="Consolidation")