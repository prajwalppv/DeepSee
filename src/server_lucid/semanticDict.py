import numpy as np
import tensorflow as tf

import lucid.modelzoo.vision_models as models
import lucid.optvis.render as render
from lucid.misc.io import show, load
import PIL
from lucid.modelzoo.vision_base import Model

class chestnet(Model):
  model_path = 'tf_chestxnet_frozen.pb'
  image_shape = [None, None, 3]
  image_value_range = (-1, 1)
  input_name = 'input_1'




#import lucid.scratch.web.svelte as lucid_svelte

layer_spritemap_sizes = {
    'mixed3a' : 16,
    'mixed3b' : 21,
    'mixed4a' : 22,
    'mixed4b' : 22,
    'mixed4c' : 22,
    'mixed4d' : 22,
    'mixed4e' : 28,
    'mixed5a' : 28,
  }


def googlenet_spritemap(layer):
  assert layer in layer_spritemap_sizes
  size = layer_spritemap_sizes[layer]
  url = "https://storage.googleapis.com/lucid-static/building-blocks/googlenet_spritemaps/sprite_%s_channel_alpha.jpeg" % layer
  return size, url

model = chestnet()
model.load_graphdef()

print(model)

googlenet = models.InceptionV1()
googlenet.load_graphdef()


def googlenet_semantic_dict(layer, imgName):
    img = PIL.Image.open(imgName)

    img = img.resize((224,224), PIL.Image.ANTIALIAS)

    # Compute the activations
    with tf.Graph().as_default(), tf.Session():
        t_input = tf.placeholder(tf.float32, [224, 224, 3])
        T = render.import_model(model, t_input, t_input)
        acts = T(layer).eval({t_input: img})[0]

    # Find the most interesting position for our initial view
    max_mag = acts.max(-1)
    max_x = np.argmax(max_mag.max(-1))
    max_y = np.argmax(max_mag[max_x])
    activations = [[[{"n": n, "v": float(act_vec[n])} for n in np.argsort(-act_vec)[:4]] for act_vec in act_slice] for act_slice in acts]
    return activations


    # Find appropriate spritemap
    spritemap_n, spritemap_url = googlenet_spritemap(layer)

    # generate_html({
    #     "spritemap_url": spritemap_url,
    #     "sprite_size": 110,
    #     "sprite_n_wrap": spritemap_n,
    #     "image_url": _image_url(img),
    #     "activations": [[[{"n": n, "v": float(act_vec[n])} for n in np.argsort(-act_vec)[:4]] for act_vec in act_slice]
    #                     for act_slice in acts],
    #     "pos": [max_y, max_x]
    # })


if __name__ == '__main__':
    # layer = sys.argv[1]
    # image = sys.argv[2]
    googlenet_semantic_dict("mixed4d", "https://i.imgur.com/8W6xjIg.jpg")
    # googlenet_semantic_dict(layer, image)